import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import RoleCard from '../components/RoleCard';
import ScreenContainer from '../components/ScreenContainer';
import type {Role} from '../models';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {colors, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

export default function RoleSelectionScreen({navigation}: Props) {
  const {setRole} = useSession();

  const choose = (role: Role) => {
    setRole(role);
    navigation.navigate(
      role === 'CUSTOMER' ? 'CustomerDashboard' : 'MerchantDashboard',
    );
  };

  return (
    <ScreenContainer center>
      <Text style={styles.brand}>SwitchPay</Text>
      <Text style={styles.title}>How are you using SwitchPay?</Text>
      <View style={styles.cards}>
        <RoleCard
          title="CUSTOMER"
          description="Scan a merchant QR and pay"
          onPress={() => choose('CUSTOMER')}
        />
        <View style={styles.gap} />
        <RoleCard
          title="MERCHANT"
          description="Show a QR and receive payments"
          onPress={() => choose('MERCHANT')}
        />
      </View>
      <Text style={styles.note}>
        Demo role selector — no account or sign-in is used.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  brand: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  cards: {
    marginTop: spacing.xl,
  },
  gap: {
    height: spacing.md,
  },
  note: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.lg,
  },
});
