import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TrendingUp, TrendingDown, Scale } from 'lucide-react-native';
import { MonthlyTotals } from '../hooks/useTransactions';
import { formatRupiah } from '../../../utils/currency';

interface MonthlySummaryCardProps {
  summary: MonthlyTotals;
}

export function MonthlySummaryCard({ summary }: MonthlySummaryCardProps) {
  const isNetPositive = summary.netCashFlow >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Income Column */}
        <View style={styles.col}>
          <View style={styles.colHeader}>
            <View style={[styles.iconDot, styles.incomeDot]}>
              <TrendingUp size={12} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.colLabel}>Pemasukan</Text>
          </View>
          <Text style={[styles.amountText, styles.incomeAmount]} numberOfLines={1}>
            {formatRupiah(summary.totalIncome)}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        {/* Expense Column */}
        <View style={styles.col}>
          <View style={styles.colHeader}>
            <View style={[styles.iconDot, styles.expenseDot]}>
              <TrendingDown size={12} color="#EF4444" strokeWidth={2.5} />
            </View>
            <Text style={styles.colLabel}>Pengeluaran</Text>
          </View>
          <Text style={[styles.amountText, styles.expenseAmount]} numberOfLines={1}>
            {formatRupiah(summary.totalExpense)}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        {/* Net Flow Column */}
        <View style={styles.col}>
          <View style={styles.colHeader}>
            <View style={[styles.iconDot, styles.netDot]}>
              <Scale size={12} color="#FFD165" strokeWidth={2.5} />
            </View>
            <Text style={styles.colLabel}>Net Cash Flow</Text>
          </View>
          <Text
            style={[
              styles.amountText,
              isNetPositive ? styles.netPositiveAmount : styles.netNegativeAmount,
            ]}
            numberOfLines={1}
          >
            {isNetPositive ? `+${formatRupiah(summary.netCashFlow)}` : `-${formatRupiah(Math.abs(summary.netCashFlow))}`}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#18181B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    paddingVertical: 14,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  colHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  iconDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomeDot: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  expenseDot: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  netDot: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
  },
  colLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#A1A1AA',
    letterSpacing: 0.2,
  },
  amountText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  incomeAmount: {
    color: '#10B981',
  },
  expenseAmount: {
    color: '#EF4444',
  },
  netPositiveAmount: {
    color: '#FFD165',
  },
  netNegativeAmount: {
    color: '#F87171',
  },
  verticalDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(63, 63, 70, 0.5)',
  },
});
