import NetInfo from '@react-native-community/netinfo';
import type {NetworkStatus} from '../../models';

type Listener = (status: NetworkStatus) => void;

/**
 * Real connectivity detection for Android using @react-native-community/netinfo.
 *
 * The service exposes an initial status from NetInfo and a subscription for
 * later changes. A later phase can drop the manual override hook without
 * changing consumers.
 */
class NetworkStatusService {
  private status: NetworkStatus = 'ONLINE';
  private listeners = new Set<Listener>();
  private unsubscribe?: () => void;

  constructor() {
    NetInfo.fetch().then(state => {
      this.emit(this.fromNetInfo(state));
    });

    this.unsubscribe = NetInfo.addEventListener(state => {
      this.emit(this.fromNetInfo(state));
    });
  }

  getStatus(): NetworkStatus {
    return this.status;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Manual override intended for development and automated tests only.
   * The production UI does not expose this control.
   */
  setStatus(status: NetworkStatus): void {
    this.emit(status);
  }

  private fromNetInfo(state: {
    isConnected?: boolean | null;
    isInternetReachable?: boolean | null;
  }): NetworkStatus {
    // NetInfo can report null while it is still determining state.
    // Keep the previous status in that case to avoid flicker.
    const isConnected = state.isConnected;
    const isReachable = state.isInternetReachable;

    if (isConnected === false || isReachable === false) {
      return 'OFFLINE';
    }

    if (isConnected === true) {
      // Treat null/undefined isInternetReachable as online-ish once isConnected is true.
      return 'ONLINE';
    }

    return this.status;
  }

  private emit(status: NetworkStatus): void {
    if (status === this.status) {
      return;
    }
    this.status = status;
    this.listeners.forEach(listener => listener(status));
  }
}

export const networkStatusService = new NetworkStatusService();
export const IS_NETWORK_DETECTION_SIMULATED = false;
