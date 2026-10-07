import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { Calendar, TrendingUp } from 'lucide-react-native';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { TotalBalanceCard } from '../components/TotalBalanceCard';
import { ActionFAB } from '../components/ActionFAB';
import { ActionSheetModal } from '../components/ActionSheetModal';
import { PeriodPickerModal } from '../components/PeriodPickerModal';
import { WalletPickerModal } from '../components/WalletPickerModal';
import { RecentTransactions } from '../components/RecentTransactions';
import { formatPeriodLabel } from '../../../utils/date';

interface DashboardScreenProps {
  onNavigateToWallets?: () => void;
  onNavigateToHistory?: () => void;
}

export function DashboardScreen({
  onNavigateToHistory,
}: DashboardScreenProps) {
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const {
    selectedYear,
    selectedMonth,
    selectedWalletId,
    availableMonths,
    isBalanceHidden,
    totalNetBalance,
    monthlyIncome,
    monthlyExpense,
    wallets,
    recentTransactions,
    isLoading,
    setPeriod,
    setWalletId,
    toggleBalanceHidden,
    refreshDashboard,
    initDashboard,
  } = useDashboardSummary();

  // Animasi halus saat filter bulan atau kantong kas berubah
  const contentFadeAnim = useRef(new Animated.Value(1)).current;
  const contentSlideAnim = useRef(new Animated.Value(0)).current;
  const isFirstLoad = useRef(true);

  useEffect(() => {
    initDashboard();
  }, []);

  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }

    contentFadeAnim.setValue(0.4);
    contentSlideAnim.setValue(5);
    Animated.parallel([
      Animated.timing(contentFadeAnim, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentSlideAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [selectedYear, selectedMonth, selectedWalletId]);

  const selectedWallet = wallets.find((w) => w.id === selectedWalletId);

  return (
    <View style={styles.screenRoot}>
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
        {/* Horizontal Month Filter Bar (Calendar Button + Scrollable Chips) */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={styles.calendarTriggerBtn}
            onPress={() => setIsPeriodModalOpen(true)}
            activeOpacity={0.7}
            accessibilityLabel="Pilih bulan dan tahun"
            accessibilityRole="button"
          >
            <Calendar size={17} color="#FFD165" strokeWidth={2.2} />
          </TouchableOpacity>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            {availableMonths.map((item) => {
              const isSelected = item.year === selectedYear && item.month === selectedMonth;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => setPeriod(item.year, item.month)}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Konten Dinamis Teranimasi Halus saat Filter Berganti */}
        <Animated.View
          style={{
            opacity: contentFadeAnim,
            transform: [{ translateY: contentSlideAnim }],
          }}
        >
          {/* Hero Net Balance Card (dengan Dropdown Filter Wallet di samping Icon Mata) */}
          <TotalBalanceCard
            totalBalance={totalNetBalance}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            isBalanceHidden={isBalanceHidden}
            onToggleBalance={toggleBalanceHidden}
            selectedWalletName={selectedWallet?.name}
            selectedWalletColor={selectedWallet?.color}
            onOpenWalletPicker={() => setIsWalletModalOpen(true)}
          />

          {/* Recent Activity / Transactions Section */}
          <RecentTransactions
            transactions={recentTransactions}
            onViewAllPress={onNavigateToHistory}
          />

          {/* Micro-Insight Banner */}
          <View style={styles.insightBanner}>
            <View style={styles.insightIconCircle}>
              <TrendingUp size={16} color="#FFD165" strokeWidth={2.5} />
            </View>
            <View style={styles.insightTextContainer}>
              <Text style={styles.insightTitle}>Ringkasan Pengeluaran</Text>
              <Text style={styles.insightDesc}>
                {monthlyExpense === 0
                  ? 'Belum ada catatan pengeluaran bulan ini. Keuangan tetap stabil!'
                  : `Total arus kas keluar terpantau pada periode ${formatPeriodLabel(selectedYear, selectedMonth)}.`}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button (Mepet Menu Bar Bawah) */}
      <ActionFAB
        isOpen={isActionSheetOpen}
        onPress={() => setIsActionSheetOpen(true)}
      />

      {/* Action Sheet Modal */}
      <ActionSheetModal
        visible={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onSuccess={refreshDashboard}
      />

      {/* Period Picker Modal (Pilihan Bulan & Tahun) */}
      <PeriodPickerModal
        visible={isPeriodModalOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        months={availableMonths}
        onClose={() => setIsPeriodModalOpen(false)}
        onSelectMonth={setPeriod}
      />

      {/* Wallet Picker Modal (Dropdown Filter Kantong) */}
      <WalletPickerModal
        visible={isWalletModalOpen}
        wallets={wallets}
        selectedWalletId={selectedWalletId}
        onClose={() => setIsWalletModalOpen(false)}
        onSelectWallet={(id) => setWalletId(id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
    gap: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 2,
  },
  calendarTriggerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScrollContent: {
    gap: 8,
    alignItems: 'center',
    paddingRight: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipSelected: {
    backgroundColor: '#EAB308',
    borderColor: '#EAB308',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  chipUnselected: {
    backgroundColor: '#18181B',
    borderColor: '#27272A',
  },
  chipText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  chipTextSelected: {
    color: '#09090B',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#A1A1AA',
  },
  insightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  insightIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
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
