import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { AvailableMonth } from '../../../database/repositories/transactionRepo';

interface PeriodPickerModalProps {
  visible: boolean;
  selectedYear: number;
  selectedMonth: number;
  months?: AvailableMonth[];
  onClose: () => void;
  onSelectMonth: (year: number, month: number) => void;
}

const MONTH_NAMES = [
  { month: 1, short: 'Jan', full: 'Januari' },
  { month: 2, short: 'Feb', full: 'Februari' },
  { month: 3, short: 'Mar', full: 'Maret' },
  { month: 4, short: 'Apr', full: 'April' },
  { month: 5, short: 'Mei', full: 'Mei' },
  { month: 6, short: 'Jun', full: 'Juni' },
  { month: 7, short: 'Jul', full: 'Juli' },
  { month: 8, short: 'Ags', full: 'Agustus' },
  { month: 9, short: 'Sep', full: 'September' },
  { month: 10, short: 'Okt', full: 'Oktober' },
  { month: 11, short: 'Nov', full: 'November' },
  { month: 12, short: 'Des', full: 'Desember' },
];

export function PeriodPickerModal({
  visible,
  selectedYear,
  selectedMonth,
  onClose,
  onSelectMonth,
}: PeriodPickerModalProps) {
  const [viewingYear, setViewingYear] = useState(selectedYear);

  useEffect(() => {
    if (visible) {
      setViewingYear(selectedYear);
    }
  }, [visible, selectedYear]);

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Pilih Bulan & Tahun"
      subtitle="Filter Periode Finansial"
      scrollable={false}
    >
      <View style={styles.container}>
        {/* Year Navigator */}
        <View style={styles.yearNavigator}>
          <TouchableOpacity
            style={styles.yearArrowBtn}
            onPress={() => setViewingYear((prev) => prev - 1)}
            activeOpacity={0.7}
            accessibilityLabel="Tahun Sebelumnya"
          >
            <ChevronLeft size={20} color="#F4F4F5" />
          </TouchableOpacity>

          <View style={styles.yearDisplay}>
            <Text style={styles.yearText}>{viewingYear}</Text>
          </View>

          <TouchableOpacity
            style={styles.yearArrowBtn}
            onPress={() => setViewingYear((prev) => prev + 1)}
            activeOpacity={0.7}
            accessibilityLabel="Tahun Selanjutnya"
          >
            <ChevronRight size={20} color="#F4F4F5" />
          </TouchableOpacity>
        </View>

        {/* 12 Months Grid (3 columns x 4 rows) */}
        <View style={styles.monthsGrid}>
          {MONTH_NAMES.map((item) => {
            const isSelected = viewingYear === selectedYear && item.month === selectedMonth;

            return (
              <TouchableOpacity
                key={item.month}
                style={[styles.monthCard, isSelected && styles.monthCardSelected]}
                onPress={() => {
                  onSelectMonth(viewingYear, item.month);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[styles.monthShortText, isSelected && styles.monthShortTextSelected]}
                >
                  {item.short}
                </Text>
                <Text style={[styles.monthFullText, isSelected && styles.monthFullTextSelected]}>
                  {item.full}
                </Text>

                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Check size={12} color="#09090B" strokeWidth={3} />
                  </View>
                )}
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
    paddingVertical: 4,
    gap: 16,
  },
  yearNavigator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#111113',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  yearArrowBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  yearDisplay: {
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  yearText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    letterSpacing: 1,
    color: '#FFD165',
  },
  monthsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  monthCard: {
    width: '31%',
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  monthCardSelected: {
    backgroundColor: '#FFD165',
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  monthShortText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
  },
  monthShortTextSelected: {
    color: '#09090B',
  },
  monthFullText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#71717A',
    marginTop: 2,
  },
  monthFullTextSelected: {
    color: 'rgba(9, 9, 11, 0.8)',
    fontFamily: 'Manrope_600SemiBold',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(9, 9, 11, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
