import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

  // Animasi transisi halus saat saldo berubah atau di-toggle
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
    <View style={styles.cardContainer}>
      <View style={styles.content}>
        {/* Header: Indicator & Right Controls (Wallet Dropdown + Eye Toggle) */}
        <View style={styles.headerRow}>
          <View style={styles.badgeRow}>
            <View style={styles.pulseDot} />
            <Text style={styles.badgeText}>
              {selectedWalletName ? 'Net Balance' : 'Total Net Balance'}
            </Text>
          </View>

          <View style={styles.headerRightActions}>
            {onOpenWalletPicker && (
              <TouchableOpacity
                style={styles.walletFilterPill}
                onPress={onOpenWalletPicker}
                activeOpacity={0.7}
                accessibilityLabel="Pilih Kantong Kas"
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.walletIndicatorDot,
                    { backgroundColor: selectedWalletColor || '#FFD165' },
                  ]}
                />
                <Text style={styles.walletFilterPillText} numberOfLines={1}>
                  {selectedWalletName || 'Semua'}
                </Text>
                <ChevronDown size={12} color="#71717A" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.eyeButton}
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

        {/* Balance Nominal Display (dengan Transisi Halus) */}
        <Animated.View style={[styles.balanceRow, { opacity: balanceFadeAnim }]}>
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
        </Animated.View>

        {/* Hairline Divider */}
        <View style={styles.divider} />

        {/* Micro-stats: Income & Expense (Format Rp Lengkap & Rapi) */}
        <View style={styles.statsGrid}>
          {/* Income Box */}
          <View style={styles.statBox}>
            <View style={styles.incomeIconWrapper}>
              <ArrowUpRight size={14} color="#10B981" strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Pemasukan</Text>
              <Text
                style={styles.incomeAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.85}
              >
                {isBalanceHidden ? '••••' : formatRupiah(monthlyIncome)}
              </Text>
            </View>
          </View>

          {/* Expense Box */}
          <View style={styles.statBox}>
            <View style={styles.expenseIconWrapper}>
              <ArrowDownLeft size={14} color="#EF4444" strokeWidth={2.5} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statLabel}>Pengeluaran</Text>
              <Text
                style={styles.expenseAmount}
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

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 16,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFD165',
  },
  badgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#A1A1AA',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  walletFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 28,
    paddingHorizontal: 9,
    borderRadius: 14,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  walletIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  walletFilterPillText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    color: '#E4E4E7',
    maxWidth: 86,
  },
  eyeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginVertical: 2,
  },
  currencyPrefix: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    color: '#FFD165',
  },
  balanceText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: '#F4F4F5',
    letterSpacing: -0.4,
  },
  balanceHiddenText: {
    letterSpacing: 4,
    fontSize: 22,
    color: '#A1A1AA',
  },
  divider: {
    height: 1,
    backgroundColor: '#27272A',
    marginVertical: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#111113',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  incomeIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expenseIconWrapper: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statTextContainer: {
    flex: 1,
  },
  statLabel: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 10,
    color: '#71717A',
    marginBottom: 2,
  },
  incomeAmount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: '#10B981',
  },
  expenseAmount: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 12,
    color: '#EF4444',
  },
});
