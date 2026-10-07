import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Upload, AlertTriangle, CheckCircle2 } from 'lucide-react-native';
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
      <View style={styles.container}>
        <View style={styles.infoBanner}>
          <AlertTriangle size={18} color="#F59E0B" />
          <Text style={styles.infoText}>
            Tempel teks JSON hasil ekspor cadangan ke kolom di bawah. Data yang sudah ada tidak
            akan terduplikasi.
          </Text>
        </View>

        <View style={styles.inputField}>
          <Text style={styles.inputLabel}>TEKS JSON CADANGAN</Text>
          <TextInput
            style={styles.textArea}
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
          style={[styles.restoreBtn, isProcessing && { opacity: 0.6 }]}
          onPress={handleRestore}
          disabled={isProcessing}
          activeOpacity={0.8}
        >
          {isProcessing ? (
            <ActivityIndicator size="small" color="#09090B" />
          ) : (
            <>
              <Upload size={18} color="#09090B" strokeWidth={2.5} />
              <Text style={styles.restoreBtnText}>Mulai Pulihkan Data</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 8,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    lineHeight: 18,
    color: '#FCD34D',
  },
  inputField: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: '#A1A1AA',
  },
  textArea: {
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    height: 160,
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 12,
    color: '#F4F4F5',
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD165',
    height: 48,
    borderRadius: 14,
    gap: 8,
  },
  restoreBtnText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 14,
    color: '#09090B',
  },
});
