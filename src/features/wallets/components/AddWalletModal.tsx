import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Wallet, Landmark, PiggyBank, Plus, Check } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { InputField } from '../../../components/common/InputField';
import { CurrencyInput } from '../../../components/common/CurrencyInput';
import { Button } from '../../../components/common/Button';
import { createWallet } from '../../../database/repositories/walletRepo';
import { useWalletsStore } from '../hooks/useWallets';
import { useDashboardStore } from '../../dashboard/hooks/useDashboardSummary';

interface AddWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const WALLET_TYPES = [
  { id: 'cash', label: 'Cash / Tunai', Icon: Wallet },
  { id: 'bank', label: 'Bank / E-Wallet', Icon: Landmark },
  { id: 'savings', label: 'Tabungan', Icon: PiggyBank },
];

const COLOR_PRESETS = [
  '#EAB308', // Gold
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
];

export function AddWalletModal({ visible, onClose, onSuccess }: AddWalletModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('cash');
  const [initialBalance, setInitialBalance] = useState(0);
  const [selectedColor, setSelectedColor] = useState(COLOR_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setType('cash');
    setInitialBalance(0);
    setSelectedColor(COLOR_PRESETS[0]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Nama kantong wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await createWallet({
        name: name.trim(),
        type,
        initialBalance,
        color: selectedColor,
        icon: type === 'savings' ? 'piggy-bank' : type === 'bank' ? 'landmark' : 'wallet',
      });

      if (res.success) {
        await Promise.all([
          useWalletsStore.getState().fetchWallets(),
          useDashboardStore.getState().refreshDashboard(),
        ]);
        handleClose();
        onSuccess?.();
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(`Gagal membuat kantong: ${String(err)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalLayout
      visible={visible}
      onClose={handleClose}
      title="Tambah Kantong Baru"
      subtitle="Manajemen Pos Finansial"
    >
      <View style={styles.container}>
        {/* Input Nama Kantong */}
        <InputField
          label="Nama Kantong"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError(null);
          }}
          placeholder="Misal: BCA Utama, Dana, Tabungan Nikah"
          autoFocus={visible}
        />

        {/* Pilihan Tipe Kantong */}
        <Text style={styles.sectionLabel}>Tipe Pos / Kantong</Text>
        <View style={styles.typesRow}>
          {WALLET_TYPES.map((t) => {
            const isSelected = type === t.id;
            const IconComponent = t.Icon;
            return (
              <TouchableOpacity
                key={t.id}
                style={[
                  styles.typeButton,
                  isSelected && styles.selectedTypeButton,
                ]}
                onPress={() => setType(t.id)}
                activeOpacity={0.7}
              >
                <IconComponent
                  size={18}
                  color={isSelected ? '#FFD165' : '#71717A'}
                />
                <Text
                  style={[
                    styles.typeLabel,
                    isSelected && styles.selectedTypeLabel,
                  ]}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Input Saldo Awal */}
        <CurrencyInput
          label="Saldo Awal (Opsional)"
          value={initialBalance}
          onChangeValue={setInitialBalance}
          placeholder="0"
          style={styles.currencyInput}
        />

        {/* Pilihan Aksen Warna */}
        <Text style={styles.sectionLabel}>Warna Aksen</Text>
        <View style={styles.colorPresetsRow}>
          {COLOR_PRESETS.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                style={[styles.colorCircle, { backgroundColor: color }]}
                onPress={() => setSelectedColor(color)}
                activeOpacity={0.8}
              >
                {isSelected && <Check size={14} color="#09090B" strokeWidth={3} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Notifikasi Error */}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tombol Simpan */}
        <Button
          title="Simpan Kantong"
          onPress={handleSubmit}
          loading={isSubmitting}
          icon={<Plus size={18} color="#09090B" strokeWidth={2.5} />}
          style={styles.submitButton}
        />
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 10,
  },
  sectionLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#D3C5AC',
    marginBottom: 8,
  },
  typesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: '#1F1F22',
    borderWidth: 1,
    borderColor: '#27272A',
    gap: 6,
  },
  selectedTypeButton: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  typeLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  selectedTypeLabel: {
    color: '#FFD165',
    fontWeight: '700',
  },
  currencyInput: {
    marginBottom: 12,
  },
  colorPresetsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  colorCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 14,
  },
  errorText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#EF4444',
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 4,
  },
});

