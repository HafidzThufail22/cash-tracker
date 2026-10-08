import { create } from 'zustand';
import {
  getWalletsWithBalance,
  WalletWithBalance,
  getWalletTransactions,
} from '../../../database/repositories/walletRepo';
import {
  RecentTransactionItem,
  AvailableMonth,
  getAvailableTransactionMonths,
} from '../../../database/repositories/transactionRepo';

export interface WalletWithPercentage extends WalletWithBalance {
  percentage: number;
}

interface WalletsState {
  wallets: WalletWithPercentage[];
  totalAssets: number;
  isLoading: boolean;
  selectedWallet: WalletWithBalance | null;
  selectedWalletTransactions: RecentTransactionItem[];
  availableMonths: AvailableMonth[];
  selectedYear: number;
  selectedMonth: number;
  isLoadingDetail: boolean;

  fetchWallets: () => Promise<void>;
  selectWalletForDetail: (wallet: WalletWithBalance) => Promise<void>;
  setDetailPeriod: (year: number, month: number) => Promise<void>;
  refreshDetail: () => Promise<void>;
  clearSelectedWallet: () => void;
}

const now = new Date();

export const useWalletsStore = create<WalletsState>((set, get) => ({
  wallets: [],
  totalAssets: 0,
  isLoading: false,
  selectedWallet: null,
  selectedWalletTransactions: [],
  availableMonths: [],
  selectedYear: now.getFullYear(),
  selectedMonth: now.getMonth() + 1,
  isLoadingDetail: false,

  fetchWallets: async () => {
    set({ isLoading: true });
    try {
      const data = await getWalletsWithBalance();
      const total = data.totalNetBalance > 0 ? data.totalNetBalance : 1;

      const walletsWithPct: WalletWithPercentage[] = data.wallets.map((w) => ({
        ...w,
        percentage:
          data.totalNetBalance > 0
            ? Math.max(0, Math.round((w.balance / total) * 100))
            : 0,
      }));

      const currentSelected = get().selectedWallet;
      let updatedSelected = currentSelected;
      if (currentSelected) {
        const found = data.wallets.find((w) => w.id === currentSelected.id);
        if (found) {
          updatedSelected = found;
        }
      }

      set({
        wallets: walletsWithPct,
        totalAssets: data.totalNetBalance,
        selectedWallet: updatedSelected,
        isLoading: false,
      });

      // Jika ada wallet yang sedang dibuka di detail, segarkan juga transaksinya
      if (updatedSelected) {
        const { selectedYear, selectedMonth } = get();
        const txs = await getWalletTransactions(
          updatedSelected.id,
          selectedYear,
          selectedMonth
        );
        set({ selectedWalletTransactions: txs });
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      set({ isLoading: false });
    }
  },

  selectWalletForDetail: async (wallet: WalletWithBalance) => {
    set({ selectedWallet: wallet, isLoadingDetail: true });
    try {
      const months = await getAvailableTransactionMonths();
      const activeYear = months.length > 0 ? months[0].year : new Date().getFullYear();
      const activeMonth = months.length > 0 ? months[0].month : new Date().getMonth() + 1;

      const txs = await getWalletTransactions(wallet.id, activeYear, activeMonth);

      set({
        availableMonths: months,
        selectedYear: activeYear,
        selectedMonth: activeMonth,
        selectedWalletTransactions: txs,
        isLoadingDetail: false,
      });
    } catch (error) {
      console.error('Error fetching wallet detail:', error);
      set({ isLoadingDetail: false });
    }
  },

  setDetailPeriod: async (year: number, month: number) => {
    const { selectedWallet } = get();
    if (!selectedWallet) return;

    set({ selectedYear: year, selectedMonth: month, isLoadingDetail: true });
    try {
      const txs = await getWalletTransactions(selectedWallet.id, year, month);
      set({ selectedWalletTransactions: txs, isLoadingDetail: false });
    } catch (error) {
      console.error('Error filtering wallet transactions:', error);
      set({ isLoadingDetail: false });
    }
  },

  refreshDetail: async () => {
    const { selectedWallet, selectedYear, selectedMonth } = get();
    if (!selectedWallet) return;

    try {
      const [data, months, txs] = await Promise.all([
        getWalletsWithBalance(),
        getAvailableTransactionMonths(),
        getWalletTransactions(selectedWallet.id, selectedYear, selectedMonth),
      ]);

      const found = data.wallets.find((w) => w.id === selectedWallet.id);
      set({
        selectedWallet: found || selectedWallet,
        availableMonths: months,
        selectedWalletTransactions: txs,
      });
    } catch (error) {
      console.error('Error refreshing wallet detail:', error);
    }
  },

  clearSelectedWallet: () => {
    set({ selectedWallet: null, selectedWalletTransactions: [] });
  },
}));

export function useWallets() {
  const store = useWalletsStore();
  return store;
}
