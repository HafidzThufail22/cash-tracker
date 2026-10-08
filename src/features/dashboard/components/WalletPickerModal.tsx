import React from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { Layers, Check, Wallet as WalletIcon } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { WalletWithBalance } from '../../../database/repositories/walletRepo';
import { formatRupiah } from '../../../utils/currency';

interface WalletPickerModalProps {
  visible: boolean;
  wallets: WalletWithBalance[];
  selectedWalletId: string | null;
  onClose: () => void;
  onSelectWallet: (walletId: string | null) => void;
}

export function WalletPickerModal({
  visible,
  wallets,
  selectedWalletId,
  onClose,
  onSelectWallet,
}: WalletPickerModalProps) {
  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Pilih Kantong Kas"
      subtitle="Filter Saldo & Mutasi"
      scrollable={false}
    >
      <View className="max-h-[440px] gap-2">
        {/* Option 1: Semua Kantong Kas */}
        <TouchableOpacity
          className={`flex-row items-center bg-surface border rounded-[14px] p-3 gap-3 ${
            selectedWalletId === null
              ? 'border-gold/50 bg-gold/10'
              : 'border-border'
          }`}
          onPress={() => {
            onSelectWallet(null);
            onClose();
          }}
          activeOpacity={0.7}
        >
          <View className="w-[38px] h-[38px] rounded-full items-center justify-center bg-gold/15">
            <Layers size={18} color="#FFD165" />
          </View>
          <View className="flex-1">
            <Text
              className={`text-sm ${
                selectedWalletId === null
                  ? 'text-gold-primary font-manrope-bold'
                  : 'font-manrope-semibold text-zinc-100'
              }`}
            >
              Semua Kantong
            </Text>
            <Text className="font-manrope text-[11px] text-zinc-500 mt-0.5">
              Gabungan seluruh rekening & kas
            </Text>
          </View>
          {selectedWalletId === null && (
            <View className="w-[22px] h-[22px] rounded-full bg-gold-primary items-center justify-center">
              <Check size={14} color="#09090B" strokeWidth={3} />
            </View>
          )}
        </TouchableOpacity>

        <View className="h-[1px] bg-border my-1" />

        {/* List of Individual Wallets */}
        <FlatList
          data={wallets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 8, paddingBottom: 28 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = selectedWalletId === item.id;
            const color = item.color || '#EAB308';

            return (
              <TouchableOpacity
                className={`flex-row items-center bg-surface border rounded-[14px] p-3 gap-3 ${
                  isSelected
                    ? 'border-gold/50 bg-gold/10'
                    : 'border-border'
                }`}
                onPress={() => {
                  onSelectWallet(item.id);
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View
                  className="w-[38px] h-[38px] rounded-full items-center justify-center"
                  style={{ backgroundColor: `${color}20` }}
                >
                  <WalletIcon size={18} color={color} />
                </View>

                <View className="flex-1">
                  <Text
                    className={`text-sm ${
                      isSelected
                        ? 'text-gold-primary font-manrope-bold'
                        : 'font-manrope-semibold text-zinc-100'
                    }`}
                  >
                    {item.name}
                  </Text>
                  <Text className="font-mono text-xs text-zinc-400 mt-0.5">
                    {formatRupiah(item.balance)}
                  </Text>
                </View>

                {isSelected && (
                  <View className="w-[22px] h-[22px] rounded-full bg-gold-primary items-center justify-center">
                    <Check size={14} color="#09090B" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </ModalLayout>
  );
}
