import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Trash2,
  Calendar,
  Wallet,
  Tag,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatSignedRupiah } from '../../../utils/currency';
import { formatFullDateTime } from '../../../utils/date';

interface TransactionDetailModalProps {
  visible: boolean;
  item: RecentTransactionItem | null;
  onClose: () => void;
  onDelete: (transactionId: string) => Promise<boolean>;
}

export function TransactionDetailModal({
  visible,
  item,
  onClose,
  onDelete,
}: TransactionDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) return null;

  const isIncome = item.type === 0;
  const isExpense = item.type === 1;
  const isTransfer = item.type === 2;

  const typeLabel = isIncome
    ? 'Pemasukan'
    : isExpense
    ? 'Pengeluaran'
    : 'Pindah Kantong';

  const signedAmount = formatSignedRupiah(
    item.amount,
    isIncome ? 'income' : isExpense ? 'expense' : 'transfer'
  );

  const handleDeletePress = () => {
    Alert.alert(
      'Hapus Transaksi',
      'Apakah Anda yakin ingin menghapus catatan mutasi ini? Saldo kantong terkait akan disesuaikan kembali secara otomatis.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            try {
              const success = await onDelete(item.id);
              if (success) {
                onClose();
              }
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ModalLayout
      visible={visible}
      onClose={onClose}
      title="Rincian Mutasi"
      subtitle={typeLabel}
    >
      <View className="gap-4 pb-2">
        {/* Big Amount Card */}
        <View className="items-center py-4.5 rounded-2xl bg-[#1C1C20] border border-gold/30">
          <View
            className={`flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border mb-2 ${
              isIncome
                ? 'bg-emerald-500/10 border-emerald-500/25'
                : isTransfer
                ? 'bg-yellow-500/10 border-yellow-500/30'
                : 'bg-red-500/10 border-red-500/25'
            }`}
          >
            {isIncome ? (
              <TrendingUp size={14} color="#10B981" />
            ) : isTransfer ? (
              <ArrowLeftRight size={14} color="#FFD165" />
            ) : (
              <TrendingDown size={14} color="#EF4444" />
            )}
            <Text
              className={`font-mono text-[11px] uppercase tracking-wide font-semibold ${
                isIncome
                  ? 'text-semantic-income'
                  : isTransfer
                  ? 'text-gold-primary'
                  : 'text-semantic-expense'
              }`}
            >
              {typeLabel}
            </Text>
          </View>

          <Text
            className={`font-grotesk-bold text-3xl tracking-tight ${
              isIncome
                ? 'text-semantic-income'
                : isTransfer
                ? 'text-gold-primary'
                : 'text-semantic-expense'
            }`}
          >
            {signedAmount}
          </Text>
        </View>

        {/* Detailed Metadata Fields */}
        <View className="p-3.5 rounded-2xl bg-surface border border-border gap-1">
          {/* Tanggal & Waktu */}
          <View className="flex-row items-center gap-3 py-1.5">
            <View className="w-8 h-8 rounded-full bg-surface-lowest items-center justify-center">
              <Calendar size={16} color="#71717A" />
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Waktu Mutasi</Text>
              <Text className="font-manrope-semibold text-sm text-zinc-100">{formatFullDateTime(item.date)}</Text>
            </View>
          </View>

          <View className="h-[1px] bg-border/60 my-1" />

          {/* Kategori */}
          <View className="flex-row items-center gap-3 py-1.5">
            <View className="w-8 h-8 rounded-full bg-surface-lowest items-center justify-center">
              <Tag size={16} color="#71717A" />
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Kategori</Text>
              <Text className="font-manrope-semibold text-sm text-zinc-100">
                {isTransfer ? 'Transfer Antar-Kantong' : item.categoryName}
              </Text>
            </View>
          </View>

          <View className="h-[1px] bg-border/60 my-1" />

          {/* Kantong */}
          <View className="flex-row items-center gap-3 py-1.5">
            <View className="w-8 h-8 rounded-full bg-surface-lowest items-center justify-center">
              <Wallet size={16} color="#71717A" />
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">
                {isTransfer ? 'Alur Kantong' : 'Kantong'}
              </Text>
              {isTransfer && item.toWalletName ? (
                <View className="flex-row items-center gap-1.5">
                  <Text className="font-manrope-bold text-sm text-gold-primary">{item.walletName}</Text>
                  <ArrowRight size={14} color="#FFD165" />
                  <Text className="font-manrope-bold text-sm text-gold-primary">{item.toWalletName}</Text>
                </View>
              ) : (
                <Text className="font-manrope-semibold text-sm text-zinc-100">{item.walletName}</Text>
              )}
            </View>
          </View>

          {/* Catatan (jika ada) */}
          {item.notes && item.notes.trim().length > 0 && (
            <>
              <View className="h-[1px] bg-border/60 my-1" />
              <View className="flex-row items-center gap-3 py-1.5">
                <View className="w-8 h-8 rounded-full bg-surface-lowest items-center justify-center">
                  <FileText size={16} color="#71717A" />
                </View>
                <View className="flex-1">
                  <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 mb-0.5">Catatan Deskripsi</Text>
                  <Text className="font-manrope text-sm text-zinc-300 leading-5">{item.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          className="flex-row items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 border border-red-500/25 mt-1"
          onPress={handleDeletePress}
          disabled={isDeleting}
          activeOpacity={0.75}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Trash2 size={16} color="#EF4444" strokeWidth={2.2} />
              <Text className="font-manrope-bold text-sm text-semantic-expense">Hapus Transaksi</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ModalLayout>
  );
}
