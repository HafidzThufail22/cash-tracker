import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
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
      setAmountLimit(500000); // Default saran plafon 500rb
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
      <View style={styles.container}>
        {/* Category Picker Section */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pilih Kategori Belanja</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            {categories.map((cat) => {
              const isSelected = selectedCategoryId === cat.id;

              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryChip,
                    isSelected ? styles.categoryChipSelected : styles.categoryChipUnselected,
                  ]}
                  onPress={() => {
                    if (!existingBudget) {
                      setSelectedCategoryId(cat.id);
                    }
                  }}
                  activeOpacity={0.75}
                  disabled={existingBudget !== null && existingBudget !== undefined}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isSelected ? styles.categoryChipTextSelected : styles.categoryChipTextUnselected,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Amount Limit Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Batas Maksimal Pengeluaran (Plafon)</Text>
          <CurrencyInput
            value={amountLimit}
            onChangeValue={setAmountLimit}
            placeholder="0"
          />

          {/* Quick Amount Increment Chips */}
          <View style={styles.quickChipsRow}>
            {QUICK_AMOUNTS.map((q) => (
              <TouchableOpacity
                key={q.label}
                style={styles.quickChip}
                onPress={() => handleAddQuickAmount(q.value)}
                activeOpacity={0.7}
              >
                <Text style={styles.quickChipText}>{q.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note / Guidance */}
        <Text style={styles.guidanceText}>
          Plafon anggaran ini akan berlaku otomatis setiap bulan. Pengeluaran aktual akan terakumulasi dari transaksi Anda.
        </Text>

        {/* Action Button */}
        <Button
          title={existingBudget ? 'Simpan Perubahan' : 'Buat Anggaran'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 8,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#D4D4D8',
    letterSpacing: 0.2,
  },
  categoryChips: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
  },
  categoryChipSelected: {
    backgroundColor: '#EAB308',
    borderColor: '#EAB308',
  },
  categoryChipUnselected: {
    backgroundColor: '#18181B',
    borderColor: 'rgba(79, 70, 51, 0.35)',
  },
  categoryChipText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
  },
  categoryChipTextSelected: {
    color: '#09090B',
    fontWeight: '700',
  },
  categoryChipTextUnselected: {
    color: '#A1A1AA',
  },
  quickChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  quickChip: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: '#131316',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#FFD165',
  },
  guidanceText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#71717A',
    lineHeight: 16,
  },
  submitButton: {
    marginTop: 4,
  },
});
