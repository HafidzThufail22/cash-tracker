import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      {onOpenCalendarModal && (
        <TouchableOpacity
          style={styles.calendarTriggerBtn}
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
    marginVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
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
    borderColor: '#27272A',
  },
  chipText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
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
