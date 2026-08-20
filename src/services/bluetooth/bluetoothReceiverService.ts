/**
 * Bluetooth Receiver Service
 * 
 * Handles the receiver side of BLE payment processing.
 * This service listens for incoming payment requests and processes them.
 */

import type {SwitchPayBLEMessage, PaymentRequestMessage} from './bluetoothProtocol';
import {createPaymentAccepted, createPaymentRejected} from './bluetoothProtocol';
import {bluetoothService} from './bluetoothService';
import {walletService} from '../wallet/walletService';
import {transactionService} from '../transaction/transactionService';

export interface ReceiverPaymentResult {
  success: boolean;
  error?: string;
  transactionId?: string;
  amount?: number;
  senderSwitchPayId?: string;
}

/**
 * Receiver Service for handling incoming BLE payments
 */
class BluetoothReceiverService {
  private mySwitchPayId: string | null = null;
  private isListening: boolean = false;
  private pendingRequests: Map<string, PaymentRequestMessage> = new Map();

  /**
   * Initialize the receiver service
   */
  async initialize(mySwitchPayId: string): Promise<void> {
    this.mySwitchPayId = mySwitchPayId;
    await bluetoothService.initialize();

    // Set up message handlers
    this.setupMessageHandlers();
  }

  /**
   * Set up message handlers for different message types
   */
  private setupMessageHandlers(): void {
    // Handle payment requests
    bluetoothService.onMessage('PAYMENT_REQUEST', this.handlePaymentRequest.bind(this));
    
    // Handle acknowledgements
    bluetoothService.onMessage('PAYMENT_ACK', this.handlePaymentAck.bind(this));
  }

  /**
   * Handle incoming payment request
   */
  private async handlePaymentRequest(message: SwitchPayBLEMessage): Promise<void> {
    const paymentRequest = message as PaymentRequestMessage;

    console.log('Received payment request:', paymentRequest);

    // Validate that the request is for this receiver
    if (paymentRequest.receiverSwitchPayId !== this.mySwitchPayId) {
      console.log('Payment request not for this device, ignoring');
      return;
    }

    // Check for duplicate transaction
    const existingTransactions = await transactionService.loadTransactions();
    const isDuplicate = existingTransactions.some(
      tx => tx.transactionId === paymentRequest.transactionId
    );

    if (isDuplicate) {
      console.log('Duplicate transaction ID, rejecting');
      await this.sendPaymentRejected(paymentRequest, 'Duplicate transaction');
      return;
    }

    // Store pending request
    this.pendingRequests.set(paymentRequest.transactionId, paymentRequest);

    // In a real implementation, this would trigger a UI prompt to accept/reject
    // For now, we auto-accept for the prototype
    await this.processPaymentRequest(paymentRequest);
  }

  /**
   * Process a payment request (accept it)
   */
  private async processPaymentRequest(paymentRequest: PaymentRequestMessage): Promise<ReceiverPaymentResult> {
    try {
      // Validate sender has sufficient balance (optional for receiver)
      // For the prototype, we'll trust the sender has validated this

      // Create transaction record for receiver
      const transaction = {
        transactionId: paymentRequest.transactionId,
        amount: paymentRequest.amount,
        senderSwitchPayId: paymentRequest.senderSwitchPayId,
        receiverSwitchPayId: paymentRequest.receiverSwitchPayId,
        mode: 'EDGE_MODE' as const,
        status: 'LOCAL_CONFIRMED' as const,
        timestamp: Date.now(),
      };

      // Record transaction
      await transactionService.addTransaction(transaction);

      // Update receiver wallet balance
      await walletService.updateWalletBalance(paymentRequest.amount);

      // Send acceptance to sender
      await this.sendPaymentAccepted(paymentRequest);

      // Remove from pending
      this.pendingRequests.delete(paymentRequest.transactionId);

      return {
        success: true,
        transactionId: paymentRequest.transactionId,
        amount: paymentRequest.amount,
        senderSwitchPayId: paymentRequest.senderSwitchPayId,
      };
    } catch (error) {
      console.error('Failed to process payment request:', error);
      await this.sendPaymentRejected(paymentRequest, 'Processing failed');
      this.pendingRequests.delete(paymentRequest.transactionId);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Send payment acceptance to sender
   */
  private async sendPaymentAccepted(paymentRequest: PaymentRequestMessage): Promise<void> {
    const acceptedMessage = createPaymentAccepted(
      paymentRequest.transactionId,
      paymentRequest.senderSwitchPayId,
      paymentRequest.receiverSwitchPayId,
      paymentRequest.amount
    );

    const result = await bluetoothService.sendMessage(acceptedMessage);
    if (!result.success) {
      console.error('Failed to send payment acceptance:', result.error);
    }
  }

  /**
   * Send payment rejection to sender
   */
  private async sendPaymentRejected(paymentRequest: PaymentRequestMessage, reason: string): Promise<void> {
    const rejectedMessage = createPaymentRejected(
      paymentRequest.transactionId,
      paymentRequest.senderSwitchPayId,
      paymentRequest.receiverSwitchPayId,
      paymentRequest.amount,
      reason
    );

    const result = await bluetoothService.sendMessage(rejectedMessage);
    if (!result.success) {
      console.error('Failed to send payment rejection:', result.error);
    }
  }

  /**
   * Handle payment acknowledgement from sender
   */
  private async handlePaymentAck(message: SwitchPayBLEMessage): Promise<void> {
    console.log('Received payment acknowledgement:', message);

    // Mark transaction as synced
    try {
      const transactions = await transactionService.loadTransactions();
      const transaction = transactions.find(tx => tx.transactionId === message.transactionId);

      if (transaction) {
        // Update transaction status to SYNCED
        const updatedTransaction = {
          ...transaction,
          status: 'SYNCED' as const,
        };

        // Remove old transaction and add updated one
        await transactionService.removeTransaction(message.transactionId);
        await transactionService.addTransaction(updatedTransaction);

        // Mark as complete in BLE service
        bluetoothService.markTransactionComplete(message.transactionId);
      }
    } catch (error) {
      console.error('Failed to handle payment acknowledgement:', error);
    }
  }

  /**
   * Start listening for incoming payments
   */
  async startListening(): Promise<void> {
    if (this.isListening) {
      return;
    }

    this.isListening = true;
    console.log('Started listening for BLE payments');
  }

  /**
   * Stop listening for incoming payments
   */
  async stopListening(): Promise<void> {
    if (!this.isListening) {
      return;
    }

    this.isListening = false;
    console.log('Stopped listening for BLE payments');
  }

  /**
   * Get pending payment requests
   */
  getPendingRequests(): PaymentRequestMessage[] {
    return Array.from(this.pendingRequests.values());
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    await this.stopListening();
    this.pendingRequests.clear();
    
    bluetoothService.offMessage('PAYMENT_REQUEST');
    bluetoothService.offMessage('PAYMENT_ACK');
  }
}

// Export singleton instance
export const bluetoothReceiverService = new BluetoothReceiverService();

// Export class for testing
export {BluetoothReceiverService};