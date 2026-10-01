import { create } from 'zustand';
import {
  getWalletsWithBalance,
  WalletWithBalance,
  getWalletTransactions,
} from '../../../database/repositories/walletRepo';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';

export interface WalletWithPercentage extends WalletWithBalance {
  percentage: number;
}

interface WalletsState {
  wallets: WalletWithPercentage[];
  totalAssets: number;
  isLoading: boolean;
  selectedWallet: WalletWithBalance | null;
  selectedWalletTransactions: RecentTransactionItem[];
  isLoadingDetail: boolean;

  fetchWallets: () => Promise<void>;
  selectWalletForDetail: (wallet: WalletWithBalance) => Promise<void>;
  clearSelectedWallet: () => void;
}

export const useWalletsStore = create<WalletsState>((set, get) => ({
  wallets: [],
  totalAssets: 0,
  isLoading: false,
  selectedWallet: null,
  selectedWalletTransactions: [],
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

      set({
        wallets: walletsWithPct,
        totalAssets: data.totalNetBalance,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching wallets:', error);
      set({ isLoading: false });
    }
  },

  selectWalletForDetail: async (wallet: WalletWithBalance) => {
    set({ selectedWallet: wallet, isLoadingDetail: true });
    try {
      const txs = await getWalletTransactions(wallet.id);
      set({ selectedWalletTransactions: txs, isLoadingDetail: false });
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
      set({ isLoadingDetail: false });
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

