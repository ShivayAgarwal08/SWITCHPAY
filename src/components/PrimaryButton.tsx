import React from 'react';
import {Pressable, StyleSheet, Text, View} from 'react-native';
import {colors, radius, spacing} from '../theme';

interface Props {
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
  hint?: string;
}

export default function PrimaryButton({
  label,
  onPress,
  disabled,
  variant = 'primary',
  hint,
}: Props) {
  const secondary = variant === 'secondary';

  return (
    <View>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{disabled: !!disabled}}
        disabled={disabled}
        onPress={onPress}
        style={({pressed}) => [
          styles.button,
          secondary && styles.buttonSecondary,
          disabled && styles.buttonDisabled,
          pressed && !disabled && styles.buttonPressed,
        ]}>
        <Text
          style={[
            styles.label,
            secondary && styles.labelSecondary,
            disabled && styles.labelDisabled,
          ]}>
          {label}
        </Text>
      </Pressable>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: 'center',
    paddingVertical: spacing.md,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonDisabled: {
    backgroundColor: colors.surfaceAlt,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  label: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  labelSecondary: {
    color: colors.textSecondary,
  },
  labelDisabled: {
    color: colors.textMuted,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
