import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  History,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  Coffee,
  ShoppingBag,
  Utensils,
  Car,
  Tag,
} from 'lucide-react-native';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatSignedRupiah } from '../../../utils/currency';
import { formatTransactionDate } from '../../../utils/date';

interface RecentTransactionsProps {
  transactions: RecentTransactionItem[];
  onViewAllPress?: () => void;
  onTransactionPress?: (item: RecentTransactionItem) => void;
}

function getCategoryIcon(name: string, type: number) {
  const lower = name.toLowerCase();
  if (type === 2) return <ArrowLeftRight size={18} color="#FFD165" strokeWidth={2.2} />;
  if (lower.includes('kopi') || lower.includes('coffee') || lower.includes('cafe')) {
    return <Coffee size={18} color="#EF4444" strokeWidth={2.2} />;
  }
  if (lower.includes('makan') || lower.includes('food') || lower.includes('drink')) {
    return <Utensils size={18} color="#EF4444" strokeWidth={2.2} />;
  }
  if (lower.includes('bensin') || lower.includes('parkir') || lower.includes('transport')) {
    return <Car size={18} color="#EF4444" strokeWidth={2.2} />;
  }
  if (lower.includes('belanja') || lower.includes('shopping')) {
    return <ShoppingBag size={18} color="#EF4444" strokeWidth={2.2} />;
  }
  if (type === 0) {
    return <TrendingUp size={18} color="#10B981" strokeWidth={2.2} />;
  }
  if (type === 1) {
    return <TrendingDown size={18} color="#EF4444" strokeWidth={2.2} />;
  }
  return <Tag size={18} color="#A1A1AA" strokeWidth={2.2} />;
}

export function RecentTransactions({
  transactions,
  onViewAllPress,
  onTransactionPress,
}: RecentTransactionsProps) {
  return (
    <View style={styles.container}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <View style={styles.titleRow}>
          <History size={18} color="#FFD165" strokeWidth={2.2} />
          <Text style={styles.titleText}>Recent Activity</Text>
        </View>
        <TouchableOpacity
          style={styles.viewHistoryButton}
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text style={styles.viewHistoryText}>View History</Text>
          <ChevronRight size={14} color="#FFD165" />
        </TouchableOpacity>
      </View>

      {/* Ledger Card Container */}
      <View style={styles.ledgerCard}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Belum ada riwayat transaksi</Text>
          </View>
        ) : (
          transactions.map((item, index) => {
            const isIncome = item.type === 0;
            const isExpense = item.type === 1;
            const isTransfer = item.type === 2;

            const signedText = formatSignedRupiah(
              item.amount,
              isIncome ? 'income' : isExpense ? 'expense' : 'transfer'
            );

            const isLast = index === transactions.length - 1;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemRow, !isLast && styles.itemBorderBottom]}
                onPress={() => onTransactionPress?.(item)}
                activeOpacity={0.7}
              >
                {/* Left: Icon Container */}
                <View
                  style={[
                    styles.iconBox,
                    isIncome
                      ? styles.incomeIconBox
                      : isTransfer
                      ? styles.transferIconBox
                      : styles.expenseIconBox,
                  ]}
                >
                  {getCategoryIcon(item.categoryName, item.type)}
                </View>

                {/* Center: Title & Subtitle */}
                <View style={styles.centerDetails}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.notes || item.categoryName}
                  </Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.categoryName} numberOfLines={1}>
                      {item.categoryName}
                    </Text>
                    <View style={styles.dotDivider} />
                    <Text style={styles.dateText}>
                      {formatTransactionDate(item.date)}
                    </Text>
                  </View>
                </View>

                {/* Right: Amount & Wallet */}
                <View style={styles.rightDetails}>
                  <Text
                    style={[
                      styles.amountText,
                      isIncome
                        ? styles.incomeAmount
                        : isTransfer
                        ? styles.transferAmount
                        : styles.expenseAmount,
                    ]}
                    numberOfLines={1}
                  >
                    {signedText}
                  </Text>
                  <Text style={styles.walletName} numberOfLines={1}>
                    {item.walletName}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  titleText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    letterSpacing: -0.2,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewHistoryText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#FFD165',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  ledgerCard: {
    borderRadius: 20,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    color: '#71717A',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  itemBorderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(39, 39, 42, 0.6)',
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    marginRight: 12,
  },
  incomeIconBox: {
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  expenseIconBox: {
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  transferIconBox: {
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  centerDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryName: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#9B8F79',
  },
  dotDivider: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#3F3F46',
  },
  dateText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: '#71717A',
  },
  rightDetails: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  amountText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
    letterSpacing: -0.2,
    marginBottom: 2,
    fontWeight: '600',
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  transferAmount: {
    color: '#FFD165',
  },
  walletName: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#71717A',
  },
});

