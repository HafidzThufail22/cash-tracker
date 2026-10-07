import { create } from 'zustand';
import { getWalletsWithBalance, WalletWithBalance } from '../../../database/repositories/walletRepo';
import {
  getMonthlySummary,
  getRecentTransactions,
  getLatestTransactionPeriod,
  getAvailableTransactionMonths,
  RecentTransactionItem,
  AvailableMonth,
} from '../../../database/repositories/transactionRepo';

interface DashboardState {
  selectedYear: number;
  selectedMonth: number;
  selectedWalletId: string | null; // null: Semua Kantong
  availableMonths: AvailableMonth[];
  isBalanceHidden: boolean;
  totalNetBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  wallets: WalletWithBalance[];
  recentTransactions: RecentTransactionItem[];
  isLoading: boolean;

  setPeriod: (year: number, month: number) => void;
  setWalletId: (walletId: string | null) => void;
  toggleBalanceHidden: () => void;
  refreshDashboard: () => Promise<void>;
  initDashboard: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  selectedYear: new Date().getFullYear(),
  selectedMonth: new Date().getMonth() + 1,
  selectedWalletId: null,
  availableMonths: [],
  isBalanceHidden: false,
  totalNetBalance: 0,
  monthlyIncome: 0,
  monthlyExpense: 0,
  wallets: [],
  recentTransactions: [],
  isLoading: false,

  setPeriod: (year: number, month: number) => {
    set({ selectedYear: year, selectedMonth: month });
    get().refreshDashboard();
  },

  setWalletId: (walletId: string | null) => {
    set({ selectedWalletId: walletId });
    get().refreshDashboard();
  },

  toggleBalanceHidden: () => {
    set((state) => ({ isBalanceHidden: !state.isBalanceHidden }));
  },

  refreshDashboard: async () => {
    set({ isLoading: true });
    try {
      const { selectedYear, selectedMonth, selectedWalletId } = get();

      const [walletsData, monthlyData, recentData, monthsData] = await Promise.all([
        getWalletsWithBalance(),
        getMonthlySummary(selectedYear, selectedMonth, selectedWalletId),
        getRecentTransactions(8, selectedWalletId),
        getAvailableTransactionMonths(),
      ]);

      let displayedBalance = walletsData.totalNetBalance;
      if (selectedWalletId) {
        const found = walletsData.wallets.find((w) => w.id === selectedWalletId);
        displayedBalance = found ? found.balance : 0;
      }

      set({
        totalNetBalance: displayedBalance,
        wallets: walletsData.wallets,
        monthlyIncome: monthlyData.totalIncome,
        monthlyExpense: monthlyData.totalExpense,
        recentTransactions: recentData,
        availableMonths: monthsData,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      set({ isLoading: false });
    }
  },

  initDashboard: async () => {
    try {
      const period = await getLatestTransactionPeriod();
      set({ selectedYear: period.year, selectedMonth: period.month });
      await get().refreshDashboard();
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      await get().refreshDashboard();
    }
  },
}));

export function useDashboardSummary() {
  const store = useDashboardStore();
  return store;
}
