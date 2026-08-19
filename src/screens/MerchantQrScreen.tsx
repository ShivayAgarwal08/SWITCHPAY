import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import AppHeader from '../components/AppHeader';
import PaymentModeBadge from '../components/PaymentModeBadge';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import {useSession} from '../store/SessionContext';
import {DEMO_MERCHANT} from '../store/demoConfig';
import {colors, radius, spacing} from '../theme';

export default function MerchantQrScreen() {
  const {networkStatus, paymentMode} = useSession();
  const [amount, setAmount] = useState('');

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle={DEMO_MERCHANT.name} networkStatus={networkStatus} />

      <View style={styles.block}>
        <View style={styles.qrArea}>
          <Text style={styles.qrText}>QR CODE PLACEHOLDER</Text>
          <Text style={styles.qrSubtext}>Generated in a later phase</Text>
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.card}>
          <Text style={styles.label}>MERCHANT ID</Text>
          <Text style={styles.value}>{DEMO_MERCHANT.id}</Text>
        </View>
      </View>

      <View style={styles.block}>
        <SectionTitle>Amount (optional)</SectionTitle>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setAmount}
            placeholder="Any amount"
            placeholderTextColor={colors.textMuted}
            style={styles.amountInput}
            value={amount}
          />
        </View>
      </View>

      <View style={styles.block}>
        <PaymentModeBadge mode={paymentMode} compact />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.lg,
  },
  qrArea: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
  },
  qrText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  qrSubtext: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.xs,
  },
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
  value: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 2,
  },
  amountRow: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
  },
  currency: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  amountInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    paddingVertical: spacing.sm,
  },
});
