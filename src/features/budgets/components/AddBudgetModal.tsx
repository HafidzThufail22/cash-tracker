import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { CurrencyInput } from '../../../components/common/CurrencyInput';
import { Button } from '../../../components/common/Button';
import { CategoryItem } from '../../../database/repositories/categoryRepo';
import { BudgetItemWithUsage } from '../../../database/repositories/budgetRepo';

interface AddBudgetModalProps {
  visible: boolean;
  categories: CategoryItem[];
  existingBudget?: BudgetItemWithUsage | null;
  onClose: () => void;
  onSave: (categoryId: string, limit: number) => Promise<boolean>;
}

const QUICK_AMOUNTS = [
  { label: '+250rb', value: 250000 },
  { label: '+500rb', value: 500000 },
  { label: '+1jt', value: 1000000 },
  { label: '+2jt', value: 2000000 },
];

export function AddBudgetModal({
  visible,
  categories,
  existingBudget,
  onClose,
  onSave,
}: AddBudgetModalProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [amountLimit, setAmountLimit] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (existingBudget) {
      setSelectedCategoryId(existingBudget.categoryId);
      setAmountLimit(existingBudget.amountLimit);
    } else {
      setSelectedCategoryId(categories.length > 0 ? categories[0].id : '');
      setAmountLimit(500000);
    }
  }, [existingBudget, categories, visible]);

  const handleAddQuickAmount = (val: number) => {
    setAmountLimit((prev) => prev + val);
  };

  const handleSubmit = async () => {
    if (!selectedCategoryId) {
      Alert.alert('Perhatian', 'Silakan pilih kategori pengeluaran terlebih dahulu.');
      return;
    }
    if (amountLimit <= 0) {
      Alert.alert('Perhatian', 'Batas nominal anggaran harus lebih dari 0.');
      return;
    }

    try {
      setIsSubmitting(true);
      const success = await onSave(selectedCategoryId, amountLimit);
      if (success) {
        onClose();
      } else {
        Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan anggaran belanja.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title={existingBudget ? 'Ubah Plafon Anggaran' : 'Buat Anggaran Baru'}
      subtitle="Tetapkan batas pengeluaran bulanan per kategori"
    >
      <View className="gap-4 pb-2">
        {/* Category Picker Section */}
        <View className="gap-2">
          <Text className="font-manrope-semibold text-xs text-zinc-300 tracking-wide">
            Pilih Kategori Belanja
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  className={`px-3.5 py-2 rounded-[14px] border ${
                    isSelected
                      ? 'bg-gold border-gold'
                      : 'bg-surface border-gold/35'
                  }`}
                  onPress={() => {
                    if (!existingBudget) {
                      setSelectedCategoryId(cat.id);
                    }
                  }}
                  activeOpacity={0.75}
                  disabled={existingBudget !== null && existingBudget !== undefined}
                >
                  <Text
                    className={`font-manrope-semibold text-xs ${
                      isSelected ? 'text-background font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Amount Limit Input */}
        <View className="gap-2">
          <Text className="font-manrope-semibold text-xs text-zinc-300 tracking-wide">
            Batas Maksimal Pengeluaran (Plafon)
          </Text>
          <CurrencyInput
            value={amountLimit}
            onChangeValue={setAmountLimit}
            placeholder="0"
          />

          {/* Quick Amount Increment Chips */}
          <View className="flex-row gap-2 mt-0.5">
            {QUICK_AMOUNTS.map((q) => (
              <TouchableOpacity
                key={q.label}
                className="flex-1 py-1.5 rounded-[10px] bg-[#131316] border border-border items-center justify-center"
                onPress={() => handleAddQuickAmount(q.value)}
                activeOpacity={0.7}
              >
                <Text className="font-mono text-[11px] text-gold-primary">{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note / Guidance */}
        <Text className="font-manrope text-[11px] text-zinc-500 leading-4">
          Plafon anggaran ini akan berlaku otomatis setiap bulan. Pengeluaran aktual akan terakumulasi dari transaksi Anda.
        </Text>

        {/* Action Button */}
        <Button
          title={existingBudget ? 'Simpan Perubahan' : 'Buat Anggaran'}
          onPress={handleSubmit}
          loading={isSubmitting}
        />
      </View>
    </ModalLayout>
  );
}
