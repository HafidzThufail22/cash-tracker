import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { History, FileQuestion, RotateCcw } from 'lucide-react-native';
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
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
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
        <View style={styles.listSection}>
          {isLoading && !isRefreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#FFD165" />
              <Text style={styles.loadingText}>Memuat mutasi transaksi...</Text>
            </View>
          ) : groupedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconBox}>
                <FileQuestion size={28} color="#71717A" />
              </View>
              <Text style={styles.emptyTitle}>
                {hasActiveFilters
                  ? 'Tidak Ada Transaksi yang Cocok'
                  : 'Belum Ada Transaksi di Bulan Ini'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {hasActiveFilters
                  ? 'Coba ubah kata kunci pencarian atau tipe filter transaksi.'
                  : 'Tidak ditemukan catatan mutasi keuangan pada periode yang dipilih.'}
              </Text>

              {hasActiveFilters && (
                <TouchableOpacity
                  style={styles.resetFilterButton}
                  onPress={handleResetFilters}
                  activeOpacity={0.75}
                >
                  <RotateCcw size={14} color="#FFD165" />
                  <Text style={styles.resetFilterText}>Bersihkan Filter</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            groupedTransactions.map((group) => {
              const dailyNet = group.dailyIncome - group.dailyExpense;

              return (
                <View key={group.dateKey} style={styles.groupContainer}>
                  {/* Group Header (Date & Daily Subtotal) */}
                  <View style={styles.groupHeader}>
                    <Text style={styles.groupDateText}>{group.displayDate}</Text>
                    <View style={styles.dailySubtotalRow}>
                      {group.dailyExpense > 0 && (
                        <Text style={styles.dailyExpenseText}>
                          -{formatRupiah(group.dailyExpense)}
                        </Text>
                      )}
                      {group.dailyIncome > 0 && (
                        <Text style={styles.dailyIncomeText}>
                          +{formatRupiah(group.dailyIncome)}
                        </Text>
                      )}
                    </View>
                  </View>

                  {/* Group Card Ledger */}
                  <View style={styles.groupCard}>
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
              );
            })
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

      {/* Period Picker Modal (Bulan & Tahun) */}
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

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
    gap: 8,
  },
  listSection: {
    paddingHorizontal: 16,
    marginTop: 6,
    gap: 16,
  },
  groupContainer: {
    gap: 6,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  groupDateText: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    color: '#D3C5AC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dailySubtotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dailyExpenseText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#EF4444',
  },
  dailyIncomeText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#10B981',
  },
  groupCard: {
    borderRadius: 18,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: 'rgba(79, 70, 51, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 2,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  loadingText: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
  },
  emptyContainer: {
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    marginTop: 8,
  },
  emptyIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#131316',
    borderWidth: 1,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
  },
  resetFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#131316',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    marginTop: 16,
  },
  resetFilterText: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 12,
    color: '#FFD165',
  },
});
