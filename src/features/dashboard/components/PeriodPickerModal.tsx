import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      <View className="py-1 gap-4">
        {/* Year Navigator */}
        <View className="flex-row items-center justify-between bg-[#111113] rounded-[14px] border border-border px-2 py-1.5">
          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-border"
            onPress={() => setViewingYear((prev) => prev - 1)}
            activeOpacity={0.7}
            accessibilityLabel="Tahun Sebelumnya"
          >
            <ChevronLeft size={20} color="#F4F4F5" />
          </TouchableOpacity>

          <View className="px-4 py-1">
            <Text className="font-grotesk-bold text-xl tracking-wider text-gold-primary">
              {viewingYear}
            </Text>
          </View>

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-surface items-center justify-center border border-border"
            onPress={() => setViewingYear((prev) => prev + 1)}
            activeOpacity={0.7}
            accessibilityLabel="Tahun Selanjutnya"
          >
            <ChevronRight size={20} color="#F4F4F5" />
          </TouchableOpacity>
        </View>

        {/* 12 Months Grid (3 columns x 4 rows) */}
        <View className="flex-row flex-wrap gap-2.5 justify-between">
          {MONTH_NAMES.map((item) => {
            const isSelected = viewingYear === selectedYear && item.month === selectedMonth;

            return (
              <TouchableOpacity
                key={item.month}
                className={`w-[31%] rounded-[14px] py-3.5 px-2 items-center justify-center relative border ${
                  isSelected
                    ? 'bg-gold-primary border-gold shadow-md shadow-gold/30'
                    : 'bg-surface border-border'
                }`}
                onPress={() => {
                  onSelectMonth(viewingYear, item.month);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <Text
                  className={`font-grotesk-bold text-base ${
                    isSelected ? 'text-background' : 'text-zinc-100'
                  }`}
                >
                  {item.short}
                </Text>
                <Text
                  className={`text-[10px] mt-0.5 ${
                    isSelected
                      ? 'text-background/80 font-manrope-semibold'
                      : 'font-manrope text-zinc-500'
                  }`}
                >
                  {item.full}
                </Text>

                {isSelected && (
                  <View className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-black/20 items-center justify-center">
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
