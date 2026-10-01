import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  RecentTransactionItem,
  AvailableMonth,
  getAvailableTransactionMonths,
  getTransactionsByMonthAndFilters,
  getMonthlyTotals,
  deleteTransaction,
  getLatestTransactionPeriod,
} from '../../../database/repositories/transactionRepo';
import { getDateKey, formatDayHeader } from '../../../utils/date';
import { useDashboardStore } from '../../dashboard/hooks/useDashboardSummary';
import { useWalletsStore } from '../../wallets/hooks/useWallets';

export type TransactionTypeFilter = 'all' | 0 | 1 | 2;

export interface GroupedTransactions {
  dateKey: string;
  displayDate: string;
  dailyIncome: number;
  dailyExpense: number;
  items: RecentTransactionItem[];
}

export interface MonthlyTotals {
  totalIncome: number;
  totalExpense: number;
  totalTransfer: number;
  netCashFlow: number;
}

export function useTransactions() {
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [rawTransactions, setRawTransactions] = useState<RecentTransactionItem[]>([]);
  const [summary, setSummary] = useState<MonthlyTotals>({
    totalIncome: 0,
    totalExpense: 0,
    totalTransfer: 0,
    netCashFlow: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Inisialisasi daftar bulan & set bulan terpilih ke periode transaksi terbaru
  const initHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      const months = await getAvailableTransactionMonths();
      setAvailableMonths(months);

      if (months.length > 0) {
        setSelectedYear(months[0].year);
        setSelectedMonth(months[0].month);
      } else {
        const latest = await getLatestTransactionPeriod();
        setSelectedYear(latest.year);
        setSelectedMonth(latest.month);
      }
    } catch (err) {
      console.error('Gagal memuat bulan riwayat transaksi:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memuat data transaksi & ringkasan untuk bulan & filter yang aktif
  const loadTransactionsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [items, totals] = await Promise.all([
        getTransactionsByMonthAndFilters({
          year: selectedYear,
          month: selectedMonth,
          type: selectedType,
          searchQuery,
        }),
        getMonthlyTotals(selectedYear, selectedMonth),
      ]);

      setRawTransactions(items);
      setSummary(totals);
    } catch (err) {
      console.error('Gagal mengambil daftar mutasi transaksi:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth, selectedType, searchQuery]);

  // Efek inisialisasi awal
  useEffect(() => {
    initHistory();
  }, [initHistory]);

  // Efek setiap kali periode atau filter berubah
  useEffect(() => {
    loadTransactionsData();
  }, [loadTransactionsData]);

  // Fungsi pull-to-refresh
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const months = await getAvailableTransactionMonths();
      setAvailableMonths(months);
      await loadTransactionsData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadTransactionsData]);

  // Mengelompokkan transaksi per tanggal (Grouped by Date)
  const groupedTransactions = useMemo<GroupedTransactions[]>(() => {
    const groupsMap = new Map<string, {
      dateKey: string;
      displayDate: string;
      dailyIncome: number;
      dailyExpense: number;
      items: RecentTransactionItem[];
    }>();

    for (const item of rawTransactions) {
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

      if (item.type === 0) {
        group.dailyIncome += item.amount;
      } else if (item.type === 1) {
        group.dailyExpense += item.amount;
      }
    }

    return Array.from(groupsMap.values());
  }, [rawTransactions]);

  // Fungsi hapus transaksi
  const handleDeleteTransaction = useCallback(
    async (transactionId: string): Promise<boolean> => {
      try {
        const success = await deleteTransaction(transactionId);
        if (success) {
          // Refresh list transaksi saat ini
          await loadTransactionsData();
          // Sinkronisasi pembaruan ke store dashboard dan wallets
          useDashboardStore.getState().refreshDashboard();
          useWalletsStore.getState().fetchWallets();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Gagal menghapus transaksi:', err);
        return false;
      }
    },
    [loadTransactionsData]
  );

  return {
    availableMonths,
    selectedYear,
    selectedMonth,
    selectedType,
    searchQuery,
    rawTransactions,
    groupedTransactions,
    summary,
    isLoading,
    isRefreshing,
    setSelectedPeriod: (year: number, month: number) => {
      setSelectedYear(year);
      setSelectedMonth(month);
    },
    setSelectedType,
    setSearchQuery,
    refresh,
    deleteTransaction: handleDeleteTransaction,
  };
}
