import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {NETWORK_STATUS_LABEL, type NetworkStatus} from '../models';
import {colors, radius, spacing} from '../theme';

export default function NetworkStatusPill({status}: {status: NetworkStatus}) {
  const online = status === 'ONLINE';
  const tint = online ? colors.online : colors.danger;

  return (
    <View style={[styles.pill, {borderColor: tint}]}>
      <View style={[styles.dot, {backgroundColor: tint}]} />
      <Text style={[styles.label, {color: tint}]}>
        {NETWORK_STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 1,
  },
  dot: {
    borderRadius: radius.pill,
    height: 7,
    marginRight: spacing.xs + 2,
    width: 7,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
