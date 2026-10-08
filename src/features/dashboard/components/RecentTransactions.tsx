import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
    <View className="mt-1.5">
      {/* Section Header */}
      <View className="flex-row items-center justify-between px-0.5 mb-2.5">
        <View className="flex-row items-center gap-2">
          <History size={18} color="#FFD165" strokeWidth={2.2} />
          <Text className="font-manrope-bold text-base text-zinc-100 tracking-tight">Recent Activity</Text>
        </View>
        <TouchableOpacity
          className="flex-row items-center gap-0.5"
          onPress={onViewAllPress}
          activeOpacity={0.7}
        >
          <Text className="font-mono text-[11px] text-gold-primary uppercase tracking-wider">View History</Text>
          <ChevronRight size={14} color="#FFD165" />
        </TouchableOpacity>
      </View>

      {/* Ledger Card Container */}
      <View
        className="rounded-2xl bg-surface border border-border overflow-hidden"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 4,
        }}
      >
        {transactions.length === 0 ? (
          <View className="p-8 items-center justify-center">
            <Text className="font-manrope text-sm text-zinc-500">Belum ada riwayat transaksi</Text>
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
                className={`flex-row items-center p-3.5 ${!isLast ? 'border-b border-border/60' : ''}`}
                onPress={() => onTransactionPress?.(item)}
                activeOpacity={0.7}
              >
                {/* Left: Icon Container */}
                <View
                  className={`w-10 h-10 rounded-xl items-center justify-center bg-surface-lowest border mr-3 ${
                    isIncome
                      ? 'border-emerald-500/25'
                      : isTransfer
                      ? 'border-yellow-500/30'
                      : 'border-red-500/25'
                  }`}
                >
                  {getCategoryIcon(item.categoryName, item.type)}
                </View>

                {/* Center: Title & Subtitle */}
                <View className="flex-1 justify-center">
                  <Text className="font-manrope-semibold text-sm text-zinc-100 mb-0.5" numberOfLines={1}>
                    {item.notes || item.categoryName}
                  </Text>
                  <View className="flex-row items-center gap-1.5">
                    <Text className="font-mono text-[10px] uppercase tracking-wide text-[#9B8F79]" numberOfLines={1}>
                      {item.categoryName}
                    </Text>
                    <View className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
                    <Text className="font-mono text-[10px] text-zinc-500">
                      {formatTransactionDate(item.date)}
                    </Text>
                  </View>
                </View>

                {/* Right: Amount & Wallet */}
                <View className="items-end ml-2">
                  <Text
                    className={`font-mono text-[13px] tracking-tight mb-0.5 font-semibold ${
                      isIncome
                        ? 'text-semantic-income'
                        : isTransfer
                        ? 'text-gold-primary'
                        : 'text-semantic-expense'
                    }`}
                    numberOfLines={1}
                  >
                    {signedText}
                  </Text>
                  <Text className="font-mono text-[10px] uppercase tracking-wide text-zinc-500" numberOfLines={1}>
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
