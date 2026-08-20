import type {Wallet} from '../../models';
import {networkStatusService} from '../../services/network/networkStatusService';
import {walletService} from '../../services/wallet/walletService';
import {transactionService} from '../../services/transaction/transactionService';
import {selectPaymentMode} from '../orchestrator/selectPaymentMode';
import {onlineRoute} from './routes/onlineRoute';
import {edgeRoute} from './routes/edgeRoute';
import {v4 as uuidv4} from 'uuid';

export interface PaymentRequest {
  recipientSwitchPayId: string;
  amount: number;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  route: 'ONLINE' | 'EDGE';
  transaction?: {
    transactionId: string;
    amount: number;
    senderSwitchPayId: string;
    receiverSwitchPayId: string;
    mode: 'ONLINE_MODE' | 'EDGE_MODE';
    status: 'PENDING' | 'LOCAL_CONFIRMED' | 'SYNCED' | 'FAILED';
    timestamp: number;
  };
}

/**
 * Central payment processing layer.
 *
 * Responsibilities:
 * - Validate payment request (recipient, amount, balance)
 * - Prevent self-payment
 * - Select appropriate route based on network status
 * - Execute payment through selected route
 * - Record transaction
 * - Update wallet safely
 * - Return structured result
 */
export const paymentProcessor = {
  async processPayment(
    senderWallet: Wallet,
    request: PaymentRequest,
  ): Promise<PaymentResult> {
    // 1. Validate recipient
    if (!request.recipientSwitchPayId || request.recipientSwitchPayId.trim() === '') {
      return {
        success: false,
        error: 'Invalid recipient SwitchPay ID',
        route: 'ONLINE',
      };
    }

    // 2. Prevent self-payment
    if (request.recipientSwitchPayId === senderWallet.switchPayId) {
      return {
        success: false,
        error: 'Cannot send money to yourself',
        route: 'ONLINE',
      };
    }

    // 3. Validate amount
    if (request.amount <= 0) {
      return {
        success: false,
        error: 'Amount must be greater than zero',
        route: 'ONLINE',
      };
    }

    // 4. Validate sufficient balance
    if (request.amount > senderWallet.balance) {
      return {
        success: false,
        error: 'Insufficient balance',
        route: 'ONLINE',
      };
    }

    // 5. Generate unique transaction ID
    const transactionId = uuidv4();

    // 6. Check for duplicate transaction ID
    const existingTransactions = await transactionService.loadTransactions();
    if (existingTransactions.some(tx => tx.transactionId === transactionId)) {
      return {
        success: false,
        error: 'Transaction ID conflict. Please try again.',
        route: 'ONLINE',
      };
    }

    // 7. Determine route based on network status
    const networkStatus = networkStatusService.getStatus();
    const paymentMode = selectPaymentMode(networkStatus);
    const route = paymentMode === 'ONLINE_MODE' ? 'ONLINE' : 'EDGE';

    // 8. Execute selected route
    const routeResult =
      route === 'ONLINE'
        ? await onlineRoute.execute(request, transactionId, senderWallet.switchPayId)
        : await edgeRoute.execute(request, transactionId, senderWallet.switchPayId);

    if (!routeResult.success) {
      return {
        success: false,
        error: routeResult.error || 'Payment failed',
        route,
      };
    }

    // 9. Create transaction record
    const transaction = {
      transactionId,
      amount: request.amount,
      senderSwitchPayId: senderWallet.switchPayId,
      receiverSwitchPayId: request.recipientSwitchPayId,
      mode: paymentMode,
      status: 'LOCAL_CONFIRMED' as const,
      timestamp: Date.now(),
    };

    try {
      // 10. Record transaction first
      await transactionService.addTransaction(transaction);

      // 11. Update wallet balance only after successful transaction recording
      await walletService.updateWalletBalance(-request.amount);

      return {
        success: true,
        transactionId,
        route,
        transaction,
      };
    } catch {
      // If transaction recording or wallet update fails, return failure
      // This ensures we don't leave the wallet in an inconsistent state
      return {
        success: false,
        error: 'Failed to record transaction. Please try again.',
        route,
      };
    }
  },
};
