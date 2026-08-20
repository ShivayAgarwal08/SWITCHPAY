import type {PaymentRequest} from '../paymentProcessor';
import {bluetoothService} from '../../../services/bluetooth/bluetoothService';
import {
  createPaymentRequest,
  createPaymentAck,
  type SwitchPayBLEMessage,
  type PaymentRejectedMessage,
} from '../../../services/bluetooth/bluetoothProtocol';

export interface RouteResult {
  success: boolean;
  error?: string;
}

/**
 * Edge Route - Real BLE Payment Transport
 *
 * Phase 6 Implementation:
 * - Uses real Bluetooth Low Energy (BLE) for device-to-device communication
 * - Implements actual offline payment transfer to another phone
 * - Integrates with the BLE service layer for scanning, connection, and messaging
 * - Handles payment request, validation, and acknowledgement flow
 *
 * Process:
 * 1. Initialize BLE connection
 * 2. Discover recipient device by SwitchPay ID
 * 3. Connect to the correct device
 * 4. Send payment request via BLE
 * 5. Wait for recipient response (accept/reject)
 * 6. Handle transaction acknowledgement
 * 7. Return structured result to payment processor
 *
 * Note: The sender wallet is NOT permanently deducted until BLE transfer succeeds.
 * Transaction state remains consistent across failures.
 */
export const edgeRoute = {
  async execute(
    request: PaymentRequest,
    transactionId: string,
    senderSwitchPayId: string,
  ): Promise<RouteResult> {
    try {
      // Step 1: Initialize BLE
      const initResult = await bluetoothService.initialize();
      if (!initResult.success) {
        return {
          success: false,
          error: `BLE initialization failed: ${initResult.error}`,
        };
      }

      // Step 2: Check Bluetooth availability
      const isAvailable = await bluetoothService.isBluetoothAvailable();
      if (!isAvailable) {
        return {
          success: false,
          error: 'Bluetooth is not available or powered on',
        };
      }

      // Step 3: Discover recipient device
      const scanResult = await bluetoothService.scanForDevices(request.recipientSwitchPayId);
      
      if (!scanResult.foundTarget || !scanResult.targetDevice) {
        return {
          success: false,
          error: 'Recipient device not found via BLE',
        };
      }

      // Step 4: Connect to recipient device
      const connectionResult = await bluetoothService.connectToDevice(scanResult.targetDevice);
      if (!connectionResult.success) {
        return {
          success: false,
          error: `Failed to connect to recipient: ${connectionResult.error}`,
        };
      }

      // Step 5: Set up response handler
      let responseReceived = false;
      let paymentAccepted = false;

      const responsePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (!responseReceived) {
            bluetoothService.offMessage('PAYMENT_ACCEPTED');
            bluetoothService.offMessage('PAYMENT_REJECTED');
            reject(new Error('Payment response timeout'));
          }
        }, 30000); // 30 second timeout

        // Handle payment accepted
        bluetoothService.onMessage('PAYMENT_ACCEPTED', (message: SwitchPayBLEMessage) => {
          if (message.transactionId === transactionId) {
            clearTimeout(timeout);
            responseReceived = true;
            paymentAccepted = true;
            bluetoothService.offMessage('PAYMENT_ACCEPTED');
            bluetoothService.offMessage('PAYMENT_REJECTED');
            resolve();
          }
        });

        // Handle payment rejected
        bluetoothService.onMessage('PAYMENT_REJECTED', (message: SwitchPayBLEMessage) => {
          if (message.transactionId === transactionId) {
            clearTimeout(timeout);
            responseReceived = true;
            paymentAccepted = false;
            bluetoothService.offMessage('PAYMENT_ACCEPTED');
            bluetoothService.offMessage('PAYMENT_REJECTED');
            const rejectedMessage = message as PaymentRejectedMessage;
            reject(new Error(rejectedMessage.errorMessage || 'Payment rejected by recipient'));
          }
        });
      });

      // Step 6: Send payment request
      const paymentRequest = createPaymentRequest(
        transactionId,
        senderSwitchPayId,
        request.recipientSwitchPayId,
        request.amount
      );

      const sendResult = await bluetoothService.sendMessage(paymentRequest);
      if (!sendResult.success) {
        await bluetoothService.disconnect();
        return {
          success: false,
          error: `Failed to send payment request: ${sendResult.error}`,
        };
      }

      // Step 7: Wait for recipient response
      try {
        await responsePromise;
      } catch (error) {
        await bluetoothService.disconnect();
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Payment response failed',
        };
      }

      // Step 8: Handle response
      if (!paymentAccepted) {
        await bluetoothService.disconnect();
        return {
          success: false,
          error: 'Payment was rejected by recipient',
        };
      }

      // Step 9: Send acknowledgement
      const ackMessage = createPaymentAck(
        transactionId,
        senderSwitchPayId,
        request.recipientSwitchPayId,
        request.amount
      );

      const ackResult = await bluetoothService.sendMessage(ackMessage);
      if (!ackResult.success) {
        console.warn('Failed to send payment acknowledgement:', ackResult.error);
        // Continue anyway - payment was already accepted
      }

      // Step 10: Mark transaction as complete
      bluetoothService.markTransactionComplete(transactionId);

      // Step 11: Disconnect
      await bluetoothService.disconnect();

      return {
        success: true,
      };
    } catch (error) {
      // Ensure cleanup on error
      await bluetoothService.disconnect();
      return {
        success: false,
        error: error instanceof Error ? error.message : 'BLE payment failed',
      };
    }
  },
};
