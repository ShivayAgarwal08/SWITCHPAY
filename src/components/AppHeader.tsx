import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import type {NetworkStatus} from '../models';
import {colors} from '../theme';
import NetworkStatusPill from './NetworkStatusPill';

interface Props {
  subtitle?: string;
  networkStatus: NetworkStatus;
}

export default function AppHeader({subtitle, networkStatus}: Props) {
  return (
    <View style={styles.row}>
      <View>
        <Text style={styles.brand}>SwitchPay</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <NetworkStatusPill status={networkStatus} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
});
