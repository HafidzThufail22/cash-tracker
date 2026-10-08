import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 88 : 80,
          gap: 14,
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
          className="h-12 rounded-[14px] bg-gold flex-row items-center justify-center gap-2 shadow-md shadow-gold/30"
          onPress={handleOpenAdd}
          activeOpacity={0.8}
        >
          <Plus size={18} color="#09090B" strokeWidth={2.5} />
          <Text className="font-manrope-bold text-sm text-background">Buat Anggaran Baru</Text>
        </TouchableOpacity>

        {/* 4. Section Title */}
        <View className="flex-row items-center justify-between px-1">
          <Text className="font-manrope-bold text-base text-zinc-100 tracking-tight">
            Alokasi per Kategori
          </Text>
          <Text className="font-mono text-xs text-zinc-500">
            {budgets.length} kategori aktif
          </Text>
        </View>

        {/* 5. Budgets List / Empty State */}
        {isLoading && !isRefreshing ? (
          <View className="py-10 items-center justify-center gap-2">
            <ActivityIndicator size="small" color="#FFD165" />
            <Text className="font-mono text-xs text-zinc-500">Memuat kuota anggaran...</Text>
          </View>
        ) : budgets.length === 0 ? (
          <View className="p-8 items-center justify-center bg-surface rounded-2xl border border-border">
            <View className="w-14 h-14 rounded-full bg-gold/15 items-center justify-center mb-3">
              <PiggyBank size={32} color="#FFD165" />
            </View>
            <Text className="font-manrope-bold text-base text-zinc-100 mb-1 text-center">
              Belum Ada Anggaran Belanja
            </Text>
            <Text className="font-manrope text-xs text-zinc-400 text-center leading-4 max-w-[280px]">
              Tetapkan batas maksimal pengeluaran untuk kategori favorit Anda agar keuangan tetap terkontrol.
            </Text>
            <TouchableOpacity
              className="flex-row items-center gap-1.5 mt-4 px-4 py-2.5 rounded-full bg-gold shadow-sm shadow-gold/20"
              onPress={handleOpenAdd}
              activeOpacity={0.75}
            >
              <Sparkles size={14} color="#09090B" />
              <Text className="font-manrope-bold text-xs text-background">Mulai Pasang Anggaran</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View className="gap-2.5">
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
