import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Coffee,
  ShoppingBag,
  Utensils,
  Car,
  Tag,
  ArrowRight,
} from 'lucide-react-native';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatSignedRupiah } from '../../../utils/currency';

interface TransactionItemProps {
  item: RecentTransactionItem;
  onPress?: (item: RecentTransactionItem) => void;
  isLast?: boolean;
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

function formatItemTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch {
    return '';
  }
}

export function TransactionItem({ item, onPress, isLast = false }: TransactionItemProps) {
  const isIncome = item.type === 0;
  const isExpense = item.type === 1;
  const isTransfer = item.type === 2;

  const signedText = formatSignedRupiah(
    item.amount,
    isIncome ? 'income' : isExpense ? 'expense' : 'transfer'
  );

  const timeStr = formatItemTime(item.date);

  return (
    <TouchableOpacity
      style={[styles.itemRow, !isLast && styles.itemBorderBottom]}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Left: Icon Box */}
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
            {isTransfer ? 'Transfer Saldo' : item.categoryName}
          </Text>
          {timeStr.length > 0 && (
            <>
              <View style={styles.dotDivider} />
              <Text style={styles.timeText}>{timeStr}</Text>
            </>
          )}
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

        {isTransfer && item.toWalletName ? (
          <View style={styles.transferWalletRow}>
            <Text style={styles.walletName} numberOfLines={1}>
              {item.walletName}
            </Text>
            <ArrowRight size={10} color="#71717A" />
            <Text style={styles.walletName} numberOfLines={1}>
              {item.toWalletName}
            </Text>
          </View>
        ) : (
          <Text style={styles.walletName} numberOfLines={1}>
            {item.walletName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 14,
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
  timeText: {
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
  transferWalletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
});
