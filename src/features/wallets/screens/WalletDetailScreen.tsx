import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  ArrowLeft,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  PiggyBank,
  Banknote,
  Landmark,
  History,
  ChevronDown,
  Check,
} from 'lucide-react-native';
import { WalletWithBalance } from '../../../database/repositories/walletRepo';
import { RecentTransactionItem, deleteTransaction } from '../../../database/repositories/transactionRepo';
import { formatRupiah } from '../../../utils/currency';
import { getDateKey, formatDayHeader } from '../../../utils/date';
import { Button } from '../../../components/common/Button';
import { useWallets } from '../hooks/useWallets';
import { useDashboardStore } from '../../dashboard/hooks/useDashboardSummary';
import { MonthPickerChips } from '../../transactions/components/MonthPickerChips';
import { PeriodPickerModal } from '../../dashboard/components/PeriodPickerModal';
import { TransactionItem } from '../../transactions/components/TransactionItem';
import { TransactionDetailModal } from '../../transactions/components/TransactionDetailModal';
import { ModalLayout } from '../../../layouts/ModalLayout';

interface WalletDetailScreenProps {
  wallet: WalletWithBalance;
  onBack: () => void;
  onTransferPress: () => void;
}

type TypeFilter = 'all' | 'income' | 'expense';

export function WalletDetailScreen({
  wallet,
  onBack,
  onTransferPress,
}: WalletDetailScreenProps) {
  const {
    selectedWalletTransactions: transactions,
    availableMonths,
    selectedYear,
    selectedMonth,
    isLoadingDetail,
    setDetailPeriod,
    fetchWallets,
  } = useWallets();

  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] =
    useState<RecentTransactionItem | null>(null);

  const isSavings = wallet.name.toLowerCase().includes('tabungan');
  const isBank = wallet.type === 'bank';

  // Akumulasi Masuk & Keluar khusus pada periode bulan yang aktif
  const { totalIn, totalOut } = useMemo(() => {
    let inSum = 0;
    let outSum = 0;

    for (const t of transactions) {
      if (t.type === 0 && t.walletId === wallet.id) {
        inSum += t.amount;
      } else if (t.type === 2 && t.toWalletId === wallet.id) {
        inSum += t.amount;
      } else if (t.type === 1 && t.walletId === wallet.id) {
        outSum += t.amount;
      } else if (t.type === 2 && t.walletId === wallet.id) {
        outSum += t.amount;
      }
    }

    return { totalIn: inSum, totalOut: outSum };
  }, [transactions, wallet.id]);

  // Filter transaksi berdasarkan Semua, Masuk, atau Keluar
  const filteredTransactions = useMemo(() => {
    if (typeFilter === 'all') return transactions;
    if (typeFilter === 'income') {
      return transactions.filter(
        (t) => t.type === 0 || (t.type === 2 && t.toWalletId === wallet.id)
      );
    }
    return transactions.filter(
      (t) => t.type === 1 || (t.type === 2 && t.walletId === wallet.id)
    );
  }, [transactions, typeFilter, wallet.id]);

  // Kelompokkan transaksi per tanggal (Grouped by Date)
  const groupedTransactions = useMemo(() => {
    const groupsMap = new Map<
      string,
      {
        dateKey: string;
        displayDate: string;
        dailyIncome: number;
        dailyExpense: number;
        items: RecentTransactionItem[];
      }
    >();

    for (const item of filteredTransactions) {
      const dateKey = getDateKey(item.date);
      if (!groupsMap.has(dateKey)) {
        groupsMap.set(dateKey, {
          dateKey,
          displayDate: formatDayHeader(dateKey),
          dailyIncome: 0,
          dailyExpense: 0,
          items: [],
        });
      }

      const group = groupsMap.get(dateKey)!;
      group.items.push(item);

      const isTransferIn = item.type === 2 && item.toWalletId === wallet.id;
      const isTransferOut = item.type === 2 && item.walletId === wallet.id;

      if (item.type === 0 || isTransferIn) {
        group.dailyIncome += item.amount;
      } else if (item.type === 1 || isTransferOut) {
        group.dailyExpense += item.amount;
      }
    }

    return Array.from(groupsMap.values());
  }, [filteredTransactions, wallet.id]);

  const handleDeleteTransaction = async (transactionId: string) => {
    try {
      await deleteTransaction(transactionId);
      await Promise.all([
        fetchWallets(),
        useDashboardStore.getState().refreshDashboard(),
      ]);
      return true;
    } catch (err) {
      console.error('Gagal menghapus transaksi:', err);
      return false;
    }
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' ? 88 : 80,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Navigation Bar with Type Filter Button */}
        <View className="flex-row items-center justify-between py-1">
          <TouchableOpacity
            className="w-[38px] h-[38px] rounded-full bg-surface border border-border items-center justify-center"
            onPress={onBack}
            activeOpacity={0.7}
          >
            <ArrowLeft size={20} color="#F4F4F5" />
          </TouchableOpacity>
          <Text
            className="font-manrope-bold text-base text-zinc-100 flex-1 text-center"
            numberOfLines={1}
          >
            Detail Kantong
          </Text>

          {/* Button Filter: Semua, Masuk, Keluar */}
          <TouchableOpacity
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border ${
              typeFilter === 'all'
                ? 'bg-gold/10 border-gold/30'
                : typeFilter === 'income'
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-red-500/10 border-red-500/30'
            }`}
            onPress={() => setIsTypeModalOpen(true)}
            activeOpacity={0.7}
            accessibilityLabel="Filter jenis transaksi"
            accessibilityRole="button"
          >
            <View
              className={`w-1.5 h-1.5 rounded-full ${
                typeFilter === 'all'
                  ? 'bg-gold-primary'
                  : typeFilter === 'income'
                  ? 'bg-emerald-400'
                  : 'bg-red-400'
              }`}
            />
            <Text
              className={`font-mono text-[11px] font-bold uppercase ${
                typeFilter === 'all'
                  ? 'text-gold-primary'
                  : typeFilter === 'income'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {typeFilter === 'all' ? 'Semua' : typeFilter === 'income' ? 'Masuk' : 'Keluar'}
            </Text>
            <ChevronDown
              size={12}
              color={typeFilter === 'all' ? '#FFD165' : typeFilter === 'income' ? '#34D399' : '#F87171'}
            />
          </TouchableOpacity>
        </View>

        {/* 1. Horizontal Month Filter Chips (Diletakkan di atas Card Utama) */}
        <View className="my-0.5">
          <MonthPickerChips
            months={availableMonths}
            selectedYear={selectedYear}
            selectedMonth={selectedMonth}
            onSelectMonth={setDetailPeriod}
            onOpenCalendarModal={() => setIsPeriodModalOpen(true)}
          />
        </View>

        {/* 2. Hero Wallet Balance Card */}
        <View
          className="p-4 rounded-2xl bg-surface border border-border overflow-hidden"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          <View className="flex-row items-center gap-3.5">
            <View
              className={`w-12 h-12 rounded-xl items-center justify-center border bg-surface-lowest ${
                isSavings
                  ? 'border-gold/30'
                  : isBank
                  ? 'border-blue-500/30'
                  : 'border-emerald-500/30'
              }`}
            >
              {isSavings ? (
                <PiggyBank size={24} color="#FFD165" strokeWidth={2.2} />
              ) : isBank ? (
                <Landmark size={24} color="#3B82F6" strokeWidth={2.2} />
              ) : (
                <Banknote size={24} color="#10B981" strokeWidth={2.2} />
              )}
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[11px] uppercase tracking-wider text-zinc-400 mb-0.5">
                {wallet.name}
              </Text>
              <Text className="font-grotesk-bold text-2xl text-zinc-100 tracking-tight">
                {formatRupiah(wallet.balance)}
              </Text>
            </View>
          </View>

          {/* Micro-stats In & Out Periode Terpilih */}
          <View className="h-[1px] bg-border my-3" />
          <View className="flex-row gap-2.5">
            <View className="flex-1 flex-row items-center gap-2 p-2 rounded-xl bg-[#111113] border border-border">
              <View className="w-6 h-6 rounded-full bg-emerald-500/15 items-center justify-center">
                <ArrowUpRight size={14} color="#10B981" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5" numberOfLines={1}>
                  Masuk
                </Text>
                <Text className="font-grotesk text-xs text-semantic-income font-semibold" numberOfLines={1}>
                  +{formatRupiah(totalIn)}
                </Text>
              </View>
            </View>

            <View className="flex-1 flex-row items-center gap-2 p-2 rounded-xl bg-[#111113] border border-border">
              <View className="w-6 h-6 rounded-full bg-red-500/15 items-center justify-center">
                <ArrowDownLeft size={14} color="#EF4444" />
              </View>
              <View className="flex-1">
                <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5" numberOfLines={1}>
                  Keluar
                </Text>
                <Text className="font-grotesk text-xs text-semantic-expense font-semibold" numberOfLines={1}>
                  -{formatRupiah(totalOut)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Shortcut: Pindah Saldo */}
        <Button
          title="Pindah Saldo"
          onPress={onTransferPress}
          variant="primary"
          icon={<ArrowRightLeft size={18} color="#09090B" strokeWidth={2.5} />}
        />

        {/* 3. Transaction History Section (Grouped by Date) */}
        <View className="mt-0.5">
          <View className="flex-row items-center gap-2 mb-2.5">
            <History size={18} color="#FFD165" strokeWidth={2.2} />
            <Text className="font-manrope-bold text-base text-zinc-100 tracking-tight">
              Riwayat
            </Text>
          </View>

          {isLoadingDetail ? (
            <View className="p-10 items-center justify-center">
              <ActivityIndicator size="small" color="#FFD165" />
            </View>
          ) : groupedTransactions.length === 0 ? (
            <View className="p-8 rounded-2xl bg-surface border border-border items-center justify-center">
              <Text className="font-manrope text-sm text-zinc-500 text-center">
                {typeFilter === 'income'
                  ? 'Belum ada catatan mutasi masuk pada periode ini.'
                  : typeFilter === 'expense'
                  ? 'Belum ada catatan mutasi keluar pada periode ini.'
                  : 'Belum ada catatan mutasi transaksi pada periode ini.'}
              </Text>
            </View>
          ) : (
            groupedTransactions.map((group) => (
              <View key={group.dateKey} className="mb-3.5">
                {/* Group Date Header & Subtotal */}
                <View className="flex-row items-center justify-between mb-2 px-1">
                  <Text className="font-mono text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    {group.displayDate}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {group.dailyExpense > 0 && (
                      <Text className="font-mono text-xs text-semantic-expense font-semibold">
                        -{formatRupiah(group.dailyExpense)}
                      </Text>
                    )}
                    {group.dailyIncome > 0 && (
                      <Text className="font-mono text-xs text-semantic-income font-semibold">
                        +{formatRupiah(group.dailyIncome)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Ledger Card Container */}
                <View className="rounded-2xl bg-surface border border-border overflow-hidden">
                  {group.items.map((item, index) => (
                    <TransactionItem
                      key={item.id}
                      item={item}
                      isLast={index === group.items.length - 1}
                      onPress={(selected) => setSelectedItemForDetail(selected)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Type Filter Modal (Semua, Masuk, Keluar) */}
      <ModalLayout
        visible={isTypeModalOpen}
        onClose={() => setIsTypeModalOpen(false)}
        title="Filter Jenis Mutasi"
        subtitle="Filter Transaksi Kantong"
        scrollable={false}
      >
        <View className="gap-2.5 pb-2">
          {([
            { id: 'all', label: 'Semua Mutasi', desc: 'Seluruh uang masuk, keluar, & pindah saldo', color: '#FFD165' },
            { id: 'income', label: 'Uang Masuk', desc: 'Pemasukan dan transfer masuk', color: '#10B981' },
            { id: 'expense', label: 'Uang Keluar', desc: 'Pengeluaran dan transfer keluar', color: '#EF4444' },
          ] as const).map((opt) => {
            const isSelected = typeFilter === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                className={`flex-row items-center p-3.5 rounded-xl border ${
                  isSelected ? 'bg-gold/10 border-gold/40' : 'bg-surface border-border'
                }`}
                onPress={() => {
                  setTypeFilter(opt.id);
                  setIsTypeModalOpen(false);
                }}
                activeOpacity={0.7}
              >
                <View
                  className="w-8 h-8 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: `${opt.color}20` }}
                >
                  <View className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: opt.color }} />
                </View>
                <View className="flex-1">
                  <Text
                    className={`font-manrope-semibold text-sm ${
                      isSelected ? 'text-gold-primary font-bold' : 'text-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </Text>
                  <Text className="font-manrope text-[11px] text-zinc-500 mt-0.5">{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View className="w-5 h-5 rounded-full bg-gold-primary items-center justify-center ml-2">
                    <Check size={12} color="#09090B" strokeWidth={3} />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ModalLayout>

      {/* Period Picker Modal */}
      <PeriodPickerModal
        visible={isPeriodModalOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        months={availableMonths}
        onClose={() => setIsPeriodModalOpen(false)}
        onSelectMonth={setDetailPeriod}
      />

      {/* Transaction Detail BottomSheet Modal */}
      <TransactionDetailModal
        visible={!!selectedItemForDetail}
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onDelete={handleDeleteTransaction}
      />
    </View>
  );
}
