import { useState, useCallback, useEffect } from 'react';
import {
  BudgetItemWithUsage,
  BudgetOverallSummary,
  getBudgetsWithUsage,
  saveBudget,
  deleteBudget,
} from '../../../database/repositories/budgetRepo';
import {
  CategoryItem,
  getExpenseCategories,
} from '../../../database/repositories/categoryRepo';
import {
  AvailableMonth,
  getAvailableTransactionMonths,
  getLatestTransactionPeriod,
} from '../../../database/repositories/transactionRepo';

export function useBudgets() {
  const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const [budgets, setBudgets] = useState<BudgetItemWithUsage[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [summary, setSummary] = useState<BudgetOverallSummary>({
    totalBudget: 0,
    totalSpent: 0,
    totalRemaining: 0,
    overallPercentage: 0,
    status: 'safe',
    budgetCount: 0,
    overbudgetCount: 0,
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Inisialisasi daftar bulan & kategori pengeluaran
  const initBudgets = useCallback(async () => {
    try {
      setIsLoading(true);
      const [months, cats] = await Promise.all([
        getAvailableTransactionMonths(),
        getExpenseCategories(),
      ]);

      setAvailableMonths(months);
      setCategories(cats);

      if (months.length > 0) {
        setSelectedYear(months[0].year);
        setSelectedMonth(months[0].month);
      } else {
        const latest = await getLatestTransactionPeriod();
        setSelectedYear(latest.year);
        setSelectedMonth(latest.month);
      }
    } catch (err) {
      console.error('Gagal inisialisasi modul anggaran:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Memuat data anggaran & kalkulasi pemakaian di bulan terpilih
  const loadBudgetsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getBudgetsWithUsage(selectedYear, selectedMonth);
      setBudgets(data.budgets);
      setSummary(data.summary);
    } catch (err) {
      console.error('Gagal memuat data anggaran:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    initBudgets();
  }, [initBudgets]);

  useEffect(() => {
    loadBudgetsData();
  }, [loadBudgetsData]);

  // Pull to refresh
  const refresh = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [months, cats] = await Promise.all([
        getAvailableTransactionMonths(),
        getExpenseCategories(),
      ]);
      setAvailableMonths(months);
      setCategories(cats);
      await loadBudgetsData();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadBudgetsData]);

  // Simpan / Perbarui Anggaran
  const handleSaveBudget = useCallback(
    async (categoryId: string, limit: number): Promise<boolean> => {
      try {
        const success = await saveBudget(categoryId, limit);
        if (success) {
          await loadBudgetsData();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Gagal menyimpan batas anggaran:', err);
        return false;
      }
    },
    [loadBudgetsData]
  );

  // Hapus Anggaran
  const handleDeleteBudget = useCallback(
    async (budgetId: string): Promise<boolean> => {
      try {
        const success = await deleteBudget(budgetId);
        if (success) {
          await loadBudgetsData();
          return true;
        }
        return false;
      } catch (err) {
        console.error('Gagal menghapus anggaran:', err);
        return false;
      }
    },
    [loadBudgetsData]
  );

  return {
    availableMonths,
    selectedYear,
    selectedMonth,
    budgets,
    categories,
    summary,
    isLoading,
    isRefreshing,
    setSelectedPeriod: (year: number, month: number) => {
      setSelectedYear(year);
      setSelectedMonth(month);
    },
    saveBudget: handleSaveBudget,
    deleteBudget: handleDeleteBudget,
    refresh,
  };
}
