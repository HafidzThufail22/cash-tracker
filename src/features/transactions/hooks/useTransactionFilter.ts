import { useState, useCallback } from 'react';

export type TransactionTypeFilter = 'all' | 0 | 1 | 2;

export interface TransactionFilterState {
  selectedYear: number;
  selectedMonth: number;
  selectedType: TransactionTypeFilter;
  searchQuery: string;
}

export function useTransactionFilter(initialYear?: number, initialMonth?: number) {
  const now = new Date();
  const [selectedYear, setSelectedYear] = useState<number>(initialYear || now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(initialMonth || now.getMonth() + 1);
  const [selectedType, setSelectedType] = useState<TransactionTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const setPeriod = useCallback((year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  }, []);

  const resetFilters = useCallback(() => {
    setSelectedType('all');
    setSearchQuery('');
  }, []);

  return {
    selectedYear,
    selectedMonth,
    selectedType,
    searchQuery,
    setPeriod,
    setSelectedType,
    setSearchQuery,
    resetFilters,
  };
}
