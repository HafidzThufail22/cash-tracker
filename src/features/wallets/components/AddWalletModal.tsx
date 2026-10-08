import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      <View className="pb-2.5">
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
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-2">
          Tipe Pos / Kantong
        </Text>
        <View className="flex-row gap-2 mb-4">
          {WALLET_TYPES.map((t) => {
            const isSelected = type === t.id;
            const IconComponent = t.Icon;
            return (
              <TouchableOpacity
                key={t.id}
                className={`flex-1 items-center justify-center py-3 px-1.5 rounded-xl bg-[#1F1F22] border gap-1.5 ${
                  isSelected ? 'border-gold bg-gold/10' : 'border-border'
                }`}
                onPress={() => setType(t.id)}
                activeOpacity={0.7}
              >
                <IconComponent
                  size={18}
                  color={isSelected ? '#FFD165' : '#71717A'}
                />
                <Text
                  className={`font-manrope-medium text-[11px] text-center ${
                    isSelected ? 'text-gold-primary font-bold' : 'text-zinc-400'
                  }`}
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
        />

        {/* Pilihan Aksen Warna */}
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-2">
          Warna Aksen
        </Text>
        <View className="flex-row gap-3 mb-5">
          {COLOR_PRESETS.map((color) => {
            const isSelected = selectedColor === color;
            return (
              <TouchableOpacity
                key={color}
                className="w-[34px] h-[34px] rounded-full items-center justify-center"
                style={{ backgroundColor: color }}
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
          <View className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 mb-3.5">
            <Text className="font-manrope-medium text-xs text-semantic-expense text-center">{error}</Text>
          </View>
        )}

        {/* Tombol Simpan */}
        <Button
          title="Simpan Kantong"
          onPress={handleSubmit}
          loading={isSubmitting}
          icon={<Plus size={18} color="#09090B" strokeWidth={2.5} />}
        />
      </View>
    </ModalLayout>
  );
}
