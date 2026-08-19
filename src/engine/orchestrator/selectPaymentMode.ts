import type {NetworkStatus, PaymentMode} from '../../models';

/**
 * Route selection rule of the Payment Orchestrator: the mode follows network
 * availability, never a user toggle.
 *
 * Later phases extend the orchestrator with route health and execution; this
 * function stays the single place where a mode is chosen.
 */
export function selectPaymentMode(networkStatus: NetworkStatus): PaymentMode {
  return networkStatus === 'ONLINE' ? 'ONLINE_MODE' : 'EDGE_MODE';
}
