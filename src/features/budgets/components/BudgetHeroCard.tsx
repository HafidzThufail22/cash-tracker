import React from 'react';
import { View, Text } from 'react-native';
import { ShieldCheck, AlertTriangle } from 'lucide-react-native';
import { BudgetOverallSummary } from '../../../database/repositories/budgetRepo';
import { BudgetProgressBar } from './BudgetProgressBar';
import { formatRupiah } from '../../../utils/currency';

interface BudgetHeroCardProps {
  summary: BudgetOverallSummary;
  periodLabel: string;
}

export function BudgetHeroCard({ summary, periodLabel }: BudgetHeroCardProps) {
  const isOverbudget = summary.status === 'overbudget';
  const isWarning = summary.status === 'warning';

  return (
    <View
      className="rounded-[20px] bg-[#1C1C20] border border-gold/30 p-5 relative overflow-hidden gap-3.5"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 6,
      }}
    >
      {/* Decorative Golden Ambient Bloom */}
      <View className="absolute -top-10 -right-8 w-[140px] h-[140px] rounded-full bg-gold/10" />

      {/* Top Header */}
      <View className="flex-row items-start justify-between">
        <View>
          <Text className="font-mono text-[11px] uppercase tracking-wider text-[#D3C5AC] mb-0.5">
            Total Plafon Belanja
          </Text>
          <Text className="font-manrope text-xs text-zinc-400">{periodLabel}</Text>
        </View>

        <View className="px-2 py-0.5 rounded-[10px] bg-gold/10 border border-gold/30">
          <Text className="font-mono text-[10px] text-gold-primary font-semibold">
            {summary.budgetCount} Pos Anggaran
          </Text>
        </View>
      </View>

      {/* Big Total Budget Number */}
      <Text className="font-grotesk-bold text-[32px] text-zinc-100 tracking-tight">
        {formatRupiah(summary.totalBudget)}
      </Text>

      {/* Aggregate Progress Bar */}
      <View className="gap-1.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1.5">
            {isOverbudget ? (
              <AlertTriangle size={13} color="#EF4444" />
            ) : (
              <ShieldCheck size={13} color="#10B981" />
            )}
            <Text
              className={`font-manrope-semibold text-[11px] ${
                isOverbudget
                  ? 'text-semantic-expense'
                  : isWarning
                  ? 'text-amber-500'
                  : 'text-semantic-income'
              }`}
            >
              {isOverbudget
                ? 'Melebihi Kuota Anggaran'
                : isWarning
                ? 'Mendekati Batas Maksimal'
                : 'Pengeluaran Terkendali Aman'}
            </Text>
          </View>
          <Text className="font-mono text-xs text-zinc-300 font-bold">{summary.overallPercentage}%</Text>
        </View>

        <BudgetProgressBar
          percentage={summary.overallPercentage}
          status={summary.status}
          height={8}
        />
      </View>

      {/* 2-Column Split Details */}
      <View className="flex-row items-center pt-3 border-t border-border/80">
        <View className="flex-1 gap-0.5">
          <Text className="font-manrope text-[10px] text-zinc-500 uppercase tracking-wider">Total Terpakai</Text>
          <Text
            className={`font-mono text-sm font-semibold ${
              isOverbudget ? 'text-semantic-expense' : 'text-zinc-100'
            }`}
          >
            {formatRupiah(summary.totalSpent)}
          </Text>
        </View>

        <View className="w-[1px] h-7 bg-zinc-700/50 mx-3" />

        <View className="flex-1 items-end gap-0.5">
          <Text className="font-manrope text-[10px] text-zinc-500 uppercase tracking-wider">
            {isOverbudget ? 'Kelebihan Belanja' : 'Sisa Kuota'}
          </Text>
          <Text
            className={`font-mono text-sm font-semibold ${
              isOverbudget ? 'text-semantic-expense' : 'text-semantic-income'
            }`}
          >
            {isOverbudget
              ? `-${formatRupiah(Math.abs(summary.totalRemaining))}`
              : formatRupiah(summary.totalRemaining)}
          </Text>
        </View>
      </View>
    </View>
  );
}
