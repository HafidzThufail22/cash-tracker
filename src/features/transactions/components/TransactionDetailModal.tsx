import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Trash2,
  Calendar,
  Wallet,
  Tag,
  FileText,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
} from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatSignedRupiah } from '../../../utils/currency';
import { formatFullDateTime } from '../../../utils/date';

interface TransactionDetailModalProps {
  visible: boolean;
  item: RecentTransactionItem | null;
  onClose: () => void;
  onDelete: (transactionId: string) => Promise<boolean>;
}

export function TransactionDetailModal({
  visible,
  item,
  onClose,
  onDelete,
}: TransactionDetailModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!item) return null;

  const isIncome = item.type === 0;
  const isExpense = item.type === 1;
  const isTransfer = item.type === 2;

  const typeLabel = isIncome
    ? 'Pemasukan'
    : isExpense
    ? 'Pengeluaran'
    : 'Pindah Saldo (Transfer)';

  const signedAmount = formatSignedRupiah(
    item.amount,
    isIncome ? 'income' : isExpense ? 'expense' : 'transfer'
  );

  const handleDeletePress = () => {
    Alert.alert(
      'Hapus Transaksi?',
      'Transaksi ini akan dihapus secara permanen. Saldo kantong terkait akan otomatis disesuaikan kembali.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const success = await onDelete(item.id);
              if (success) {
                onClose();
              }
            } finally {
              setIsDeleting(false);
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
      title="Rincian Mutasi"
      subtitle={typeLabel}
    >
      <View style={styles.container}>
        {/* Big Amount Card */}
        <View style={styles.amountCard}>
          <View
            style={[
              styles.typeBadge,
              isIncome
                ? styles.incomeBadge
                : isTransfer
                ? styles.transferBadge
                : styles.expenseBadge,
            ]}
          >
            {isIncome ? (
              <TrendingUp size={14} color="#10B981" />
            ) : isTransfer ? (
              <ArrowLeftRight size={14} color="#FFD165" />
            ) : (
              <TrendingDown size={14} color="#EF4444" />
            )}
            <Text
              style={[
                styles.typeBadgeText,
                isIncome
                  ? styles.incomeBadgeText
                  : isTransfer
                  ? styles.transferBadgeText
                  : styles.expenseBadgeText,
              ]}
            >
              {typeLabel}
            </Text>
          </View>

          <Text
            style={[
              styles.amountText,
              isIncome
                ? styles.incomeAmountText
                : isTransfer
                ? styles.transferAmountText
                : styles.expenseAmountText,
            ]}
          >
            {signedAmount}
          </Text>
        </View>

        {/* Detailed Metadata Fields */}
        <View style={styles.detailsCard}>
          {/* Tanggal & Waktu */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Calendar size={16} color="#71717A" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Waktu Mutasi</Text>
              <Text style={styles.detailValue}>{formatFullDateTime(item.date)}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Kategori */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Tag size={16} color="#71717A" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>Kategori</Text>
              <Text style={styles.detailValue}>
                {isTransfer ? 'Transfer Antar-Kantong' : item.categoryName}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Kantong */}
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrapper}>
              <Wallet size={16} color="#71717A" />
            </View>
            <View style={styles.detailInfo}>
              <Text style={styles.detailLabel}>
                {isTransfer ? 'Alur Kantong' : 'Kantong'}
              </Text>
              {isTransfer && item.toWalletName ? (
                <View style={styles.transferFlow}>
                  <Text style={styles.walletHighlight}>{item.walletName}</Text>
                  <ArrowRight size={14} color="#FFD165" />
                  <Text style={styles.walletHighlight}>{item.toWalletName}</Text>
                </View>
              ) : (
                <Text style={styles.detailValue}>{item.walletName}</Text>
              )}
            </View>
          </View>

          {/* Catatan (jika ada) */}
          {item.notes && item.notes.trim().length > 0 && (
            <>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrapper}>
                  <FileText size={16} color="#71717A" />
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailLabel}>Catatan Deskripsi</Text>
                  <Text style={styles.notesValue}>{item.notes}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePress}
          disabled={isDeleting}
          activeOpacity={0.75}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <>
              <Trash2 size={16} color="#EF4444" strokeWidth={2.2} />
              <Text style={styles.deleteButtonText}>Hapus Transaksi</Text>
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
  amountCard: {
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  incomeBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  expenseBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  transferBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  typeBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  incomeBadgeText: {
    color: '#10B981',
  },
  expenseBadgeText: {
    color: '#EF4444',
  },
  transferBadgeText: {
    color: '#FFD165',
  },
  amountText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
  },
  incomeAmountText: {
    color: '#10B981',
  },
  expenseAmountText: {
    color: '#EF4444',
  },
  transferAmountText: {
    color: '#FFD165',
  },
  detailsCard: {
    backgroundColor: '#18181B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.25)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  detailIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#131316',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailInfo: {
    flex: 1,
  },
  detailLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 11,
    color: '#71717A',
    marginBottom: 2,
  },
  detailValue: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#F4F4F5',
  },
  notesValue: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#D4D4D8',
    lineHeight: 18,
  },
  transferFlow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  walletHighlight: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: '#FFD165',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(39, 39, 42, 0.6)',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginTop: 4,
  },
  deleteButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#EF4444',
  },
});
