import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NetworkStatus} from '../models';
import {networkStatusService} from '../services/network/networkStatusService';
import {colors, radius, spacing} from '../theme';

const OPTIONS: NetworkStatus[] = ['ONLINE', 'OFFLINE'];

/**
 * Development-only override for connectivity state. This component is never
 * rendered in release builds and is clearly labeled so it cannot be mistaken
 * for a user-facing mode switch.
 */
export default function DevNetworkControls({status}: {status: NetworkStatus}) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>DEV ONLY: OVERRIDE NETWORK STATE</Text>
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const active = option === status;
          return (
            <Pressable
              key={option}
              onPress={() => networkStatusService.setStatus(option)}
              style={[styles.option, active && styles.optionActive]}>
              <Text
                style={[
                  styles.optionText,
                  active && styles.optionTextActive,
                ]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>
        Production UI never exposes this control. Remove __DEV__ flag before
        release.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.danger,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  row: {
    flexDirection: 'row',
    marginTop: spacing.sm,
  },
  option: {
    borderColor: colors.border,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginRight: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
  },
  optionActive: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  optionText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  optionTextActive: {
    color: colors.textPrimary,
  },
  note: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: spacing.sm,
  },
});
