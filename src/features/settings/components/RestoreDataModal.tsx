import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Upload, AlertTriangle } from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { db } from '../../../database/db';
import { wallets, categories, transactions, budgets } from '../../../database/schema';

interface RestoreDataModalProps {
  visible: boolean;
  onClose: () => void;
  onRestoreSuccess?: () => void;
}

export function RestoreDataModal({
  visible,
  onClose,
  onRestoreSuccess,
}: RestoreDataModalProps) {
  const [jsonInput, setJsonInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = async () => {
    if (!jsonInput.trim()) {
      Alert.alert('Perhatian', 'Silakan tempel (paste) data JSON cadangan terlebih dahulu.');
      return;
    }

    let parsedData: any;
    try {
      parsedData = JSON.parse(jsonInput.trim());
    } catch (e) {
      Alert.alert(
        'Format Tidak Valid',
        'Teks yang Anda masukkan bukan JSON yang valid. Pastikan format teks sesuai hasil cadangan.'
      );
      return;
    }

    if (!parsedData.wallets && !parsedData.transactions) {
      Alert.alert(
        'Struktur Tidak Cocok',
        'Data JSON tidak memiliki struktur cadangan Cash Tracker (tidak ada tabel kantong kas / mutasi).'
      );
      return;
    }

    Alert.alert(
      'Konfirmasi Pemulihan Data',
      'Proses ini akan mengimpor data dari cadangan ke dalam basis data lokal. Lanjutkan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Pulihkan',
          style: 'default',
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Restore wallets
              if (Array.isArray(parsedData.wallets) && parsedData.wallets.length > 0) {
                for (const w of parsedData.wallets) {
                  await db.insert(wallets).values(w).onConflictDoNothing();
                }
              }

              // Restore categories
              if (Array.isArray(parsedData.categories) && parsedData.categories.length > 0) {
                for (const c of parsedData.categories) {
                  await db.insert(categories).values(c).onConflictDoNothing();
                }
              }

              // Restore transactions
              if (Array.isArray(parsedData.transactions) && parsedData.transactions.length > 0) {
                for (const t of parsedData.transactions) {
                  await db.insert(transactions).values(t).onConflictDoNothing();
                }
              }

              // Restore budgets
              if (Array.isArray(parsedData.budgets) && parsedData.budgets.length > 0) {
                for (const b of parsedData.budgets) {
                  await db.insert(budgets).values(b).onConflictDoNothing();
                }
              }

              Alert.alert(
                'Pemulihan Berhasil',
                'Data cadangan berhasil dipulihkan ke basis data lokal.',
                [
                  {
                    text: 'Selesai',
                    onPress: () => {
                      setJsonInput('');
                      onClose();
                      if (onRestoreSuccess) onRestoreSuccess();
                    },
                  },
                ]
              );
            } catch (err) {
              console.error('Pemulihan gagal:', err);
              Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data ke database.');
            } finally {
              setIsProcessing(false);
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
      title="Pulihkan Data"
      subtitle="Impor Cadangan JSON"
      scrollable
    >
      <View className="gap-4 pb-2">
        <View className="flex-row items-start bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 gap-2.5">
          <AlertTriangle size={18} color="#F59E0B" />
          <Text className="flex-1 font-manrope text-xs leading-[18px] text-amber-300">
            Tempel teks JSON hasil ekspor cadangan ke kolom di bawah. Data yang sudah ada tidak
            akan terduplikasi.
          </Text>
        </View>

        <View className="gap-1.5">
          <Text className="font-mono text-[10px] uppercase tracking-wider text-text-muted">
            TEKS JSON CADANGAN
          </Text>
          <TextInput
            className="bg-[#111113] border border-border rounded-xl p-3.5 h-40 font-mono text-xs text-text-primary"
            value={jsonInput}
            onChangeText={setJsonInput}
            placeholder='Tempel data JSON di sini (misal: {"version": "1.0.0", "wallets": [...], ...})'
            placeholderTextColor="#71717A"
            multiline
            numberOfLines={8}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          className={`flex-row items-center justify-center bg-gold-primary h-12 rounded-xl gap-2 ${
            isProcessing ? 'opacity-60' : ''
          }`}
          onPress={handleRestore}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#09090B" />
          ) : (
            <>
              <Upload size={18} color="#09090B" strokeWidth={2.5} />
              <Text className="font-manrope-bold text-sm text-background">Mulai Pulihkan Data</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ModalLayout>
  );
}
