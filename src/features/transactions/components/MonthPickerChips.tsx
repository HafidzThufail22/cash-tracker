import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { AvailableMonth } from '../../../database/repositories/transactionRepo';

interface MonthPickerChipsProps {
  months: AvailableMonth[];
  selectedYear: number;
  selectedMonth: number;
  onSelectMonth: (year: number, month: number) => void;
  onOpenCalendarModal?: () => void;
}

export function MonthPickerChips({
  months,
  selectedYear,
  selectedMonth,
  onSelectMonth,
  onOpenCalendarModal,
}: MonthPickerChipsProps) {
  return (
    <View className="my-0.5 flex-row items-center gap-2">
      {onOpenCalendarModal && (
        <TouchableOpacity
          className="w-[38px] h-[38px] rounded-full bg-surface border border-border items-center justify-center"
          onPress={onOpenCalendarModal}
          activeOpacity={0.7}
          accessibilityLabel="Pilih bulan dan tahun"
          accessibilityRole="button"
        >
          <Calendar size={17} color="#FFD165" strokeWidth={2.2} />
        </TouchableOpacity>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, alignItems: 'center', paddingRight: 8 }}
      >
        {months.map((item) => {
          const isSelected = item.year === selectedYear && item.month === selectedMonth;

          return (
            <TouchableOpacity
              key={item.key}
              className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                isSelected
                  ? 'bg-gold border-gold shadow-sm shadow-gold/30'
                  : 'bg-surface border-border'
              }`}
              onPress={() => onSelectMonth(item.year, item.month)}
              activeOpacity={0.75}
            >
              <Text
                className={`font-mono text-[11px] tracking-wide ${
                  isSelected ? 'text-background font-bold' : 'text-zinc-400'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
