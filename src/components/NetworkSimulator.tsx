import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import type {NetworkStatus} from '../models';
import {colors, radius, spacing} from '../theme';

interface Props {
  status: NetworkStatus;
  onChange: (status: NetworkStatus) => void;
}

const OPTIONS: NetworkStatus[] = ['ONLINE', 'OFFLINE'];

/**
 * Stands in for real connectivity detection so the route switch can be shown.
 * It sets the UI network state only; it is not a manual payment-mode switch and
 * is removed once device connectivity detection lands.
 */
export default function NetworkSimulator({status, onChange}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>SIMULATED CONNECTIVITY (PLACEHOLDER)</Text>
      <View style={styles.row}>
        {OPTIONS.map(option => {
          const active = option === status;
          return (
            <Pressable
              accessibilityRole="button"
              accessibilityState={{selected: active}}
              key={option}
              onPress={() => onChange(option)}
              style={[styles.option, active && styles.optionActive]}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.note}>
        Real device connectivity detection replaces this control in a later
        phase. The route below always follows this state — never a manual mode
        switch.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderStyle: 'dashed',
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: colors.textMuted,
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
