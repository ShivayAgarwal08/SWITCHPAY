import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PAYMENT_MODE_LABEL, type Transaction} from '../models';
import {colors, radius, spacing} from '../theme';
import {formatAmount, formatTimestamp} from '../utils/format';

interface Props {
  transactions: Transaction[];
  currentSwitchPayId?: string;
  emptyMessage?: string;
}

export default function TransactionList({transactions, currentSwitchPayId, emptyMessage}: Props) {
  if (transactions.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No transactions yet</Text>
        <Text style={styles.emptyBody}>
          {emptyMessage ?? 'Transactions appear here once you send or receive money.'}
        </Text>
      </View>
    );
  }

  return (
    <View>
      {transactions.map(transaction => {
        const isSent = transaction.senderSwitchPayId === currentSwitchPayId;
        const otherParty = isSent ? `To: ${transaction.receiverSwitchPayId}` : `From: ${transaction.senderSwitchPayId}`;
        const prefix = isSent ? '-' : '+';
        const amountColor = isSent ? colors.textPrimary : colors.primary;

        return (
          <View key={transaction.transactionId} style={styles.row}>
            <View style={styles.rowMain}>
              <Text style={styles.counterparty}>{otherParty}</Text>
              <Text style={styles.meta}>
                {PAYMENT_MODE_LABEL[transaction.mode]} ·{' '}
                {formatTimestamp(transaction.timestamp)}
              </Text>
              <Text style={styles.id}>{transaction.transactionId}</Text>
            </View>
            <View style={styles.rowSide}>
              <Text style={[styles.amount, {color: amountColor}]}>
                {prefix}{formatAmount(transaction.amount)}
              </Text>
              <Text style={styles.status}>{transaction.status}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  emptyBody: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  row: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  rowMain: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  rowSide: {
    alignItems: 'flex-end',
  },
  counterparty: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  id: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});
