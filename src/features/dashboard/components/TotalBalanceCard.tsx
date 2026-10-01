import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';
import { formatRupiah } from '../../../utils/currency';

interface TotalBalanceCardProps {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  isBalanceHidden: boolean;
  onToggleBalance: () => void;
}

export function TotalBalanceCard({
  totalBalance,
  monthlyIncome,
  monthlyExpense,
  isBalanceHidden,
  onToggleBalance,
}: TotalBalanceCardProps) {
  const displayBalance = isBalanceHidden ? '••••••••' : formatRupiah(totalBalance, false);

  return (
    <View style={styles.cardContainer}>
      {/* Golden Atmospheric Glow Effect */}
      <View style={styles.goldenBloom} />

      <View style={styles.content}>
        {/* Header: Indicator & Eye Toggle */}
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>Total Net Balance</Text>
          </View>
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={onToggleBalance}
            activeOpacity={0.7}
            accessibilityLabel="Toggle Balance Visibility"
          >
            {isBalanceHidden ? (
              <EyeOff size={18} color="#A1A1AA" />
            ) : (
              <Eye size={18} color="#A1A1AA" />
            )}
          </TouchableOpacity>
        </View>

        {/* Balance Nominal Display */}
        <View style={styles.balanceRow}>
          <Text style={styles.currencyPrefix}>Rp</Text>
          <Text
            style={[
              styles.balanceText,
              isBalanceHidden && styles.balanceHiddenText,
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {displayBalance}
          </Text>
        </View>

        {/* Hairline Divider */}
        <View style={styles.divider} />

        {/* Micro-stats: Income & Expense */}
        <View style={styles.statsGrid}>
          {/* Income Box */}
          <View style={styles.statBox}>
            <View style={styles.incomeIconWrapper}>
              <ArrowUpRight size={16} color="#10B981" strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Income</Text>
              <Text style={styles.incomeAmount} numberOfLines={1}>
                {isBalanceHidden ? '••••' : `+${formatRupiah(monthlyIncome)}`}
              </Text>
            </View>
          </View>

          {/* Expense Box */}
          <View style={styles.statBox}>
            <View style={styles.expenseIconWrapper}>
              <ArrowDownLeft size={16} color="#EF4444" strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Expense</Text>
              <Text style={styles.expenseAmount} numberOfLines={1}>
                {isBalanceHidden ? '••••' : `-${formatRupiah(monthlyExpense)}`}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.28)',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 18,
    elevation: 8,
  },
  goldenBloom: {
    position: 'absolute',
    top: -40,
    right: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
  },
  content: {
    padding: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD165',
  },
  badgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#D3C5AC',
  },
  eyeButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(24, 24, 27, 0.6)',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginVertical: 4,
  },
  currencyPrefix: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 22,
    color: 'rgba(255, 209, 101, 0.85)',
  },
  balanceText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 34,
    color: '#F4F4F5',
    letterSpacing: -0.5,
  },
  balanceHiddenText: {
    letterSpacing: 4,
    fontSize: 26,
    color: '#A1A1AA',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(79, 70, 51, 0.3)',
    marginVertical: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(14, 14, 17, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.25)',
  },
  incomeIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#71717A',
    marginBottom: 2,
  },
  incomeAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  expenseAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
});

