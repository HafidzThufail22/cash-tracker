import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
    <View style={styles.card}>
      {/* Decorative Golden Ambient Bloom */}
      <View style={styles.goldenBloom} />

      {/* Top Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerSubtitle}>Total Plafon Belanja</Text>
          <Text style={styles.periodText}>{periodLabel}</Text>
        </View>

        <View style={styles.badgeCount}>
          <Text style={styles.badgeCountText}>
            {summary.budgetCount} Pos Anggaran
          </Text>
        </View>
      </View>

      {/* Big Total Budget Number */}
      <Text style={styles.totalBudgetAmount}>
        {formatRupiah(summary.totalBudget)}
      </Text>

      {/* Aggregate Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.healthStatus}>
            {isOverbudget ? (
              <AlertTriangle size={13} color="#EF4444" />
            ) : (
              <ShieldCheck size={13} color="#10B981" />
            )}
            <Text
              style={[
                styles.healthStatusText,
                isOverbudget
                  ? styles.healthStatusTextOverbudget
                  : isWarning
                  ? styles.healthStatusTextWarning
                  : styles.healthStatusTextSafe,
              ]}
            >
              {isOverbudget
                ? 'Melebihi Kuota Anggaran'
                : isWarning
                ? 'Mendekati Batas Maksimal'
                : 'Pengeluaran Terkendali Aman'}
            </Text>
          </View>
          <Text style={styles.percentageText}>{summary.overallPercentage}%</Text>
        </View>

        <BudgetProgressBar
          percentage={summary.overallPercentage}
          status={summary.status}
          height={8}
        />
      </View>

      {/* 2-Column Split Details */}
      <View style={styles.splitRow}>
        <View style={styles.splitCol}>
          <Text style={styles.splitLabel}>Total Terpakai</Text>
          <Text
            style={[
              styles.splitValue,
              isOverbudget && styles.splitValueOverbudget,
            ]}
          >
            {formatRupiah(summary.totalSpent)}
          </Text>
        </View>

        <View style={styles.splitDivider} />

        <View style={[styles.splitCol, styles.splitColRight]}>
          <Text style={styles.splitLabel}>
            {isOverbudget ? 'Kelebihan Belanja' : 'Sisa Kuota'}
          </Text>
          <Text
            style={[
              styles.splitValue,
              isOverbudget ? styles.splitValueOverbudget : styles.splitValueRemaining,
            ]}
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

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    backgroundColor: '#1C1C20',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.28)',
    padding: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 6,
    gap: 14,
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerSubtitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: '#D3C5AC',
    marginBottom: 2,
  },
  periodText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
  },
  badgeCount: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  badgeCountText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    color: '#FFD165',
    fontWeight: '600',
  },
  totalBudgetAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: '#F4F4F5',
    letterSpacing: -0.5,
  },
  progressSection: {
    gap: 6,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  healthStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthStatusText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
  },
  healthStatusTextSafe: {
    color: '#10B981',
  },
  healthStatusTextWarning: {
    color: '#F59E0B',
  },
  healthStatusTextOverbudget: {
    color: '#EF4444',
  },
  percentageText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 12,
    color: '#D4D4D8',
    fontWeight: '700',
  },
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(39, 39, 42, 0.8)',
  },
  splitCol: {
    flex: 1,
    gap: 2,
  },
  splitColRight: {
    alignItems: 'flex-end',
  },
  splitDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(63, 63, 70, 0.5)',
    marginHorizontal: 12,
  },
  splitLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  splitValue: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 14,
    color: '#F4F4F5',
    fontWeight: '600',
  },
  splitValueRemaining: {
    color: '#10B981',
  },
  splitValueOverbudget: {
    color: '#EF4444',
  },
});
