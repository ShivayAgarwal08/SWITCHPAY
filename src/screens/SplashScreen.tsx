import React, {useEffect} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import ScreenContainer from '../components/ScreenContainer';
import type {RootStackParamList} from '../navigation/types';
import {colors, radius, spacing} from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SPLASH_DURATION_MS = 1600;

export default function SplashScreen({navigation}: Props) {
  useEffect(() => {
    const timer = setTimeout(
      () => navigation.replace('RoleSelection'),
      SPLASH_DURATION_MS,
    );
    return () => clearTimeout(timer);
  }, [navigation]);

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
