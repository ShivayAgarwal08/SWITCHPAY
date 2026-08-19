import React from 'react';
import {StyleSheet, Text, View, TouchableOpacity} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import PaymentModeBadge from '../components/PaymentModeBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import TransactionList from '../components/TransactionList';
import WalletBalance from '../components/WalletBalance';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {colors, radius, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'WalletDashboard'>;

export default function WalletDashboardScreen({navigation}: Props) {
  const {wallet, transactions, networkStatus, paymentMode} = useSession();

  if (!wallet) return null;

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle="SwitchPay Wallet" networkStatus={networkStatus} />

      <View style={styles.walletCard}>
        <Text style={styles.name}>{wallet.name}</Text>
        <Text style={styles.id}>{wallet.switchPayId}</Text>
      </View>

      <View style={styles.block}>
        <PaymentModeBadge mode={paymentMode} />
      </View>

      <View style={styles.block}>
        <WalletBalance amount={wallet.balance} />
      </View>

      <View style={styles.actions}>
        <View style={styles.actionCol}>
          <PrimaryButton
            label="Send Money"
            onPress={() => navigation.navigate('ScanAndPay')}
          />
        </View>
        <View style={styles.actionCol}>
          <PrimaryButton
            label="My QR"
            onPress={() => navigation.navigate('MyQr')}
          />
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.rowBetween}>
          <SectionTitle>Recent transactions</SectionTitle>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {transactions.length > 0 ? (
          <TransactionList
            transactions={transactions.slice(0, 5)}
            currentSwitchPayId={wallet.switchPayId}
          />
        ) : (
          <Text style={styles.emptyText}>No transactions yet.</Text>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.lg,
  },
  walletCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  id: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  actionCol: {
    flex: 1,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
