import type {NetworkStatus} from '../../models';

type Listener = (status: NetworkStatus) => void;

/**
 * UI placeholder for connectivity detection.
 *
 * It reports a status that is set from the UI instead of observing the device.
 * A later phase replaces the body of this module with real Android
 * connectivity detection; the interface below is what the rest of the app
 * consumes and is not expected to change.
 */
class PlaceholderNetworkStatusService {
  private status: NetworkStatus = 'ONLINE';
  private listeners = new Set<Listener>();

  getStatus(): NetworkStatus {
    return this.status;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Placeholder-only entry point: real detection will emit these internally. */
  setStatus(status: NetworkStatus): void {
    if (status === this.status) {
      return;
    }
    this.status = status;
    this.listeners.forEach(listener => listener(status));
  }
}

export const networkStatusService = new PlaceholderNetworkStatusService();
export const IS_NETWORK_DETECTION_SIMULATED = true;
