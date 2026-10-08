import React from 'react';
import { View, Text } from 'react-native';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react-native';
import { MonthlyTotals } from '../hooks/useTransactions';
import { formatRupiah } from '../../../utils/currency';

interface MonthlySummaryCardProps {
  summary: MonthlyTotals;
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const isNetPositive = summary.netCashFlow >= 0;

  return (
    <View className="px-4 my-1.5">
      <View
        className="flex-row items-center justify-between bg-surface rounded-2xl border border-gold/30 py-3.5 px-3"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          elevation: 2,
        }}
      >
        {/* Income Column */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1 mb-1">
            <View className="w-[18px] h-[18px] rounded-full bg-emerald-500/15 items-center justify-center">
              <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text className="font-manrope-medium text-[10px] text-zinc-400 tracking-wide">Pemasukan</Text>
          </View>
          <Text className="font-mono text-xs font-bold text-semantic-income tracking-tight" numberOfLines={1}>
            {formatRupiah(summary.totalIncome)}
          </Text>
        </View>

        <View className="w-[1px] h-7 bg-zinc-700/50" />

        {/* Expense Column */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1 mb-1">
            <View className="w-[18px] h-[18px] rounded-full bg-red-500/15 items-center justify-center">
              <TrendingDown size={12} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text className="font-manrope-medium text-[10px] text-zinc-400 tracking-wide">Pengeluaran</Text>
          </View>
          <Text className="font-mono text-xs font-bold text-semantic-expense tracking-tight" numberOfLines={1}>
            {formatRupiah(summary.totalExpense)}
          </Text>
        </View>

        <View className="w-[1px] h-7 bg-zinc-700/50" />

        {/* Net Flow Column */}
        <View className="flex-1 items-center">
          <View className="flex-row items-center gap-1 mb-1">
            <View className="w-[18px] h-[18px] rounded-full bg-gold/15 items-center justify-center">
              <Scale size={12} color="#FFD165" strokeWidth={2.5} />
            </View>
            <Text className="font-manrope-medium text-[10px] text-zinc-400 tracking-wide">Net Cash Flow</Text>
          </View>
          <Text
            className={`font-mono text-xs font-bold tracking-tight ${
              isNetPositive ? 'text-gold-primary' : 'text-red-400'
            }`}
            numberOfLines={1}
          >
            {isNetPositive ? `+${formatRupiah(summary.netCashFlow)}` : `-${formatRupiah(Math.abs(summary.netCashFlow))}`}
          </Text>
        </View>
      </View>
    </View>
  );
}
