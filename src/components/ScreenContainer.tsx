import React from 'react';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {colors, spacing} from '../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  center?: boolean;
}

export default function ScreenContainer({children, scroll, center}: Props) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.lg,
  };

  if (scroll) {
    return (
      <ScrollView
        style={styles.root}
        contentContainerStyle={[styles.content, padding]}>
        {children}
      </ScrollView>
    );
  }

  return (
    <View style={[styles.root, styles.content, padding, center && styles.center]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  center: {
    justifyContent: 'center',
  },
});
