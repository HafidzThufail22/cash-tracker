import { useState } from 'react';
import { transferBetweenWallets, WalletWithBalance } from '../../../database/repositories/walletRepo';
import { useWalletsStore } from './useWallets';
import { useDashboardStore } from '../../dashboard/hooks/useDashboardSummary';

export function useWalletTransfer() {
  const [fromWalletId, setFromWalletId] = useState<string>('');
  const [toWalletId, setToWalletId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [notes, setNotes] = useState<string>('Pindah Saldo');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setAmount(0);
    setNotes('Pindah Saldo');
    setError(null);
  };

  const executeTransfer = async (
    wallets: WalletWithBalance[]
  ): Promise<{ success: boolean; message: string }> => {
    setError(null);

    if (!fromWalletId) {
      const msg = 'Pilih kantong asal pengiriman.';
      setError(msg);
      return { success: false, message: msg };
    }

    if (!toWalletId) {
      const msg = 'Pilih kantong tujuan penerimaan.';
      setError(msg);
      return { success: false, message: msg };
    }

    if (fromWalletId === toWalletId) {
      const msg = 'Kantong asal dan tujuan tidak boleh sama.';
      setError(msg);
      return { success: false, message: msg };
    }

    if (amount <= 0) {
      const msg = 'Nominal transfer harus lebih besar dari Rp 0.';
      setError(msg);
      return { success: false, message: msg };
    }

    const sourceWallet = wallets.find((w) => w.id === fromWalletId);
    if (sourceWallet && amount > sourceWallet.balance) {
      const msg = `Saldo tidak mencukupi. Saldo ${sourceWallet.name} saat ini Rp ${sourceWallet.balance.toLocaleString('id-ID')}.`;
      setError(msg);
      return { success: false, message: msg };
    }

    setIsSubmitting(true);
    try {
      const res = await transferBetweenWallets({
        fromWalletId,
        toWalletId,
        amount,
        notes,
      });

      if (res.success) {
        // Segarkan data di store Wallets dan Dashboard secara realtime
        await Promise.all([
          useWalletsStore.getState().fetchWallets(),
          useDashboardStore.getState().refreshDashboard(),
        ]);
        resetForm();
      } else {
        setError(res.message);
      }

      setIsSubmitting(false);
      return res;
    } catch (err) {
      setIsSubmitting(false);
      const msg = `Terjadi kesalahan transfer: ${String(err)}`;
      setError(msg);
      return { success: false, message: msg };
    }
  };

  return {
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
  };
}

