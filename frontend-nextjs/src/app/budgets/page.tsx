'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { budgetsApi, categoriesApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, EmptyState, ListSkeleton, Alert } from '@/components/ui';
import { Plus, Trash2, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { CreateBudgetRequest, TransactionType } from '@/types';

export default function BudgetsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const queryClient = useQueryClient();

  const { data: budgetData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', selectedMonth, selectedYear],
    queryFn: () => budgetsApi.getConsolidated(selectedMonth, selectedYear),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: budgetsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsCreateModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: budgetsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });

  const handleCreateBudget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateBudgetRequest = {
      categoryId: formData.get('categoryId') as string,
      limit: parseFloat(formData.get('limit') as string),
      month: selectedMonth,
      year: selectedYear,
    };

    createMutation.mutate(data);
  };

  const handleDeleteBudget = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este orçamento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handlePreviousMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  // Extract data from consolidated response
  const budgets = budgetData?.budgets || [];
  const totalLimit = budgetData?.totalLimit || 0;
  const totalSpent = budgetData?.totalSpent || 0;
  const totalRemaining = totalLimit - totalSpent;
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  // Filter expense categories for budget creation
  const expenseCategories = categories?.filter(c => c.type === TransactionType.Expense) || [];

  if (budgetsLoading) {
    return (
      <PageContainer title="Orçamentos" subtitle="Controle seus gastos por categoria">
        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <ListSkeleton count={1} />
          <ListSkeleton count={3} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Orçamentos"
      subtitle="Controle seus gastos por categoria"
    >
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>

        {/* Month Selector */}
        <Card className="hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between p-4">
            <Button variant="secondary" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-xl font-semibold text-slate-900">
              {monthNames[selectedMonth - 1]} de {selectedYear}
            </h2>
            <Button variant="secondary" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Summary Card */}
        {budgets && budgets.length > 0 && (
          <Card className="hover:shadow-lg transition-shadow">
            <div className="space-y-4 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Orçado</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">
                    {formatCurrency(totalLimit)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600">Gasto</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-bold text-rose-600">
                    {formatCurrency(totalSpent)}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-slate-600">Progresso</span>
                  <span className="font-medium text-slate-900">
                    {totalPercentage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      totalPercentage >= 100
                        ? 'bg-rose-600'
                        : totalPercentage >= 80
                        ? 'bg-yellow-500'
                        : 'bg-emerald-600'
                    }`}
                    style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Restante: <span className="font-semibold">{formatCurrency(totalRemaining)}</span>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Budgets List */}
        <div className="space-y-4">
          {budgets && budgets.length > 0 ? (
            budgets.map((budget) => (
              <Card key={budget.id} className="hover:shadow-lg transition-shadow">
                <div className="space-y-3 p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {budget.categoryName || 'Categoria'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          Limite: {formatCurrency(budget.limit)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteBudget(budget.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">
                        Gasto: {formatCurrency(budget.spent)}
                      </span>
                      <span className="font-medium text-slate-900">
                        {budget.percentageUsed.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          budget.percentageUsed >= 100
                            ? 'bg-rose-600'
                            : budget.percentageUsed >= 80
                            ? 'bg-yellow-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${Math.min(budget.percentageUsed, 100)}%` }}
                      />
                    </div>
                    <p className="text-sm text-slate-600 mt-2">
                      Restante: <span className={`font-semibold ${budget.remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {formatCurrency(budget.remaining)}
                      </span>
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={TrendingDown}
              title="Nenhum orçamento definido"
              description={`Defina orçamentos para ${monthNames[selectedMonth - 1]} de ${selectedYear} e controle seus gastos`}
              action={{
                label: "Novo Orçamento",
                onClick: () => setIsCreateModalOpen(true)
              }}
            />
          )}
        </div>

      {/* Create Budget Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Novo Orçamento"
      >
        <form onSubmit={handleCreateBudget} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
            Orçamento para: <strong>{monthNames[selectedMonth - 1]} de {selectedYear}</strong>
          </div>

          <Select name="categoryId" label="Categoria" required>
            <option value="">Selecione a categoria</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
              </option>
            ))}
          </Select>

          <Input
            name="limit"
            type="number"
            step="0.01"
            label="Limite"
            placeholder="0.00"
            required
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>

          {createMutation.isError && (
            <Alert variant="danger">
              Erro ao criar orçamento. Verifique se já não existe um orçamento para esta categoria neste mês.
            </Alert>
          )}
        </form>
      </Modal>
      </div>
    </PageContainer>
  );
}
