import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Plus, PiggyBank, Sparkles } from 'lucide-react-native';
import { useBudgets } from '../hooks/useBudgets';
import { MonthPickerChips } from '../../transactions/components/MonthPickerChips';
import { BudgetHeroCard } from '../components/BudgetHeroCard';
import { BudgetCard } from '../components/BudgetCard';
import { AddBudgetModal } from '../components/AddBudgetModal';
import { BudgetDetailModal } from '../components/BudgetDetailModal';
import { BudgetItemWithUsage } from '../../../database/repositories/budgetRepo';
import { formatMonthYearFull } from '../../../utils/date';

export function BudgetsScreen() {
  const {
    availableMonths,
    selectedYear,
    selectedMonth,
    budgets,
    categories,
    summary,
    isLoading,
    isRefreshing,
    setSelectedPeriod,
    saveBudget,
    deleteBudget,
    refresh,
  } = useBudgets();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetItemWithUsage | null>(null);
  const [selectedBudgetForDetail, setSelectedBudgetForDetail] =
    useState<BudgetItemWithUsage | null>(null);

  const periodLabel = formatMonthYearFull(selectedYear, selectedMonth);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (budget: BudgetItemWithUsage) => {
    setEditingBudget(budget);
    setIsAddModalOpen(true);
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
        {/* 1. Horizontal Month Filter Chips */}
        <MonthPickerChips
          months={availableMonths}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onSelectMonth={setSelectedPeriod}
        />

        {/* 2. Hero Total Budget Overview Card */}
        <BudgetHeroCard summary={summary} periodLabel={periodLabel} />

        {/* 3. Primary CTA Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#09090B" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Buat Anggaran Baru</Text>
        </TouchableOpacity>

        {/* 4. Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Alokasi per Kategori</Text>
          <Text style={styles.sectionSubtitle}>
            {budgets.length} kategori aktif
          </Text>
        </View>

        {/* 5. Budgets List / Empty State */}
        {isLoading && !isRefreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#FFD165" />
            <Text style={styles.loadingText}>Memuat kuota anggaran...</Text>
          </View>
        ) : budgets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <PiggyBank size={32} color="#FFD165" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Anggaran Belanja</Text>
            <Text style={styles.emptySubtitle}>
              Tetapkan batas maksimal pengeluaran untuk kategori favorit Anda agar keuangan tetap terkontrol.
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={handleOpenAdd}
              activeOpacity={0.75}
            >
              <Sparkles size={14} color="#09090B" />
              <Text style={styles.emptyButtonText}>Mulai Pasang Anggaran</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.budgetsList}>
            {budgets.map((b) => (
              <BudgetCard
                key={b.id}
                budget={b}
                onPress={(item) => setSelectedBudgetForDetail(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Budget Modal */}
      <AddBudgetModal
        visible={isAddModalOpen}
        categories={categories}
        existingBudget={editingBudget}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingBudget(null);
        }}
        onSave={saveBudget}
      />

      {/* Budget Detail Modal */}
      <BudgetDetailModal
        visible={selectedBudgetForDetail !== null}
        budget={selectedBudgetForDetail}
        year={selectedYear}
        month={selectedMonth}
        onClose={() => setSelectedBudgetForDetail(null)}
        onEditLimit={handleOpenEdit}
        onDelete={deleteBudget}
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
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 88 : 80,
    gap: 14,
  },
  addButton: {
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EAB308',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  addButtonText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
    color: '#09090B',
    letterSpacing: 0.2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
  },
  sectionSubtitle: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 11,
    color: '#71717A',
  },
  budgetsList: {
    gap: 12,
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
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18181B',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#27272A',
    marginTop: 4,
    gap: 8,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: '#F4F4F5',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFD165',
    marginTop: 10,
  },
  emptyButtonText: {
    fontFamily: 'Manrope_700Bold',
    fontSize: 12,
    color: '#09090B',
  },
});
