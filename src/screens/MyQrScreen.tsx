import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import AppHeader from '../components/AppHeader';
import PaymentModeBadge from '../components/PaymentModeBadge';
import ScreenContainer from '../components/ScreenContainer';
import {useSession} from '../store/SessionContext';
import {colors, radius, spacing} from '../theme';
import type {QRCodePayload} from '../models';

export default function MyQrScreen() {
  const {wallet, networkStatus, paymentMode} = useSession();

  if (!wallet) return null;

  const qrPayload: QRCodePayload = {
    type: 'SWITCHPAY_WALLET',
    switchPayId: wallet.switchPayId,
  };

  const qrValue = JSON.stringify(qrPayload);

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle={wallet.name} networkStatus={networkStatus} />

      <View style={styles.block}>
        <View style={styles.qrContainer}>
          <QRCode
            value={qrValue}
            size={220}
            color={colors.primary}
            backgroundColor={colors.surface}
          />
        </View>
      </View>

      <View style={styles.block}>
        <View style={styles.card}>
          <Text style={styles.label}>SWITCHPAY ID</Text>
          <Text style={styles.value}>{wallet.switchPayId}</Text>
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
  qrContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
});
