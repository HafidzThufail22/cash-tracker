import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { FileQuestion, RotateCcw } from 'lucide-react-native';
import { useTransactions } from '../hooks/useTransactions';
import { MonthPickerChips } from '../components/MonthPickerChips';
import { SearchBar } from '../components/SearchBar';
import { TypeSelector } from '../components/TypeSelector';
import { MonthlySummaryCard } from '../components/MonthlySummaryCard';
import { TransactionItem } from '../components/TransactionItem';
import { TransactionDetailModal } from '../components/TransactionDetailModal';
import { RecentTransactionItem } from '../../../database/repositories/transactionRepo';
import { formatRupiah } from '../../../utils/currency';
import { PeriodPickerModal } from '../../dashboard/components/PeriodPickerModal';

export function TransactionListScreen() {
  const {
    availableMonths,
    selectedYear,
    selectedMonth,
    selectedType,
    searchQuery,
    groupedTransactions,
    summary,
    isLoading,
    isRefreshing,
    setSelectedPeriod,
    setSelectedType,
    setSearchQuery,
    refresh,
    deleteTransaction,
  } = useTransactions();

  const [selectedItemForDetail, setSelectedItemForDetail] =
    useState<RecentTransactionItem | null>(null);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);

  const hasActiveFilters = selectedType !== 'all' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setSelectedType('all');
    setSearchQuery('');
  };

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        contentContainerStyle={{
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 88 : 80,
          gap: 4,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor="#FFD165"
            colors={['#FFD165']}
          />
        }
      >
        {/* 1. Horizontal Month Filter Chips with Calendar Modal Button */}
        <MonthPickerChips
          months={availableMonths}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedPeriod}
          onOpenCalendarModal={() => setIsPeriodModalOpen(true)}
        />

        {/* 2. Text Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Cari transaksi atau kategori..."
        />

        {/* 3. Transaction Type Segmented Filter */}
        <TypeSelector
          selectedType={selectedType}
          onSelectType={setSelectedType}
        />

        {/* 4. Mini Financial Summary for Current Month */}
        <MonthlySummaryCard summary={summary} />

        {/* 5. Grouped Transactions List */}
        <View className="px-4 mt-2 pb-6">
          {isLoading && !isRefreshing ? (
            <View className="py-10 items-center justify-center gap-2">
              <ActivityIndicator size="small" color="#FFD165" />
              <Text className="font-mono text-xs text-zinc-500">Memuat mutasi transaksi...</Text>
            </View>
          ) : groupedTransactions.length === 0 ? (
            <View className="py-12 px-4 items-center justify-center bg-surface rounded-2xl border border-border mt-2">
              <View className="w-12 h-12 rounded-full bg-surface-lowest items-center justify-center mb-3">
                <FileQuestion size={28} color="#71717A" />
              </View>
              <Text className="font-manrope-bold text-base text-zinc-100 mb-1 text-center">
                {hasActiveFilters
                  ? 'Tidak Ada Transaksi yang Cocok'
                  : 'Belum Ada Transaksi di Bulan Ini'}
              </Text>
              <Text className="font-manrope text-xs text-zinc-400 text-center leading-4 max-w-[280px]">
                {hasActiveFilters
                  ? 'Coba ubah kata kunci pencarian atau tipe filter transaksi.'
                  : 'Tidak ditemukan catatan mutasi keuangan pada periode yang dipilih.'}
              </Text>

              {hasActiveFilters && (
                <TouchableOpacity
                  className="flex-row items-center gap-1.5 mt-4 px-3.5 py-2 rounded-full bg-surface-lowest border border-gold/30"
                  onPress={handleResetFilters}
                  activeOpacity={0.75}
                >
                  <RotateCcw size={14} color="#FFD165" />
                  <Text className="font-mono text-xs text-gold-primary font-semibold">Bersihkan Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            groupedTransactions.map((group) => (
              <View key={group.dateKey} className="mb-4">
                {/* Group Header (Date & Daily Subtotal) */}
                <View className="flex-row items-center justify-between mb-2 px-1">
                  <Text className="font-mono text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                    {group.displayDate}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    {group.dailyExpense > 0 && (
                      <Text className="font-mono text-xs text-semantic-expense">
                        -{formatRupiah(group.dailyExpense)}
                      </Text>
                    )}
                    {group.dailyIncome > 0 && (
                      <Text className="font-mono text-xs text-semantic-income">
                        +{formatRupiah(group.dailyIncome)}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Group Card Ledger */}
                <View className="rounded-2xl bg-surface border border-gold/30 overflow-hidden">
                  {group.items.map((item, index) => (
                    <TransactionItem
                      key={item.id}
                      item={item}
                      isLast={index === group.items.length - 1}
                      onPress={(selected) => setSelectedItemForDetail(selected)}
                    />
                  ))}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Transaction Detail BottomSheet Modal */}
      <TransactionDetailModal
        visible={selectedItemForDetail !== null}
        item={selectedItemForDetail}
        onClose={() => setSelectedItemForDetail(null)}
        onDelete={deleteTransaction}
      />

      {/* Period Picker Modal */}
      <PeriodPickerModal
        visible={isPeriodModalOpen}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        months={availableMonths}
        onClose={() => setIsPeriodModalOpen(false)}
        onSelectMonth={setSelectedPeriod}
      />
    </View>
  );
}
