import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View} from 'react-native';
import AppHeader from '../components/AppHeader';
import PaymentModeBadge from '../components/PaymentModeBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import {useSession} from '../store/SessionContext';
import {DEMO_MERCHANT} from '../store/demoConfig';
import {colors, radius, spacing} from '../theme';

export default function ScanAndPayScreen() {
  const {networkStatus, paymentMode} = useSession();
  const [amount, setAmount] = useState('200');

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle="Scan & Pay" networkStatus={networkStatus} />

      <View style={styles.block}>
        <SectionTitle>Scan merchant QR</SectionTitle>
        <View style={styles.scanArea}>
          <Text style={styles.scanText}>CAMERA SCANNER</Text>
          <Text style={styles.scanSubtext}>Added in a later phase</Text>
        </View>
      </View>

      <View style={styles.block}>
        <SectionTitle>Merchant</SectionTitle>
        <View style={styles.card}>
          <Text style={styles.merchantName}>{DEMO_MERCHANT.name}</Text>
          <Text style={styles.merchantId}>{DEMO_MERCHANT.id}</Text>
        </View>
      </View>

      <View style={styles.block}>
        <SectionTitle>Amount</SectionTitle>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.textMuted}
            style={styles.amountInput}
            value={amount}
          />
        </View>
      </View>

      <View style={styles.block}>
        <PaymentModeBadge mode={paymentMode} />
      </View>

      <View style={styles.block}>
        <PrimaryButton
          label="PAY"
          disabled
          hint="Disabled until the Payment Orchestrator can execute a route."
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.lg,
  },
  scanArea: {
    alignItems: 'center',
    aspectRatio: 1.4,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    justifyContent: 'center',
  },
  scanText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  scanSubtext: {
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
  merchantName: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  merchantId: {
    color: colors.textSecondary,
    fontSize: 12,
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
    fontSize: 30,
    fontWeight: '700',
  },
  amountInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 30,
    fontWeight: '700',
    paddingVertical: spacing.sm,
  },
});
