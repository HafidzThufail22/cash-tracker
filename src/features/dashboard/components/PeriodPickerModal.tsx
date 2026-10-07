import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar, Check } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { AvailableMonth } from '../../../database/repositories/transactionRepo';

interface PeriodPickerModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number;
  months: AvailableMonth[];
  onClose: () => void;
  onSelectMonth: (year: number, month: number) => void;
}

export function PeriodPickerModal({
  visible,
  selectedYear,
  selectedMonth,
  months,
  onClose,
  onSelectMonth,
}: PeriodPickerModalProps) {
  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Pilih Periode"
      subtitle="Ringkasan Finansial"
      scrollable
    >
      <View style={styles.container}>
        <View style={styles.grid}>
          {months.map((item) => {
            const isSelected = item.year === selectedYear && item.month === selectedMonth;

            return (
              <TouchableOpacity
                key={item.key}
                style={[styles.itemCard, isSelected && styles.itemCardSelected]}
                onPress={() => {
                  onSelectMonth(item.year, item.month);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.itemContent}>
                  <Calendar
                    size={15}
                    color={isSelected ? '#09090B' : '#FFD165'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[styles.itemLabel, isSelected && styles.itemLabelSelected]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                </View>
                {isSelected && <Check size={16} color="#09090B" strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  grid: {
    gap: 8,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
  },
  itemCardSelected: {
    backgroundColor: '#FFD165',
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: '#F4F4F5',
    letterSpacing: 0.2,
  },
  itemLabelSelected: {
    color: '#09090B',
    fontFamily: 'SpaceGrotesk_700Bold',
  },
});
