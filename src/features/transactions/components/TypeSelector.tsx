import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TransactionTypeFilter } from '../hooks/useTransactions';

interface TypeSelectorProps {
  selectedType: TransactionTypeFilter;
  onSelectType: (type: TransactionTypeFilter) => void;
}

const TABS: { label: string; value: TransactionTypeFilter; activeColor: string }[] = [
  { label: 'Semua', value: 'all', activeColor: '#FFD165' },
  { label: 'Keluar', value: 1, activeColor: '#EF4444' },
  { label: 'Masuk', value: 0, activeColor: '#10B981' },
  { label: 'Transfer', value: 2, activeColor: '#FFD165' },
];

export function TypeSelector({ selectedType, onSelectType }: TypeSelectorProps) {
  return (
    <View style={styles.container}>
      <View style={styles.segmentedContainer}>
        {TABS.map((tab) => {
          const isSelected = selectedType === tab.value;

          return (
            <TouchableOpacity
              key={String(tab.value)}
              style={[
                styles.tabButton,
                isSelected && styles.tabButtonActive,
              ]}
              onPress={() => onSelectType(tab.value)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.tabLabel,
                  isSelected && { color: tab.activeColor, fontWeight: '700' },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 4,
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: '#131316',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.25)',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  tabButtonActive: {
    backgroundColor: '#222227',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  tabLabel: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#71717A',
    letterSpacing: 0.2,
  },
});
