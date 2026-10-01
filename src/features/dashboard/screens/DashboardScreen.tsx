import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Calendar,
  ChevronDown,
  Sparkles,
  Wallet as WalletIcon,
  ChevronRight,
  TrendingUp,
} from 'lucide-react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { TotalBalanceCard } from '../components/TotalBalanceCard';
import { QuickActionButtons } from '../components/QuickActionButtons';
import { WalletCard, NewPocketCard } from '../../wallets/components/WalletCard';
import { RecentTransactions } from '../components/RecentTransactions';
import { formatPeriodLabel } from '../../../utils/date';

interface DashboardScreenProps {
  onNavigateToWallets?: () => void;
  onNavigateToHistory?: () => void;
  onAddIncome?: () => void;
  onAddExpense?: () => void;
  onTransfer?: () => void;
}

export function DashboardScreen({
  onNavigateToWallets,
  onNavigateToHistory,
  onAddIncome,
  onAddExpense,
  onTransfer,
}: DashboardScreenProps) {
  const {
    selectedYear,
    selectedMonth,
    isBalanceHidden,
    totalNetBalance,
    monthlyIncome,
    monthlyExpense,
    wallets,
    recentTransactions,
    isLoading,
    toggleBalanceHidden,
    refreshDashboard,
    initDashboard,
  } = useDashboardSummary();

  useEffect(() => {
    initDashboard();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refreshDashboard}
          tintColor="#FFD165"
          colors={['#FFD165']}
        />
      }
    >
      {/* Top Greeting & Period Switcher */}
      <View style={styles.topRow}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>Hafidz Thufail</Text>
        </View>

        <View style={styles.periodActions}>
          <TouchableOpacity style={styles.periodPill} activeOpacity={0.7}>
            <Calendar size={14} color="#FFD165" />
            <Text style={styles.periodText}>
              {formatPeriodLabel(selectedYear, selectedMonth)}
            </Text>
            <ChevronDown size={14} color="#71717A" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.ambientGlowButton} activeOpacity={0.7}>
            <Sparkles size={16} color="#FFD165" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Net Balance Card */}
      <TotalBalanceCard
        totalBalance={totalNetBalance}
        monthlyIncome={monthlyIncome}
        monthlyExpense={monthlyExpense}
        isBalanceHidden={isBalanceHidden}
        onToggleBalance={toggleBalanceHidden}
      />

      {/* Primary Action Capsule Buttons */}
      <QuickActionButtons
        onIncomePress={onAddIncome}
        onExpensePress={onAddExpense}
        onTransferPress={onTransfer}
      />

      {/* Integrated Pockets: "My Wallets" Section */}
      <View style={styles.walletsSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.titleWithBadge}>
            <WalletIcon size={18} color="#FFD165" strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{wallets.length}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.seeAllButton}
            onPress={onNavigateToWallets}
            activeOpacity={0.7}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <ChevronRight size={14} color="#FFD165" />
          </TouchableOpacity>
        </View>

        {/* Horizontal Pockets Slider */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.walletsSliderContent}
        >
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              id={wallet.id}
              name={wallet.name}
              type={wallet.type}
              balance={wallet.balance}
              color={wallet.color}
              icon={wallet.icon}
              isBalanceHidden={isBalanceHidden}
              onPress={onNavigateToWallets}
            />
          ))}
          <NewPocketCard onPress={onNavigateToWallets} />
        </ScrollView>
      </View>

      {/* Recent Activity / Transactions Section */}
      <RecentTransactions
        transactions={recentTransactions}
        onViewAllPress={onNavigateToHistory}
      />

      {/* Financial Intelligence Micro-Insight Banner */}
      <View style={styles.insightBanner}>
        <View style={styles.insightIconCircle}>
          <TrendingUp size={16} color="#FFD165" strokeWidth={2.5} />
        </View>
        <View style={styles.insightTextContainer}>
          <Text style={styles.insightTitle}>Spending Pace</Text>
          <Text style={styles.insightDesc}>
            {monthlyExpense === 0
              ? 'Pengeluaran bulan ini masih 0. Pertahankan kebiasaan menabung!'
              : `Total pengeluaran tercatat terkontrol di periode ${formatPeriodLabel(selectedYear, selectedMonth)}.`}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 110,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  welcomeText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#D3C5AC',
  },
  userName: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 18,
    color: '#F4F4F5',
    letterSpacing: -0.3,
  },
  periodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1B1B1E',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.4)',
  },
  periodText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#F4F4F5',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ambientGlowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1B1B1E',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletsSection: {
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginBottom: 10,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    backgroundColor: '#2A2A2D',
  },
  countBadgeText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 10,
    color: '#A1A1AA',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  seeAllText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#FFD165',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  walletsSliderContent: {
    paddingRight: 16,
    paddingVertical: 2,
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
  },
  insightIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTextContainer: {
    flex: 1,
  },
  insightTitle: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#FFD165',
    marginBottom: 2,
    fontWeight: '700',
  },
  insightDesc: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 12,
    color: '#A1A1AA',
    lineHeight: 16,
  },
});

