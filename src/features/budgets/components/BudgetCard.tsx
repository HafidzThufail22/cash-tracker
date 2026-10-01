import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      style={[
        styles.card,
        isOverbudget && styles.cardOverbudget,
        isWarning && styles.cardWarning,
      ]}
      onPress={() => onPress(budget)}
      activeOpacity={0.75}
    >
      {/* Top Row: Category Icon & Title & Status Badge */}
      <View style={styles.topRow}>
        <View style={styles.categoryInfo}>
          <View
            style={[
              styles.iconCircle,
              isOverbudget
                ? styles.iconCircleOverbudget
                : isWarning
                ? styles.iconCircleWarning
                : styles.iconCircleSafe,
            ]}
          >
            {getCategoryIcon(budget.categoryName, budget.categoryColor)}
          </View>
          <View>
            <Text style={styles.categoryName} numberOfLines={1}>
              {budget.categoryName}
            </Text>
            <View style={styles.txCountRow}>
              <Receipt size={10} color="#71717A" />
              <Text style={styles.txCountText}>
                {budget.transactionCount} transaksi bulan ini
              </Text>
            </View>
          </View>
        </View>

        {/* Percentage Badge */}
        <View
          style={[
            styles.badge,
            isOverbudget
              ? styles.badgeOverbudget
              : isWarning
              ? styles.badgeWarning
              : styles.badgeSafe,
          ]}
        >
          {isOverbudget && (
            <AlertTriangle size={11} color="#EF4444" style={styles.badgeIcon} />
          )}
          <Text
            style={[
              styles.badgeText,
              isOverbudget
                ? styles.badgeTextOverbudget
                : isWarning
                ? styles.badgeTextWarning
                : styles.badgeTextSafe,
            ]}
          >
            {budget.percentage}%
          </Text>
        </View>
      </View>

      {/* Amount Numbers Row */}
      <View style={styles.amountRow}>
        <View style={styles.spentInfo}>
          <Text style={styles.amountLabel}>Terpakai</Text>
          <Text
            style={[
              styles.spentAmount,
              isOverbudget && styles.spentAmountOverbudget,
            ]}
          >
            {formatRupiah(budget.spent)}
          </Text>
        </View>

        <View style={styles.limitInfo}>
          <Text style={styles.limitLabel}>Plafon</Text>
          <Text style={styles.limitAmount}>{formatRupiah(budget.amountLimit)}</Text>
        </View>
      </View>

      {/* Dynamic Progress Bar */}
      <BudgetProgressBar percentage={budget.percentage} status={budget.status} height={7} />

      {/* Bottom Status / Remaining Row */}
      <View style={styles.bottomRow}>
        {isOverbudget ? (
          <Text style={styles.overbudgetText}>
            Melebihi kuota {formatRupiah(Math.abs(budget.remaining))}
          </Text>
        ) : (
          <Text style={styles.remainingText}>
            Tersisa {formatRupiah(budget.remaining)}
          </Text>
        )}

        <View style={styles.detailLink}>
          <Text style={styles.detailLinkText}>Detail</Text>
          <ChevronRight size={13} color="#71717A" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181B',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  cardOverbudget: {
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  cardWarning: {
    borderColor: 'rgba(245, 158, 11, 0.4)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#0E0E11',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircleSafe: {
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  iconCircleWarning: {
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  iconCircleOverbudget: {
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  categoryName: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 14,
    color: '#F4F4F5',
    marginBottom: 2,
  },
  txCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  txCountText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 10,
    color: '#71717A',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeSafe: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderColor: 'rgba(234, 179, 8, 0.25)',
  },
  badgeWarning: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  badgeOverbudget: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  badgeIcon: {
    marginRight: 3,
  },
  badgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextSafe: {
    color: '#FFD165',
  },
  badgeTextWarning: {
    color: '#F59E0B',
  },
  badgeTextOverbudget: {
    color: '#EF4444',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  spentInfo: {
    gap: 2,
  },
  amountLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  spentAmount: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#F4F4F5',
  },
  spentAmountOverbudget: {
    color: '#EF4444',
  },
  limitInfo: {
    alignItems: 'flex-end',
    gap: 2,
  },
  limitLabel: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 10,
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  limitAmount: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 13,
    color: '#A1A1AA',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  remainingText: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    color: '#10B981',
  },
  overbudgetText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#EF4444',
  },
  detailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  detailLinkText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#71717A',
  },
});
