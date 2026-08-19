import type {Wallet} from '../../models';
import {storageService} from '../storage/storageService';

const WALLET_KEY = '@switchpay_wallet';

export const walletService = {
  async saveWallet(wallet: Wallet): Promise<void> {
    await storageService.setItem(WALLET_KEY, wallet);
  },

  async loadWallet(): Promise<Wallet | null> {
    return await storageService.getItem<Wallet>(WALLET_KEY);
  },

  async updateWalletBalance(amountDiff: number): Promise<void> {
    const wallet = await this.loadWallet();
    if (wallet) {
      wallet.balance += amountDiff;
      await this.saveWallet(wallet);
    }
  },
};
