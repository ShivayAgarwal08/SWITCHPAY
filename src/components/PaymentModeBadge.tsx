import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {PAYMENT_MODE_LABEL, type PaymentMode} from '../models';
import {colors, radius, spacing} from '../theme';

interface Props {
  mode: PaymentMode;
  compact?: boolean;
}

const DESCRIPTION: Record<PaymentMode, string> = {
  ONLINE_MODE: 'Payment routed over the Internet',
  EDGE_MODE: 'Internet unavailable — routed device to device',
};

export default function PaymentModeBadge({mode, compact}: Props) {
  const edge = mode === 'EDGE_MODE';
  const tint = edge ? colors.edge : colors.online;
  const surface = edge ? colors.edgeSurface : colors.onlineSurface;

  return (
    <View style={[styles.card, {backgroundColor: surface, borderColor: tint}]}>
      <Text style={styles.caption}>PAYMENT ROUTE</Text>
      <Text style={[styles.mode, {color: tint}]}>{PAYMENT_MODE_LABEL[mode]}</Text>
      {!compact && <Text style={styles.description}>{DESCRIPTION[mode]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  caption: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  mode: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: spacing.xs,
  },
});
