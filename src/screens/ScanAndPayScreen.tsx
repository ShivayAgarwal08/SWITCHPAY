import React, {useState, useEffect} from 'react';
import {StyleSheet, Text, TextInput, View, Alert, PermissionsAndroid, Platform} from 'react-native';
import {Camera} from 'react-native-camera-kit';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import AppHeader from '../components/AppHeader';
import PaymentModeBadge from '../components/PaymentModeBadge';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SectionTitle from '../components/SectionTitle';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {walletService} from '../services/wallet/walletService';
import {transactionService} from '../services/transaction/transactionService';
import {colors, radius, spacing} from '../theme';
import type {QRCodePayload} from '../models';
import {v4 as uuidv4} from 'uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanAndPay'>;

export default function ScanAndPayScreen({navigation}: Props) {
  const {wallet, networkStatus, paymentMode, refreshWallet, refreshTransactions} = useSession();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
        );
        setHasPermission(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        setHasPermission(true);
      }
    })();
  }, []);

  const handleBarcodeRead = (event: any) => {
    if (scannedId) return;
    try {
      const payload: QRCodePayload = JSON.parse(event.nativeEvent.codeStringValue);
      if (payload.type === 'SWITCHPAY_WALLET' && payload.switchPayId) {
        if (payload.switchPayId === wallet?.switchPayId) {
          Alert.alert('Error', 'You cannot send money to yourself.');
          return;
        }
        setScannedId(payload.switchPayId);
      } else {
        Alert.alert('Invalid QR', 'Not a valid SwitchPay QR code.');
      }
    } catch (e) {
      Alert.alert('Invalid QR', 'Not a valid SwitchPay QR code.');
    }
  };

  const handlePay = async () => {
    if (!wallet || !scannedId) return;

    const val = parseInt(amount, 10);
    if (isNaN(val) || val <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    if (val > wallet.balance) {
      Alert.alert('Error', 'Insufficient balance.');
      return;
    }

    setLoading(true);
    try {
      // Deduct balance locally
      await walletService.updateWalletBalance(-val);

      // Record transaction
      await transactionService.addTransaction({
        transactionId: uuidv4(),
        amount: val,
        senderSwitchPayId: wallet.switchPayId,
        receiverSwitchPayId: scannedId,
        mode: paymentMode,
        status: 'LOCAL_CONFIRMED', // Confirmed locally as there's no backend
        timestamp: Date.now(),
      });

      await refreshWallet();
      await refreshTransactions();

      Alert.alert('Success', `Sent ₹${val} to ${scannedId}`, [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (e) {
      Alert.alert('Error', 'Payment failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!wallet) return null;

  return (
    <ScreenContainer scroll>
      <AppHeader subtitle="Scan & Pay" networkStatus={networkStatus} />

      {!scannedId ? (
        <View style={styles.block}>
          <SectionTitle>Scan merchant QR</SectionTitle>
          <View style={styles.scanArea}>
            {hasPermission ? (
              <Camera
                style={styles.camera}
                scanBarcode={true}
                onReadCode={handleBarcodeRead}
                showFrame={true}
                laserColor={colors.primary}
                frameColor="white"
              />
            ) : (
              <Text style={styles.scanText}>Waiting for camera permission...</Text>
            )}
          </View>
        </View>
      ) : (
        <>
          <View style={styles.block}>
            <SectionTitle>Recipient</SectionTitle>
            <View style={styles.card}>
              <Text style={styles.merchantId}>{scannedId}</Text>
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
              label={loading ? 'PROCESSING...' : 'PAY'}
              onPress={handlePay}
              disabled={loading || !amount}
            />
            <View style={{marginTop: spacing.md}}>
              <PrimaryButton
                label="CANCEL / RESCAN"
                onPress={() => {
                  setScannedId(null);
                  setAmount('');
                }}
                disabled={loading}
              />
            </View>
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  block: {
    marginTop: spacing.lg,
  },
  scanArea: {
    aspectRatio: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  scanText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  merchantId: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
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

