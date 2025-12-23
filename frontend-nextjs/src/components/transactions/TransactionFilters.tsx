import { memo } from 'react';
import { Input, Select, Button } from '@/components/ui';
import { Search, X, Filter } from 'lucide-react';
import { TransactionFilters as Filters } from '@/hooks/useTransactionFilters';
import { Account, Category } from '@/types';

interface TransactionFiltersProps {
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
  accounts?: Account[];
  categories?: Category[];
  hasActiveFilters: boolean;
}

export const TransactionFilters = memo(function TransactionFilters({
  filters,
  onFilterChange,
  onReset,
  accounts = [],
  categories = [],
  hasActiveFilters,
}: TransactionFiltersProps) {
  return (
    <div
      className="rounded-xl p-4 sm:p-6 space-y-4 animate-fadeIn"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        borderWidth: '1px',
        borderStyle: 'solid',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" style={{ color: 'var(--foreground)' }} />
          <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>
            Filtros
          </h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search */}
        <div className="sm:col-span-2 lg:col-span-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 opacity-50"
              style={{ color: 'var(--foreground)' }}
            />
            <Input
              type="text"
              placeholder="Buscar por descrição, categoria ou valor..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Type */}
        <Select
          label="Tipo"
          value={filters.type}
          onChange={(e) => onFilterChange('type', e.target.value as any)}
        >
          <option value="all">Todos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </Select>

        {/* Category */}
        <Select
          label="Categoria"
          value={filters.categoryId}
          onChange={(e) => onFilterChange('categoryId', e.target.value)}
        >
          <option value="">Todas</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>

        {/* Account */}
        <Select
          label="Conta"
          value={filters.accountId}
          onChange={(e) => onFilterChange('accountId', e.target.value)}
        >
          <option value="">Todas</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>

        {/* Date From */}
        <Input
          type="date"
          label="Data inicial"
          value={filters.dateFrom}
          onChange={(e) => onFilterChange('dateFrom', e.target.value)}
        />

        {/* Date To */}
        <Input
          type="date"
          label="Data final"
          value={filters.dateTo}
          onChange={(e) => onFilterChange('dateTo', e.target.value)}
        />

        {/* Min Amount */}
        <Input
          type="number"
          label="Valor mínimo"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={filters.minAmount || ''}
          onChange={(e) => onFilterChange('minAmount', parseFloat(e.target.value) || 0)}
        />

        {/* Max Amount */}
        <Input
          type="number"
          label="Valor máximo"
          placeholder="0.00"
          step="0.01"
          min="0"
          value={filters.maxAmount || ''}
          onChange={(e) => onFilterChange('maxAmount', parseFloat(e.target.value) || 0)}
        />
      </div>

      {hasActiveFilters && (
        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
          <p className="text-sm opacity-70" style={{ color: 'var(--foreground)' }}>
            {filters.search && (
              <span className="inline-flex items-center gap-1 mr-2 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                Busca: "{filters.search}"
              </span>
            )}
            {filters.type !== 'all' && (
              <span className="inline-flex items-center gap-1 mr-2 px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs">
                Tipo: {filters.type === 'income' ? 'Receitas' : 'Despesas'}
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
});
