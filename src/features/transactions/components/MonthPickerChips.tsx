import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { AvailableMonth } from '../../../database/repositories/transactionRepo';

interface MonthPickerChipsProps {
  months: AvailableMonth[];
  selectedYear: number;
  selectedMonth: number;
  onSelectMonth: (year: number, month: number) => void;
}

export function MonthPickerChips({
  months,
  selectedYear,
  selectedMonth,
  onSelectMonth,
}: MonthPickerChipsProps) {
  if (months.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {months.map((item) => {
          const isSelected = item.year === selectedYear && item.month === selectedMonth;

          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.chip, isSelected ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => onSelectMonth(item.year, item.month)}
              activeOpacity={0.75}
            >
              {isSelected && <Calendar size={13} color="#09090B" style={styles.chipIcon} />}
              <Text
                style={[
                  styles.chipText,
                  isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                ]}
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

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#EAB308',
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  chipUnselected: {
    backgroundColor: '#18181B',
    borderColor: 'rgba(79, 70, 51, 0.35)',
  },
  chipIcon: {
    marginRight: 6,
  },
  chipText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  chipTextSelected: {
    color: '#09090B',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#A1A1AA',
  },
});
