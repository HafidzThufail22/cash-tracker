import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowDown, Check, ArrowRightLeft } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { CurrencyInput } from '../../../components/common/CurrencyInput';
import { InputField } from '../../../components/common/InputField';
import { Button } from '../../../components/common/Button';
import { useWalletTransfer } from '../hooks/useWalletTransfer';
import { WalletWithPercentage } from '../hooks/useWallets';
import { formatRupiah } from '../../../utils/currency';

interface TransferModalProps {
  visible: boolean;
  onClose: () => void;
  wallets: WalletWithPercentage[];
}

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 200000, 500000];

export function TransferModal({ visible, onClose, wallets }: TransferModalProps) {
  const {
    fromWalletId,
    setFromWalletId,
    toWalletId,
    setToWalletId,
    amount,
    setAmount,
    notes,
    setNotes,
    isSubmitting,
    error,
    setError,
    resetForm,
    executeTransfer,
  } = useWalletTransfer();

  useEffect(() => {
    if (visible && wallets.length >= 2) {
      if (!fromWalletId) {
        setFromWalletId(wallets[0].id);
      }
      if (!toWalletId) {
        setToWalletId(wallets[1].id);
      }
    }
  }, [visible, wallets]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleConfirm = async () => {
    const res = await executeTransfer(wallets);
    if (res.success) {
      handleClose();
    }
  };

  const selectedSourceWallet = wallets.find((w) => w.id === fromWalletId);

  return (
    <ModalLayout
      visible={visible}
      onClose={handleClose}
      title="Pindah Saldo"
      subtitle="Transfer Antar-Kantong"
    >
      <View className="pb-2.5">
        {/* Selektor Kantong Asal */}
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-2">
          Dari Kantong (Sumber)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {wallets.map((w) => {
            const isSelected = fromWalletId === w.id;
            return (
              <TouchableOpacity
                key={w.id}
                className={`w-[140px] p-3 rounded-xl bg-[#1F1F22] border ${
                  isSelected ? 'border-gold bg-gold/10' : 'border-border'
                }`}
                onPress={() => {
                  setFromWalletId(w.id);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text className={`font-manrope-semibold text-xs ${isSelected ? 'text-gold-primary' : 'text-zinc-100'}`}>
                    {w.name}
                  </Text>
                  {isSelected && <Check size={14} color="#FFD165" strokeWidth={3} />}
                </View>
                <Text className="font-grotesk text-[13px] text-zinc-400">{formatRupiah(w.balance)}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Direction Indicator */}
        <View className="flex-row items-center my-3">
          <View className="flex-1 h-[1px] bg-border/80" />
          <View className="w-7 h-7 rounded-full bg-surface border border-gold/40 items-center justify-center mx-3">
            <ArrowDown size={14} color="#FFD165" strokeWidth={2.5} />
          </View>
          <View className="flex-1 h-[1px] bg-border/80" />
        </View>

        {/* Selektor Kantong Tujuan */}
        <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-2">
          Ke Kantong (Tujuan)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4 }}
        >
          {wallets.map((w) => {
            const isSelected = toWalletId === w.id;
            const isSameAsSource = fromWalletId === w.id;
            return (
              <TouchableOpacity
                key={w.id}
                disabled={isSameAsSource}
                className={`w-[140px] p-3 rounded-xl bg-[#1F1F22] border ${
                  isSelected
                    ? 'border-gold bg-gold/10'
                    : isSameAsSource
                    ? 'opacity-35 bg-[#131316] border-border'
                    : 'border-border'
                }`}
                onPress={() => {
                  setToWalletId(w.id);
                  setError(null);
                }}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center justify-between mb-1">
                  <Text
                    className={`font-manrope-semibold text-xs ${
                      isSelected
                        ? 'text-gold-primary'
                        : isSameAsSource
                        ? 'text-zinc-600'
                        : 'text-zinc-100'
                    }`}
                  >
                    {w.name}
                  </Text>
                  {isSelected && <Check size={14} color="#FFD165" strokeWidth={3} />}
                </View>
                <Text
                  className={`font-grotesk text-[13px] ${
                    isSameAsSource ? 'text-zinc-600' : 'text-zinc-400'
                  }`}
                >
                  {formatRupiah(w.balance)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Input Nominal Transfer */}
        <CurrencyInput
          label="Nominal Transfer"
          value={amount}
          onChangeValue={(val) => {
            setAmount(val);
            setError(null);
          }}
          helperText={
            selectedSourceWallet
              ? `Tersedia: ${formatRupiah(selectedSourceWallet.balance)}`
              : undefined
          }
        />

        {/* Quick Amount Chips */}
        <View className="flex-row flex-wrap gap-2 mb-3.5">
          {QUICK_AMOUNTS.map((amt) => (
            <TouchableOpacity
              key={amt}
              className={`px-3 py-1.5 rounded-full bg-[#1F1F22] border ${
                amount === amt ? 'border-gold bg-gold/15' : 'border-border'
              }`}
              onPress={() => {
                setAmount(amt);
                setError(null);
              }}
              activeOpacity={0.7}
            >
              <Text
                className={`font-mono text-[11px] ${
                  amount === amt ? 'text-gold-primary font-bold' : 'text-zinc-400'
                }`}
              >
                {formatRupiah(amt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Input Catatan */}
        <InputField
          label="Catatan (Opsional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Misal: Tabungan Harian, Alokasi Belanja"
        />

        {/* Error Notification */}
        {error && (
          <View className="p-2.5 rounded-xl bg-red-500/15 border border-red-500/30 mb-3.5">
            <Text className="font-manrope-medium text-xs text-semantic-expense text-center">{error}</Text>
          </View>
        )}

        {/* Action Button */}
        <Button
          title="Konfirmasi Pindah Saldo"
          onPress={handleConfirm}
          loading={isSubmitting}
          icon={<ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />}
        />
      </View>
    </ModalLayout>
  );
}
