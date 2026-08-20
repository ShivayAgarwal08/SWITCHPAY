import React, {useState} from 'react';
import {StyleSheet, Text, TextInput, View, Alert} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {generateSwitchPayId} from '../services/wallet/generateId';
import {walletService} from '../services/wallet/walletService';
import {colors, radius, spacing} from '../theme';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({navigation}: Props) {
  const {refreshWallet} = useSession();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [balanceStr, setBalanceStr] = useState('1000');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Validation Error', 'Name cannot be empty');
      return;
    }
    if (!phone || phone.length < 10) {
      Alert.alert('Validation Error', 'Please enter a valid phone number');
      return;
    }
    if (!email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }
    const balance = parseInt(balanceStr, 10);
    if (isNaN(balance) || balance < 0) {
      Alert.alert('Validation Error', 'Initial balance must be 0 or more');
      return;
    }

    setLoading(true);
    try {
      const newWallet = {
        id: uuidv4(),
        switchPayId: generateSwitchPayId(),
        name: trimmedName,
        phone,
        email,
        balance,
        createdAt: Date.now(),
      };
      await walletService.saveWallet(newWallet);
      await refreshWallet();
      navigation.replace('WalletDashboard');
    } catch {
      Alert.alert('Error', 'Could not create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Create your Demo Wallet</Text>
        <Text style={styles.subtitle}>Enter details to get your unique SwitchPay ID</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Shivay Agarwal"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 9876543210"
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. shivay@example.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Text style={styles.label}>Initial Demo Balance (₹)</Text>
        <TextInput
          style={styles.input}
          placeholder="1000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={balanceStr}
          onChangeText={setBalanceStr}
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={loading ? 'Creating...' : 'CREATE WALLET'}
          onPress={handleCreate}
          disabled={loading}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 16,
    padding: spacing.md,
  },
  footer: {
    marginTop: spacing.xxl,
  },
});
