import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className="px-4 my-1">
      <View className="flex-row bg-surface-dark rounded-[14px] p-1 border border-gold/20">
        {TABS.map((tab) => {
          const isSelected = selectedType === tab.value;

          return (
            <TouchableOpacity
              key={String(tab.value)}
              className={`flex-1 py-2 items-center justify-center rounded-[11px] ${
                isSelected ? 'bg-[#222227] shadow-sm' : ''
              }`}
              onPress={() => onSelectType(tab.value)}
              activeOpacity={0.75}
            >
              <Text
                className="font-manrope-semibold text-xs tracking-wide text-zinc-500"
                style={isSelected ? { color: tab.activeColor, fontWeight: '700' } : undefined}
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
