import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {NetworkStatus, PaymentMode, Role} from '../models';
import {selectPaymentMode} from '../engine/orchestrator/selectPaymentMode';
import {networkStatusService} from '../services/network/networkStatusService';

interface SessionState {
  role: Role | null;
  networkStatus: NetworkStatus;
  paymentMode: PaymentMode;
  setRole: (role: Role) => void;
  clearRole: () => void;
  setNetworkStatus: (status: NetworkStatus) => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({children}: {children: React.ReactNode}) {
  const [role, setRoleState] = useState<Role | null>(null);
  const [networkStatus, setNetworkStatusState] = useState<NetworkStatus>(
    networkStatusService.getStatus(),
  );

  useEffect(() => networkStatusService.subscribe(setNetworkStatusState), []);

  const setNetworkStatus = useCallback((status: NetworkStatus) => {
    networkStatusService.setStatus(status);
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      role,
      networkStatus,
      paymentMode: selectPaymentMode(networkStatus),
      setRole: setRoleState,
      clearRole: () => setRoleState(null),
      setNetworkStatus,
    }),
    [role, networkStatus, setNetworkStatus],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionState {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used inside a SessionProvider');
  }
  return value;
}
