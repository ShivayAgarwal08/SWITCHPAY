export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  WalletDashboard: undefined;
  ScanAndPay: undefined;
  MyQr: undefined;
  Transactions: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
