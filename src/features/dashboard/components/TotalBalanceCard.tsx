import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, ChevronDown } from 'lucide-react-native';
import { formatRupiah } from '../../../utils/currency';

interface TotalBalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isBalanceHidden: boolean;
  onToggleBalance: () => void;
  selectedWalletName?: string;
  selectedWalletColor?: string | null;
  onOpenWalletPicker?: () => void;
}

export function TotalBalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  isBalanceHidden,
  onToggleBalance,
  selectedWalletName,
  selectedWalletColor,
  onOpenWalletPicker,
}: TotalBalanceCardProps) {
  const displayBalance = isBalanceHidden ? '••••••••' : formatRupiah(totalBalance, false);

  const balanceFadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    balanceFadeAnim.setValue(0.55);
    Animated.timing(balanceFadeAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [totalBalance, isBalanceHidden, selectedWalletName]);

  return (
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
      <View className="px-4 py-3.5">
        {/* Header: Indicator & Right Controls (Wallet Dropdown + Eye Toggle) */}
        <View className="flex-row items-center justify-between mb-1">
          <View className="flex-row items-center gap-1.5 flex-1">
            <View className="w-1.5 h-1.5 rounded-full bg-gold-primary" />
            <Text className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
              {selectedWalletName ? 'Net Balance' : 'Total Net Balance'}
            </Text>
          </View>

          <View className="flex-row items-center gap-1.5">
            {onOpenWalletPicker && (
              <TouchableOpacity
                className="flex-row items-center gap-1.5 h-7 px-2.5 rounded-full bg-[#111113] border border-border"
                onPress={onOpenWalletPicker}
                activeOpacity={0.7}
                accessibilityLabel="Pilih Kantong Kas"
                accessibilityRole="button"
              >
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: selectedWalletColor || '#FFD165' }}
                />
                <Text className="font-manrope-semibold text-[11px] text-zinc-200 max-w-[86px]" numberOfLines={1}>
                  {selectedWalletName || 'Semua'}
                </Text>
                <ChevronDown size={12} color="#71717A" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              className="w-7 h-7 rounded-full bg-[#111113] border border-border items-center justify-center"
              onPress={onToggleBalance}
              activeOpacity={0.7}
              accessibilityLabel="Sembunyikan / Tampilkan Saldo"
              accessibilityRole="button"
            >
              {isBalanceHidden ? (
                <EyeOff size={15} color="#A1A1AA" />
              ) : (
                <Eye size={15} color="#A1A1AA" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Nominal Display */}
        <Animated.View className="flex-row items-baseline gap-1.5 my-0.5" style={{ opacity: balanceFadeAnim }}>
          <Text className="font-grotesk text-lg text-gold-primary">Rp</Text>
          <Text
            className={`font-grotesk-bold text-[28px] text-zinc-100 ${
              isBalanceHidden ? 'tracking-[4px] text-[22px] text-zinc-400' : 'tracking-tight'
            }`}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayBalance}
          </Text>
        </Animated.View>

        {/* Hairline Divider */}
        <View className="h-[1px] bg-border my-2.5" />

        {/* Micro-stats: Income & Expense */}
        <View className="flex-row gap-2">
          {/* Income Box */}
          <View className="flex-1 flex-row items-center gap-2 px-2.5 py-2 rounded-xl bg-[#111113] border border-border">
            <View className="w-[26px] h-[26px] rounded-full bg-emerald-500/15 items-center justify-center">
              <ArrowUpRight size={14} color="#10B981" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5">Pemasukan</Text>
              <Text
                className="font-grotesk text-xs text-semantic-income"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {isBalanceHidden ? '••••' : formatRupiah(monthlyIncome)}
              </Text>
            </View>
          </View>

          {/* Expense Box */}
          <View className="flex-1 flex-row items-center gap-2 px-2.5 py-2 rounded-xl bg-[#111113] border border-border">
            <View className="w-[26px] h-[26px] rounded-full bg-red-500/15 items-center justify-center">
              <ArrowDownLeft size={14} color="#EF4444" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="font-manrope-medium text-[10px] text-zinc-500 mb-0.5">Pengeluaran</Text>
              <Text
                className="font-grotesk text-xs text-semantic-expense"
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {isBalanceHidden ? '••••' : formatRupiah(monthlyExpense)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
