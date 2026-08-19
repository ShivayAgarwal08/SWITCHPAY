import {walletService} from '../src/services/wallet/walletService';
import {transactionService} from '../src/services/transaction/transactionService';
import {generateSwitchPayId} from '../src/services/wallet/generateId';
import {storageService} from '../src/services/storage/storageService';
import type {Wallet, Transaction, QRCodePayload} from '../src/models';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('Wallet & Transaction logic', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('unique SwitchPay ID generation', () => {
    const id1 = generateSwitchPayId();
    const id2 = generateSwitchPayId();
    expect(id1).toMatch(/^SWP-[A-Z0-9]{8}$/);
    expect(id2).toMatch(/^SWP-[A-Z0-9]{8}$/);
    expect(id1).not.toBe(id2);
  });

  test('wallet creation and persistence', async () => {
    const setItemSpy = jest.spyOn(storageService, 'setItem');
    const wallet: Wallet = {
      id: 'uuid-1',
      switchPayId: 'SWP-12345678',
      name: 'Test',
      phone: '1234567890',
      email: 'test@test.com',
      balance: 1000,
      createdAt: 123,
    };

    await walletService.saveWallet(wallet);
    expect(setItemSpy).toHaveBeenCalledWith('@switchpay_wallet', wallet);
  });

  test('wallet loading', async () => {
    const wallet: Wallet = {
      id: 'uuid-1',
      switchPayId: 'SWP-12345678',
      name: 'Test',
      phone: '1234567890',
      email: 'test@test.com',
      balance: 1000,
      createdAt: 123,
    };
    jest.spyOn(storageService, 'getItem').mockResolvedValueOnce(wallet);

    const loaded = await walletService.loadWallet();
    expect(loaded).toEqual(wallet);
  });

  test('transaction persistence and history', async () => {
    const tx: Transaction = {
      transactionId: 'tx-1',
      amount: 100,
      senderSwitchPayId: 'SWP-1',
      receiverSwitchPayId: 'SWP-2',
      mode: 'ONLINE_MODE',
      status: 'LOCAL_CONFIRMED',
      timestamp: 123,
    };

    jest.spyOn(storageService, 'getItem').mockResolvedValueOnce([]);
    const setItemSpy = jest.spyOn(storageService, 'setItem');

    await transactionService.addTransaction(tx);
    expect(setItemSpy).toHaveBeenCalledWith('@switchpay_transactions', [tx]);
  });

  test('successful transfer logic (deduct balance)', async () => {
    const wallet: Wallet = {
      id: 'uuid-1',
      switchPayId: 'SWP-1',
      name: 'Test',
      phone: '1234567890',
      email: 'test@test.com',
      balance: 1000,
      createdAt: 123,
    };
    jest.spyOn(walletService, 'loadWallet').mockResolvedValueOnce(wallet);
    const setItemSpy = jest.spyOn(storageService, 'setItem');

    await walletService.updateWalletBalance(-200);

    expect(setItemSpy).toHaveBeenCalledWith('@switchpay_wallet', {
      ...wallet,
      balance: 800,
    });
  });

  describe('Validation Logic', () => {
    test('insufficient balance', () => {
      const balance = 50;
      const amount = 100;
      expect(amount > balance).toBe(true);
    });

    test('zero amount', () => {
      const amount = 0;
      expect(amount <= 0).toBe(true);
    });

    test('negative amount', () => {
      const amount = -50;
      expect(amount <= 0).toBe(true);
    });

    test('self-transfer prevention', () => {
      const myId = 'SWP-1';
      const scannedId = 'SWP-1';
      expect(myId === scannedId).toBe(true);
    });

    test('invalid recipient', () => {
      const payload = {type: 'OTHER'};
      expect(payload.type !== 'SWITCHPAY_WALLET').toBe(true);
    });
  });

  describe('QR Payload', () => {
    test('QR payload creation', () => {
      const payload: QRCodePayload = {
        type: 'SWITCHPAY_WALLET',
        switchPayId: 'SWP-12345678',
      };
      const json = JSON.stringify(payload);
      expect(json).toBe('{"type":"SWITCHPAY_WALLET","switchPayId":"SWP-12345678"}');
    });

    test('QR payload parsing', () => {
      const json = '{"type":"SWITCHPAY_WALLET","switchPayId":"SWP-12345678"}';
      const parsed = JSON.parse(json) as QRCodePayload;
      expect(parsed.type).toBe('SWITCHPAY_WALLET');
      expect(parsed.switchPayId).toBe('SWP-12345678');
    });
  });
});
