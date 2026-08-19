import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import AppHeader from '../components/AppHeader';
import ScreenContainer from '../components/ScreenContainer';
import TransactionList from '../components/TransactionList';
import {useSession} from '../store/SessionContext';
import {colors, spacing} from '../theme';

export default function TransactionsScreen() {
  const {networkStatus, transactions, wallet} = useSession();

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle="All Transactions" networkStatus={networkStatus} />
      
      <View style={styles.block}>
        {transactions.length > 0 ? (
          <TransactionList
            transactions={transactions}
            currentSwitchPayId={wallet?.switchPayId}
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
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
