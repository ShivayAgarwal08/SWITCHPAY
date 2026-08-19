import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type {NetworkStatus, PaymentMode, Wallet, Transaction} from '../models';
import {selectPaymentMode} from '../engine/orchestrator/selectPaymentMode';
import {networkStatusService} from '../services/network/networkStatusService';
import {walletService} from '../services/wallet/walletService';
import {transactionService} from '../services/transaction/transactionService';

interface SessionState {
  wallet: Wallet | null;
  transactions: Transaction[];
  networkStatus: NetworkStatus;
  paymentMode: PaymentMode;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  setNetworkStatus: (status: NetworkStatus) => void;
  isLoading: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({children}: {children: React.ReactNode}) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [networkStatus, setNetworkStatusState] = useState<NetworkStatus>(
    networkStatusService.getStatus(),
  );

  const refreshWallet = useCallback(async () => {
    const loadedWallet = await walletService.loadWallet();
    setWallet(loadedWallet);
  }, []);

  const refreshTransactions = useCallback(async () => {
    const loadedTransactions = await transactionService.loadTransactions();
    setTransactions(loadedTransactions);
  }, []);

  useEffect(() => {
    async function loadInitialData() {
      await refreshWallet();
      await refreshTransactions();
      setIsLoading(false);
    }
    loadInitialData();
  }, [refreshWallet, refreshTransactions]);

  useEffect(() => networkStatusService.subscribe(setNetworkStatusState), []);

  const setNetworkStatus = useCallback((status: NetworkStatus) => {
    networkStatusService.setStatus(status);
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      wallet,
      transactions,
      networkStatus,
      paymentMode: selectPaymentMode(networkStatus),
      refreshWallet,
      refreshTransactions,
      setNetworkStatus,
      isLoading,
    }),
    [
      wallet,
      transactions,
      networkStatus,
      refreshWallet,
      refreshTransactions,
      setNetworkStatus,
      isLoading,
    ],
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
