export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  WalletDashboard: undefined;
  ScanAndPay: undefined;
  MyQr: undefined;
  Transactions: undefined;
  PaymentResult: {
    success: boolean;
    transactionId?: string;
    amount?: number;
    recipientSwitchPayId?: string;
    paymentRoute?: string;
    transactionStatus?: string;
    timestamp?: number;
    error?: string;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
