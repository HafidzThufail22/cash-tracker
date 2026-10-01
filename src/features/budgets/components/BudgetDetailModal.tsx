import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Edit3,
  Trash2,
  Receipt,
  AlertTriangle,
} from 'lucide-react-native';
import { ModalLayout } from '../../../layouts/ModalLayout';
import {
  BudgetItemWithUsage,
  CategoryTransactionItem,
  getCategoryTransactionsForMonth,
} from '../../../database/repositories/budgetRepo';
import { BudgetProgressBar } from './BudgetProgressBar';
import { formatRupiah } from '../../../utils/currency';
import { formatTransactionDate } from '../../../utils/date';

interface BudgetDetailModalProps {
  visible: boolean;
  budget: BudgetItemWithUsage | null;
  year: number;
  month: number;
  onClose: () => void;
  onEditLimit: (budget: BudgetItemWithUsage) => void;
  onDelete: (budgetId: string) => Promise<boolean>;
}

export function BudgetDetailModal({
  visible,
  budget,
  year,
  month,
  onClose,
  onEditLimit,
  onDelete,
}: BudgetDetailModalProps) {
  const [transactions, setTransactions] = useState<CategoryTransactionItem[]>([]);
  const [isLoadingTx, setIsLoadingTx] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadTx() {
      if (!budget || !visible) return;
      try {
        setIsLoadingTx(true);
        const data = await getCategoryTransactionsForMonth(budget.categoryId, year, month);
        setTransactions(data);
      } catch (err) {
        console.error('Gagal memuat transaksi kategori:', err);
      } finally {
        setIsLoadingTx(false);
      }
    }

    loadTx();
  }, [budget, year, month, visible]);

  if (!budget) return null;

  const isOverbudget = budget.status === 'overbudget';

  const handleDelete = () => {
    Alert.alert(
      'Hapus Anggaran?',
      `Batas kuota anggaran untuk kategori "${budget.categoryName}" akan dihapus. Riwayat transaksi pengeluaran Anda tetap aman.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              const success = await onDelete(budget.id);
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
      title={budget.categoryName}
      subtitle="Evaluasi kuota & pengeluaran kategori"
    >
      <View style={styles.container}>
        {/* Performance Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Total Terpakai</Text>
              <Text
                style={[
                  styles.summarySpent,
                  isOverbudget && styles.summarySpentOverbudget,
                ]}
              >
                {formatRupiah(budget.spent)}
              </Text>
            </View>

            <View style={styles.badgePercentage}>
              {isOverbudget && (
                <AlertTriangle size={12} color="#EF4444" style={styles.alertIcon} />
              )}
              <Text
                style={[
                  styles.badgePercentageText,
                  isOverbudget
                    ? styles.badgeOverbudgetText
                    : styles.badgeSafeText,
                ]}
              >
                {budget.percentage}%
              </Text>
            </View>
          </View>

          <BudgetProgressBar
            percentage={budget.percentage}
            status={budget.status}
            height={8}
          />

          <View style={styles.summaryBottomRow}>
            <Text style={styles.plafonLabel}>
              Plafon: {formatRupiah(budget.amountLimit)}
            </Text>
            <Text
              style={[
                styles.remainingStatus,
                isOverbudget ? styles.overbudgetStatus : styles.remainingSafeStatus,
              ]}
            >
              {isOverbudget
                ? `Melebihi ${formatRupiah(Math.abs(budget.remaining))}`
                : `Tersisa ${formatRupiah(budget.remaining)}`}
            </Text>
          </View>
        </View>

        {/* Transactions Section */}
        <View style={styles.txSection}>
          <View style={styles.txSectionHeader}>
            <View style={styles.txTitleRow}>
              <Receipt size={15} color="#FFD165" />
              <Text style={styles.txSectionTitle}>Pengeluaran Bulan Ini</Text>
            </View>
            <Text style={styles.txCountBadge}>{transactions.length} catatan</Text>
          </View>

          <ScrollView style={styles.txListScroll} showsVerticalScrollIndicator={false}>
            {isLoadingTx ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="small" color="#FFD165" />
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyTxBox}>
                <Text style={styles.emptyTxText}>
                  Belum ada transaksi pengeluaran di kategori ini pada bulan yang dipilih.
                </Text>
              </View>
            ) : (
              transactions.map((tx, idx) => (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    idx !== transactions.length - 1 && styles.txBorderBottom,
                  ]}
                >
                  <View style={styles.txLeft}>
                    <Text style={styles.txNotes} numberOfLines={1}>
                      {tx.notes || budget.categoryName}
                    </Text>
                    <View style={styles.txMeta}>
                      <Text style={styles.txWallet}>{tx.walletName}</Text>
                      <Text style={styles.txDot}>•</Text>
                      <Text style={styles.txDate}>
                        {formatTransactionDate(tx.date)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.txAmount}>
                    -{formatRupiah(tx.amount)}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              onClose();
              onEditLimit(budget);
            }}
            activeOpacity={0.75}
          >
            <Edit3 size={15} color="#FFD165" strokeWidth={2} />
            <Text style={styles.editButtonText}>Ubah Plafon</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
            activeOpacity={0.75}
          >
            {isDeleting ? (
              <ActivityIndicator size="small" color="#EF4444" />
            ) : (
              <>
                <Trash2 size={15} color="#EF4444" strokeWidth={2} />
                <Text style={styles.deleteButtonText}>Hapus Anggaran</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 4,
  },
  summaryCard: {
    backgroundColor: '#1C1C20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    padding: 16,
    gap: 12,
  },
  summaryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 11,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  summarySpent: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: '#F4F4F5',
  },
  summarySpentOverbudget: {
    color: '#EF4444',
  },
  badgePercentage: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: '#131316',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  alertIcon: {
    marginRight: 4,
  },
  badgePercentageText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    fontWeight: '700',
  },
  badgeSafeText: {
    color: '#FFD165',
  },
  badgeOverbudgetText: {
    color: '#EF4444',
  },
  summaryBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  plafonLabel: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#A1A1AA',
  },
  remainingStatus: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
  remainingSafeStatus: {
    color: '#10B981',
  },
  overbudgetStatus: {
    color: '#EF4444',
  },
  txSection: {
    gap: 8,
  },
  txSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  txTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txSectionTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#F4F4F5',
  },
  txCountBadge: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    color: '#71717A',
  },
  txListScroll: {
    maxHeight: 180,
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.25)',
  },
  loadingBox: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxBox: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTxText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 16,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  txBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.6)',
  },
  txLeft: {
    flex: 1,
    marginRight: 12,
  },
  txNotes: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#F4F4F5',
    marginBottom: 2,
  },
  txMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txWallet: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 9,
    color: '#9B8F79',
    textTransform: 'uppercase',
  },
  txDot: {
    fontSize: 9,
    color: '#3F3F46',
  },
  txDate: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    color: '#71717A',
  },
  txAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  editButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  editButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#FFD165',
  },
  deleteButton: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  deleteButtonText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 13,
    color: '#EF4444',
  },
});
