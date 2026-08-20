import type {PaymentRequest} from '../paymentProcessor';

export interface RouteResult {
  success: boolean;
  error?: string;
}

/**
 * Online Route - Demo Implementation
 *
 * IMPORTANT: This is a demo route only for Phase 5.
 * It does NOT implement:
 * - Real UPI integration
 * - Bank integration
 * - Payment gateway
 * - Backend payment processing
 *
 * The route simulates successful processing for demonstration purposes.
 * In a production environment, this would integrate with actual payment infrastructure.
 *
 * Phase 6+ will replace or extend this with real payment processing.
 */
export const onlineRoute = {
  async execute(
    _request: PaymentRequest,
    _transactionId: string,
    _senderSwitchPayId: string,
  ): Promise<RouteResult> {
    // Simulate network delay for demo purposes
    await new Promise<void>(resolve => setTimeout(() => resolve(), 500));

    // Demo: Always return success
    // In production, this would:
    // 1. Call payment gateway API
    // 2. Validate with bank
    // 3. Process UPI transaction
    // 4. Handle actual payment response
    
    return {
      success: true,
    };
  },
};
