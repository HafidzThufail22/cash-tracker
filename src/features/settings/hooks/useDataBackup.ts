import { useState } from 'react';
import { Alert } from 'react-native';
import { db } from '../../../database/db';
import { wallets, categories, transactions, budgets } from '../../../database/schema';

export function useDataBackup() {
  const [isExporting, setIsExporting] = useState(false);

  const exportBackup = async () => {
    setIsExporting(true);
    try {
      const [wList, cList, tList, bList] = await Promise.all([
        db.select().from(wallets),
        db.select().from(categories),
        db.select().from(transactions),
        db.select().from(budgets),
      ]);

      const backupPayload = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        wallets: wList,
        categories: cList,
        transactions: tList,
        budgets: bList,
      };

      const summaryText = `Berhasil mengekspor snapshot data:\n• ${wList.length} Kantong Kas\n• ${tList.length} Transaksi\n• ${cList.length} Kategori\n• ${bList.length} Anggaran\n\nData siap dicadangkan.`;

      Alert.alert('Cadangan Data Siap', summaryText, [{ text: 'Tutup', style: 'default' }]);
      return backupPayload;
    } catch (err) {
      console.error('Ekspor cadangan gagal:', err);
      Alert.alert('Gagal', 'Terjadi kesalahan saat membaca basis data lokal.');
      return null;
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportBackup,
    isExporting,
  };
}
