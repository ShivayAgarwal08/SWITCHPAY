import React from 'react';
import {StyleSheet, Text} from 'react-native';
import {colors, spacing} from '../theme';

export default function SectionTitle({children}: {children: string}) {
  return <Text style={styles.title}>{children}</Text>;
}

const styles = StyleSheet.create({
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
});
