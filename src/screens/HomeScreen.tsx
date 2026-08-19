import React from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from '../theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.brand}>SwitchPay</Text>
        <Text style={styles.tagline}>
          Adaptive payments that switch routes when the network does.
        </Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Phase 1</Text>
          <Text style={styles.cardBody}>
            Project foundation only. Payment orchestration, Edge Mode and the
            offline wallet are not implemented yet.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1,
  },
  tagline: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cardBody: {
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.xs,
  },
});
