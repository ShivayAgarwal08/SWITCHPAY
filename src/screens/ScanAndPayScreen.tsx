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
import {paymentProcessor} from '../engine/paymentProcessor/paymentProcessor';
import {colors, radius, spacing} from '../theme';
import type {QRCodePayload} from '../models';

type Props = NativeStackScreenProps<RootStackParamList, 'ScanAndPay'>;

export default function ScanAndPayScreen({navigation}: Props) {
  const {wallet, networkStatus, paymentMode, refreshWallet, refreshTransactions} = useSession();
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [scannedId, setScannedId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [bleStatus, setBleStatus] = useState<string>('');

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
        setScannedId(payload.switchPayId);
      } else {
        Alert.alert('Invalid QR', 'Not a valid SwitchPay QR code.');
      }
    } catch {
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

    setLoading(true);
    setBleStatus('');
    
    try {
      // Show BLE status for edge mode
      if (paymentMode === 'EDGE_MODE') {
        setBleStatus('Initializing Bluetooth...');
        await new Promise<void>(resolve => setTimeout(resolve, 500));
        
        setBleStatus('Searching for recipient device...');
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        setBleStatus('Connecting via SwitchPay Edge...');
        await new Promise<void>(resolve => setTimeout(resolve, 800));
        
        setBleStatus('Sending offline payment...');
        await new Promise<void>(resolve => setTimeout(resolve, 600));
      }

      const result = await paymentProcessor.processPayment(wallet, {
        recipientSwitchPayId: scannedId,
        amount: val,
      });

      setBleStatus('');
      await refreshWallet();
      await refreshTransactions();

      if (result.success && result.transaction) {
        navigation.navigate('PaymentResult', {
          success: true,
          transactionId: result.transactionId,
          amount: result.transaction.amount,
          recipientSwitchPayId: result.transaction.receiverSwitchPayId,
          paymentRoute: result.route,
          transactionStatus: result.transaction.status,
          timestamp: result.transaction.timestamp,
        });
      } else {
        navigation.navigate('PaymentResult', {
          success: false,
          error: result.error || 'Payment failed',
        });
      }
    } catch {
      setBleStatus('');
      navigation.navigate('PaymentResult', {
        success: false,
        error: 'Payment failed. Please try again.',
      });
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

          {bleStatus ? (
            <View style={styles.block}>
              <View style={styles.bleStatusCard}>
                <Text style={styles.bleStatusText}>{bleStatus}</Text>
              </View>
            </View>
          ) : null}

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
  bleStatusCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
  },
  bleStatusText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

