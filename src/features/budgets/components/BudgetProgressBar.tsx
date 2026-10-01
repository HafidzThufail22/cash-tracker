import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BudgetStatus } from '../../../database/repositories/budgetRepo';

interface BudgetProgressBarProps {
  percentage: number;
  status: BudgetStatus;
  height?: number;
}

export function BudgetProgressBar({
  percentage,
  status,
  height = 6,
}: BudgetProgressBarProps) {
  const clampedWidth = Math.min(100, Math.max(0, percentage));

  const fillColor =
    status === 'overbudget'
      ? '#EF4444'
      : status === 'warning'
      ? '#F59E0B'
      : '#EAB308'; // Emas untuk kondisi aman

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedWidth}%`,
            backgroundColor: fillColor,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    backgroundColor: '#27272A',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
