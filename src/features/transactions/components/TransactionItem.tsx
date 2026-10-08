import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
      className={`flex-row items-center py-3.5 px-3.5 ${!isLast ? 'border-b border-border/60' : ''}`}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Left: Icon Box */}
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
            {isTransfer ? 'Transfer Saldo' : item.categoryName}
          </Text>
          {timeStr.length > 0 && (
            <>
              <View className="w-[3px] h-[3px] rounded-full bg-zinc-700" />
              <Text className="font-mono text-[10px] text-zinc-500">{timeStr}</Text>
            </>
          )}
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

        {isTransfer && item.toWalletName ? (
          <View className="flex-row items-center gap-1">
            <Text className="font-mono text-[10px] uppercase tracking-wide text-zinc-500" numberOfLines={1}>
              {item.walletName}
            </Text>
            <ArrowRight size={10} color="#71717A" />
            <Text className="font-mono text-[10px] uppercase tracking-wide text-zinc-500" numberOfLines={1}>
              {item.toWalletName}
            </Text>
          </View>
        ) : (
          <Text className="font-mono text-[10px] uppercase tracking-wide text-zinc-500" numberOfLines={1}>
            {item.walletName}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
