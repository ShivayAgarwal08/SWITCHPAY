import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import type {RootStackParamList} from '../navigation/types';
import {colors, radius, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'PaymentResult'>;

export default function PaymentResultScreen({route, navigation}: Props) {
  const {success, transactionId, amount, recipientSwitchPayId, paymentRoute, transactionStatus, timestamp} = route.params;

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleString();
  };

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle="Payment Result" />

      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, success ? styles.success : styles.failure]}>
          {success ? 'PAYMENT SUCCESSFUL' : 'PAYMENT FAILED'}
        </Text>
      </View>

      {success && (
        <>
          <View style={styles.block}>
            <SectionTitle>Transaction Details</SectionTitle>
            <View style={styles.card}>
              <View style={styles.row}>
                <Text style={styles.label}>Amount</Text>
                <Text style={styles.value}>₹{amount}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Transaction ID</Text>
                <Text style={styles.value}>{transactionId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Recipient</Text>
                <Text style={styles.value}>{recipientSwitchPayId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Payment Route</Text>
                <Text style={styles.value}>{paymentRoute}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Status</Text>
                <Text style={styles.value}>{transactionStatus}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Timestamp</Text>
                <Text style={styles.value}>{timestamp ? formatDate(timestamp) : 'N/A'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.block}>
            <PrimaryButton
              label="BACK TO WALLET"
              onPress={() => navigation.navigate('WalletDashboard')}
            />
          </View>
        </>
      )}

      {!success && (
        <>
          <View style={styles.block}>
            <SectionTitle>Error</SectionTitle>
            <View style={styles.card}>
              <Text style={styles.errorText}>
                {route.params.error || 'Payment failed. Please try again.'}
              </Text>
            </View>
          </View>

          <View style={styles.block}>
            <PrimaryButton
              label="TRY AGAIN"
              onPress={() => navigation.goBack()}
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    alignItems: 'center',
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  success: {
    color: colors.primary,
  },
  failure: {
    color: '#FF4444',
  },
  block: {
    marginTop: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  value: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
});
