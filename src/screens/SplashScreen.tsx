import React, {useEffect, useRef} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {useSession} from '../store/SessionContext';
import {colors, radius, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_MIN_DURATION_MS = 1600;

export default function SplashScreen({navigation}: Props) {
  const {isLoading, wallet} = useSession();
  const startTime = useRef(Date.now());

  useEffect(() => {
    if (!isLoading) {
      const elapsed = Date.now() - startTime.current;
      const remaining = Math.max(0, SPLASH_MIN_DURATION_MS - elapsed);
      
      const timer = setTimeout(() => {
        if (wallet) {
          navigation.replace('WalletDashboard');
        } else {
          navigation.replace('Onboarding');
        }
      }, remaining);
      
      return () => clearTimeout(timer);
    }
  }, [isLoading, wallet, navigation]);

  return (
    <ScreenContainer center>
      <View style={styles.mark}>
        <Text style={styles.markText}>S</Text>
      </View>
      <Text style={styles.brand}>SWITCHPAY</Text>
      <Text style={styles.tagline}>
        Payments that switch when the network doesn't.
      </Text>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    height: 64,
    justifyContent: 'center',
    marginBottom: spacing.lg,
    width: 64,
  },
  markText: {
    color: colors.textPrimary,
    fontSize: 34,
    fontWeight: '800',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: 2,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
});
