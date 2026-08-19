import React from 'react';
import {StyleSheet, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import DevNetworkControls from '../components/DevNetworkControls';
import PaymentModeBadge from '../components/PaymentModeBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import TransactionList from '../components/TransactionList';
import WalletBalance from '../components/WalletBalance';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {
  DEMO_MERCHANT,
  DEMO_MERCHANT_BALANCE,
  DEMO_TRANSACTIONS,
} from '../store/demoConfig';
import {spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MerchantDashboard'>;

export default function MerchantDashboardScreen({navigation}: Props) {
  const {networkStatus, paymentMode} = useSession();

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle={DEMO_MERCHANT.name} networkStatus={networkStatus} />

      <View style={styles.block}>
        <PaymentModeBadge mode={paymentMode} />
      </View>

      {__DEV__ && (
        <View style={styles.block}>
          <DevNetworkControls status={networkStatus} />
        </View>
      )}

      <View style={styles.block}>
        <WalletBalance amount={DEMO_MERCHANT_BALANCE} />
      </View>

      <View style={styles.block}>
        <PrimaryButton
          label="Show QR"
          onPress={() => navigation.navigate('MerchantQr')}
        />
      </View>

      <View style={styles.block}>
        <SectionTitle>Recent transactions</SectionTitle>
        <TransactionList
          transactions={DEMO_TRANSACTIONS}
          emptyMessage="Received payments appear here once the offline route is implemented."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.lg,
  },
});
