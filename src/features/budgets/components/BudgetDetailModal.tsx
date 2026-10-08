import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Edit3,
  Trash2,
  Receipt,
  AlertTriangle,
} from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import {
  BudgetItemWithUsage,
  CategoryTransactionItem,
  getCategoryTransactionsForMonth,
} from '../../../database/repositories/budgetRepo';
import { BudgetProgressBar } from './BudgetProgressBar';
import { formatRupiah } from '../../../utils/currency';
import { formatTransactionDate } from '../../../utils/date';

interface BudgetDetailModalProps {
  visible: boolean;
  budget: BudgetItemWithUsage | null;
  year: number;
  month: number;
  onClose: () => void;
  onEditLimit: (budget: BudgetItemWithUsage) => void;
  onDelete: (budgetId: string) => Promise<boolean>;
}

export function BudgetDetailModal({
  visible,
  budget,
  year,
  month,
  onClose,
  onEditLimit,
  onDelete,
}: BudgetDetailModalProps) {
  const [transactions, setTransactions] = useState<CategoryTransactionItem[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState<boolean>(true);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!budget || !visible) return;

    async function loadTx() {
      try {
        setIsLoadingTx(true);
        if (budget) {
          const list = await getCategoryTransactionsForMonth(
            budget.categoryId,
            year,
            month
          );
          setTransactions(list);
        }
      } catch (err) {
        console.error('Gagal mengambil mutasi kategori anggaran:', err);
      } finally {
        setIsLoadingTx(false);
      }
    }

    loadTx();
  }, [budget, year, month, visible]);

  if (!budget) return null;

  const isOverbudget = budget.status === 'overbudget';

  const handleDelete = () => {
    Alert.alert(
      'Hapus Anggaran?',
      `Batas kuota anggaran untuk kategori "${budget.categoryName}" akan dihapus. Riwayat transaksi pengeluaran Anda tetap aman.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const success = await onDelete(budget.id);
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
      title={budget.categoryName}
      subtitle="Evaluasi kuota & pengeluaran kategori"
    >
      <View className="gap-4 pb-1">
        {/* Performance Summary Card */}
        <View className="bg-surface rounded-2xl border border-border p-4 gap-3">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="font-manrope text-[10px] text-zinc-500 uppercase tracking-wider mb-0.5">
                Total Terpakai
              </Text>
              <Text
                className={`font-grotesk-bold text-2xl ${
                  isOverbudget ? 'text-semantic-expense' : 'text-zinc-100'
                }`}
              >
                {formatRupiah(budget.spent)}
              </Text>
            </View>

            <View
              className={`flex-row items-center px-2 py-0.5 rounded-[10px] border ${
                isOverbudget
                  ? 'bg-red-500/10 border-red-500/30'
                  : 'bg-gold/10 border-gold/25'
              }`}
            >
              {isOverbudget && (
                <AlertTriangle size={12} color="#EF4444" style={{ marginRight: 3 }} />
              )}
              <Text
                className={`font-mono text-[11px] font-bold ${
                  isOverbudget ? 'text-semantic-expense' : 'text-gold-primary'
                }`}
              >
                {budget.percentage}%
              </Text>
            </View>
          </View>

          <BudgetProgressBar
            percentage={budget.percentage}
            status={budget.status}
            height={8}
          />

          <View className="flex-row items-center justify-between pt-0.5">
            <Text className="font-mono text-xs text-zinc-400">
              Plafon: {formatRupiah(budget.amountLimit)}
            </Text>
            <Text
              className={`font-manrope-semibold text-xs ${
                isOverbudget ? 'text-semantic-expense' : 'text-semantic-income'
              }`}
            >
              {isOverbudget
                ? `Melebihi ${formatRupiah(Math.abs(budget.remaining))}`
                : `Tersisa ${formatRupiah(budget.remaining)}`}
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View className="gap-2">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-1.5">
              <Receipt size={15} color="#FFD165" />
              <Text className="font-manrope-bold text-sm text-zinc-100">Pengeluaran Bulan Ini</Text>
            </View>
            <Text className="font-mono text-[11px] text-zinc-500">{transactions.length} catatan</Text>
          </View>

          <ScrollView style={{ maxHeight: 240 }} showsVerticalScrollIndicator={false}>
            {isLoadingTx ? (
              <View className="p-8 items-center justify-center">
                <ActivityIndicator size="small" color="#FFD165" />
              </View>
            ) : transactions.length === 0 ? (
              <View className="p-6 items-center justify-center bg-surface-lowest rounded-xl border border-border/40">
                <Text className="font-manrope text-xs text-zinc-500 text-center">
                  Belum ada transaksi pengeluaran di kategori ini pada bulan yang dipilih.
                </Text>
              </View>
            ) : (
              transactions.map((tx, idx) => (
                <View
                  key={tx.id}
                  className={`flex-row items-center justify-between py-2.5 ${
                    idx !== transactions.length - 1 ? 'border-b border-border/40' : ''
                  }`}
                >
                  <View className="flex-1 mr-3">
                    <Text className="font-manrope-semibold text-sm text-zinc-100 mb-0.5" numberOfLines={1}>
                      {tx.notes || budget.categoryName}
                    </Text>
                    <View className="flex-row items-center gap-1.5">
                      <Text className="font-mono text-[10px] text-zinc-500">{tx.walletName}</Text>
                      <Text className="text-zinc-600 text-[10px]">•</Text>
                      <Text className="font-mono text-[10px] text-zinc-500">
                        {formatTransactionDate(tx.date)}
                      </Text>
                    </View>
                  </View>

                  <Text className="font-mono text-xs font-semibold text-semantic-expense">
                    -{formatRupiah(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Action Buttons Row */}
        <View className="flex-row gap-2.5 pt-1">
          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl bg-gold/10 border border-gold/30"
            onPress={() => {
              onClose();
              onEditLimit(budget);
            }}
            activeOpacity={0.75}
          >
            <Edit3 size={15} color="#FFD165" strokeWidth={2} />
            <Text className="font-manrope-semibold text-xs text-gold-primary">Ubah Plafon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 flex-row items-center justify-center gap-1.5 py-3 rounded-xl bg-red-500/10 border border-red-500/25"
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.75}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Trash2 size={15} color="#EF4444" strokeWidth={2} />
                <Text className="font-manrope-semibold text-xs text-semantic-expense">Hapus Anggaran</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ModalLayout>
  );
}
