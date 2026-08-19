export type RootStackParamList = {
  Splash: undefined;
  RoleSelection: undefined;
  CustomerDashboard: undefined;
  ScanAndPay: undefined;
  MerchantDashboard: undefined;
  MerchantQr: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
