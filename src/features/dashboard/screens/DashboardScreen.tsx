import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: Platform.OS === 'ios' ? 88 : 80,
          gap: 14,
        }}
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
        <View className="flex-row items-center gap-2 my-0.5">
          <TouchableOpacity
            className="w-[38px] h-[38px] rounded-full bg-surface border border-border items-center justify-center"
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
            contentContainerStyle={{ gap: 8, alignItems: 'center', paddingRight: 8 }}
          >
            {availableMonths.map((item) => {
              const isSelected = item.year === selectedYear && item.month === selectedMonth;

              return (
                <TouchableOpacity
                  key={item.key}
                  className={`flex-row items-center px-3.5 py-2 rounded-full border ${
                    isSelected
                      ? 'bg-gold border-gold shadow-sm shadow-gold/30'
                      : 'bg-surface border-border'
                  }`}
                  onPress={() => setPeriod(item.year, item.month)}
                  activeOpacity={0.75}
                >
                  <Text
                    className={`font-mono text-[11px] tracking-wide ${
                      isSelected ? 'text-background font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Dynamic Content */}
        <Animated.View
          style={{
            opacity: contentFadeAnim,
            transform: [{ translateY: contentSlideAnim }],
          }}
        >
          {/* Hero Net Balance Card */}
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
          <View className="flex-row items-center gap-3 p-3.5 rounded-[14px] bg-surface border border-border mt-3">
            <View className="w-[34px] h-[34px] rounded-full bg-gold/15 items-center justify-center">
              <TrendingUp size={16} color="#FFD165" strokeWidth={2.5} />
            </View>
            <View className="flex-1">
              <Text className="font-mono text-[11px] uppercase tracking-wider text-gold-primary mb-0.5 font-bold">
                Ringkasan Pengeluaran
              </Text>
              <Text className="font-manrope text-xs text-zinc-400 leading-4">
                {monthlyExpense === 0
                  ? 'Belum ada catatan pengeluaran bulan ini. Keuangan tetap stabil!'
                  : `Total arus kas keluar terpantau pada periode ${formatPeriodLabel(selectedYear, selectedMonth)}.`}
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Floating Action Button */}
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

      {/* Period Picker Modal */}
      <PeriodPickerModal
        visible={isPeriodModalOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        months={availableMonths}
        onClose={() => setIsPeriodModalOpen(false)}
        onSelectMonth={setPeriod}
      />

      {/* Wallet Picker Modal */}
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
