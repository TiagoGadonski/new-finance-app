import { useState, useMemo } from 'react';
import { TransactionDto, TransactionType } from '@/types';

export interface TransactionFilters {
  search: string;
  type: 'all' | 'income' | 'expense';
  categoryId: string;
  accountId: string;
  dateFrom: string;
  dateTo: string;
  minAmount: number;
  maxAmount: number;
}

export function useTransactionFilters(transactions: TransactionDto[] = []) {
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'all',
    categoryId: '',
    accountId: '',
    dateFrom: '',
    dateTo: '',
    minAmount: 0,
    maxAmount: 0,
  });

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesDescription = transaction.description?.toLowerCase().includes(searchLower);
        const matchesAmount = transaction.amount.toString().includes(filters.search);
        const matchesCategory = transaction.categoryName?.toLowerCase().includes(searchLower);

        if (!matchesDescription && !matchesAmount && !matchesCategory) {
          return false;
        }
      }

      // Type filter
      if (filters.type !== 'all') {
        const typeValue = filters.type === 'income' ? TransactionType.Income : TransactionType.Expense;
        if (transaction.type !== typeValue) return false;
      }

      // Category filter
      if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
        return false;
      }

      // Account filter
      if (filters.accountId && transaction.accountId !== filters.accountId) {
        return false;
      }

      // Date range filter
      if (filters.dateFrom) {
        const transactionDate = new Date(transaction.date);
        const fromDate = new Date(filters.dateFrom);
        if (transactionDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const transactionDate = new Date(transaction.date);
        const toDate = new Date(filters.dateTo);
        if (transactionDate > toDate) return false;
      }

      // Amount range filter
      if (filters.minAmount > 0 && transaction.amount < filters.minAmount) {
        return false;
      }

      if (filters.maxAmount > 0 && transaction.amount > filters.maxAmount) {
        return false;
      }

      return true;
    });
  }, [transactions, filters]);

  const updateFilter = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      categoryId: '',
      accountId: '',
      dateFrom: '',
      dateTo: '',
      minAmount: 0,
      maxAmount: 0,
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.search !== '' ||
      filters.type !== 'all' ||
      filters.categoryId !== '' ||
      filters.accountId !== '' ||
      filters.dateFrom !== '' ||
      filters.dateTo !== '' ||
      filters.minAmount > 0 ||
      filters.maxAmount > 0
    );
  }, [filters]);

  return {
    filters,
    filteredTransactions,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  };
}
