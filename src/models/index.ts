export type Role = 'CUSTOMER' | 'MERCHANT';

export type NetworkStatus = 'ONLINE' | 'OFFLINE';

export type PaymentMode = 'ONLINE_MODE' | 'EDGE_MODE';

export type TransactionStatus = 'PENDING' | 'LOCAL_CONFIRMED' | 'SYNCED' | 'FAILED';

export type TransactionDirection = 'SENT' | 'RECEIVED';

export interface Transaction {
  transactionId: string;
  amount: number;
  senderSwitchPayId: string;
  receiverSwitchPayId: string;
  mode: PaymentMode;
  status: TransactionStatus;
  timestamp: number;
}

export interface Wallet {
  id: string;
  switchPayId: string;
  name: string;
  phone: string;
  email: string;
  balance: number;
  createdAt: number;
}

export interface QRCodePayload {
  type: 'SWITCHPAY_WALLET';
  switchPayId: string;
}

export interface Merchant {
  id: string;
  name: string;
}

export const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = {
  ONLINE_MODE: 'ONLINE MODE',
  EDGE_MODE: 'EDGE MODE',
};

export const NETWORK_STATUS_LABEL: Record<NetworkStatus, string> = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
};

