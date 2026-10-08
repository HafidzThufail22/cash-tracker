import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import {
  Utensils,
  Coffee,
  ShoppingBag,
  Car,
  Tag,
  AlertTriangle,
  ChevronRight,
  Receipt,
} from 'lucide-react-native';
import { BudgetItemWithUsage } from '../../../database/repositories/budgetRepo';
import { BudgetProgressBar } from './BudgetProgressBar';
import { formatRupiah } from '../../../utils/currency';

interface BudgetCardProps {
  budget: BudgetItemWithUsage;
  onPress: (budget: BudgetItemWithUsage) => void;
}

function getCategoryIcon(name: string, color: string | null) {
  const lower = name.toLowerCase();
  const iconColor = color || '#FFD165';

  if (lower.includes('kopi') || lower.includes('coffee') || lower.includes('cafe')) {
    return <Coffee size={18} color={iconColor} strokeWidth={2.2} />;
  }
  if (lower.includes('makan') || lower.includes('food') || lower.includes('drink')) {
    return <Utensils size={18} color={iconColor} strokeWidth={2.2} />;
  }
  if (lower.includes('bensin') || lower.includes('parkir') || lower.includes('transport')) {
    return <Car size={18} color={iconColor} strokeWidth={2.2} />;
  }
  if (lower.includes('belanja') || lower.includes('shopping')) {
    return <ShoppingBag size={18} color={iconColor} strokeWidth={2.2} />;
  }
  return <Tag size={18} color={iconColor} strokeWidth={2.2} />;
}

export function BudgetCard({ budget, onPress }: BudgetCardProps) {
  const isOverbudget = budget.status === 'overbudget';
  const isWarning = budget.status === 'warning';

  return (
    <TouchableOpacity
      className={`bg-surface rounded-[18px] border p-4 gap-3 ${
        isOverbudget
          ? 'border-red-500/40'
          : isWarning
          ? 'border-amber-500/40'
          : 'border-gold/30'
      }`}
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 2,
      }}
      onPress={() => onPress(budget)}
      activeOpacity={0.75}
    >
      {/* Top Row: Category Icon & Title & Status Badge */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <View
            className={`w-[38px] h-[38px] rounded-xl bg-surface-lowest border items-center justify-center ${
              isOverbudget
                ? 'border-red-500/35'
                : isWarning
                ? 'border-amber-500/35'
                : 'border-gold/30'
            }`}
          >
            {getCategoryIcon(budget.categoryName, budget.categoryColor)}
          </View>
          <View>
            <Text className="font-manrope-semibold text-sm text-zinc-100 mb-0.5" numberOfLines={1}>
              {budget.categoryName}
            </Text>
            <View className="flex-row items-center gap-1">
              <Receipt size={10} color="#71717A" />
              <Text className="font-mono text-[10px] text-zinc-500">
                {budget.transactionCount} transaksi bulan ini
              </Text>
            </View>
          </View>
        </View>

        {/* Percentage Badge */}
        <View
          className={`flex-row items-center px-2 py-0.5 rounded-[10px] border ${
            isOverbudget
              ? 'bg-red-500/10 border-red-500/30'
              : isWarning
              ? 'bg-amber-500/10 border-amber-500/30'
              : 'bg-gold/10 border-gold/25'
          }`}
        >
          {isOverbudget && (
            <AlertTriangle size={11} color="#EF4444" style={{ marginRight: 3 }} />
          )}
          <Text
            className={`font-mono text-[11px] font-bold ${
              isOverbudget
                ? 'text-semantic-expense'
                : isWarning
                ? 'text-amber-500'
                : 'text-gold-primary'
            }`}
          >
            {budget.percentage}%
          </Text>
        </View>
      </View>

      {/* Amount Numbers Row */}
      <View className="flex-row justify-between items-end">
        <View className="gap-0.5">
          <Text className="font-manrope text-[10px] text-zinc-500 uppercase tracking-wider">Terpakai</Text>
          <Text
            className={`font-grotesk-bold text-lg ${
              isOverbudget ? 'text-semantic-expense' : 'text-zinc-100'
            }`}
          >
            {formatRupiah(budget.spent)}
          </Text>
        </View>

        <View className="items-end gap-0.5">
          <Text className="font-manrope text-[10px] text-zinc-500 uppercase tracking-wider">Plafon</Text>
          <Text className="font-mono text-[13px] text-zinc-400">{formatRupiah(budget.amountLimit)}</Text>
        </View>
      </View>

      {/* Dynamic Progress Bar */}
      <BudgetProgressBar percentage={budget.percentage} status={budget.status} height={7} />

      {/* Bottom Status / Remaining Row */}
      <View className="flex-row items-center justify-between pt-0.5">
        {isOverbudget ? (
          <Text className="font-manrope-semibold text-xs text-semantic-expense">
            Melebihi kuota {formatRupiah(Math.abs(budget.remaining))}
          </Text>
        ) : (
          <Text className="font-manrope-medium text-xs text-semantic-income">
            Tersisa {formatRupiah(budget.remaining)}
          </Text>
        )}

        <View className="flex-row items-center gap-0.5">
          <Text className="font-mono text-[11px] text-zinc-500">Detail</Text>
          <ChevronRight size={13} color="#71717A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}
