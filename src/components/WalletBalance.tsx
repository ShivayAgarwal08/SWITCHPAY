import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from '../theme';
import {formatAmount} from '../utils/format';

interface Props {
  amount: number;
  caption?: string;
}

export default function WalletBalance({amount, caption}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>WALLET BALANCE</Text>
      <Text style={styles.amount}>{formatAmount(amount)}</Text>
      <Text style={styles.caption}>
        {caption ?? 'Closed-loop demo wallet — not real bank money'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  amount: {
    color: colors.textPrimary,
    fontSize: 38,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  caption: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});
