import type {PaymentRequest} from '../paymentProcessor';

export interface RouteResult {
  success: boolean;
  error?: string;
}

/**
 * Edge Route - Architectural Preparation
 *
 * IMPORTANT: This is architectural preparation for Phase 6 (BLE).
 * It does NOT implement:
 * - Bluetooth Low Energy (BLE)
 * - Device-to-device communication
 * - Real offline payment transfer to another phone
 *
 * For Phase 5, this route:
 * - Receives the payment request
 * - Returns a clearly defined result
 * - Indicates its current demo/local state
 * - Does NOT falsely claim that another physical device received the money
 *
 * Phase 6 will replace or extend this route with real BLE transport.
 */
export const edgeRoute = {
  async execute(
    _request: PaymentRequest,
    _transactionId: string,
    _senderSwitchPayId: string,
  ): Promise<RouteResult> {
    // Simulate local processing for demo purposes
    await new Promise<void>(resolve => setTimeout(resolve, 300));

    // Demo: Return success to indicate local processing completed
    // In production (Phase 6+), this would:
    // 1. Initialize BLE connection
    // 2. Discover recipient device
    // 3. Transfer payment data via BLE
    // 4. Confirm receipt from recipient device
    // 5. Handle offline transaction synchronization
    
    return {
      success: true,
    };
  },
};
