'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { transactionsApi, accountsApi, categoriesApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, Alert, ConfirmDialog, EmptyState, ListSkeleton } from '@/components/ui';
import { TransactionFilters } from '@/components/transactions/TransactionFilters';
import { useTransactionFilters } from '@/hooks/useTransactionFilters';
import { exportToCSV, exportToExcel, printTransactions } from '@/lib/utils/export';
import { EditTransactionModal } from '@/components/transactions/EditTransactionModal';
import { Plus, Trash2, Edit2, TrendingUp, TrendingDown, Download, FileSpreadsheet, Printer, Inbox, FileText, Upload, BookTemplate, LayoutTemplate } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreateTransactionRequest, TransactionType, TransactionDto } from '@/types';
import { Pagination } from '@/components/ui';
import { TemplatesModal } from '@/components/transactions/TemplatesModal';
import { ImportModal } from '@/components/transactions/ImportModal';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function TransactionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<TransactionDto | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;
  const queryClient = useQueryClient();

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  // Use the new filter hook
  const {
    filters,
    filteredTransactions,
    updateFilter,
    resetFilters,
    hasActiveFilters,
  } = useTransactionFilters(transactions);

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsCreateModalOpen(false);
      toast.success('Transação criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar transação. Tente novamente.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transação excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir transação. Tente novamente.');
    },
  });

  const handleCreateTransaction = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const installmentCountStr = formData.get('installmentCount') as string;
    const installmentCount = installmentCountStr && parseInt(installmentCountStr) > 1
      ? parseInt(installmentCountStr)
      : null;

    const data: CreateTransactionRequest = {
      accountId: formData.get('accountId') as string,
      categoryId: formData.get('categoryId') as string,
      amount: parseFloat(formData.get('amount') as string),
      description: formData.get('description') as string,
      type: parseInt(formData.get('type') as string) as TransactionType,
      date: formData.get('date') as string,
      installmentCount,
    };

    createMutation.mutate(data);
  };

  const handleDeleteTransaction = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  // Calculate totals from filtered transactions
  const totalIncome = filteredTransactions
    .filter(t => t.type === TransactionType.Income)
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter(t => t.type === TransactionType.Expense)
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  if (transactionsLoading) {
    return (
      <PageContainer title="Transações" subtitle="Gerencie suas receitas e despesas">
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
          </div>
          <ListSkeleton count={5} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Transações"
      subtitle={`${filteredTransactions.length} transação${filteredTransactions.length !== 1 ? 'ões' : ''} encontrada${filteredTransactions.length !== 1 ? 's' : ''}`}
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between">
          <div className="flex flex-wrap gap-2">
            <Link href="/statement">
              <Button variant="secondary" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Ver Extrato Completo
              </Button>
            </Link>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Filtros Avançados'}
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-600 text-white text-xs">
                  {Object.values(filters).filter(v => v && v !== 'all' && v !== 0 && v !== '').length}
                </span>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToExcel(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Excel
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportToCSV(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
            >
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => printTransactions(filteredTransactions)}
              disabled={filteredTransactions.length === 0}
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowImport(true)} size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Importar
            </Button>
            <Button variant="secondary" onClick={() => setShowTemplates(true)} size="sm">
              <LayoutTemplate className="w-4 h-4 mr-1" />
              Templates
            </Button>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Transação
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <TransactionFilters
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            accounts={accounts}
            categories={categories}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-fadeIn">
          <Card className="card-hover group">
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>
                  Total de Receitas
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="card-hover group">
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>
                  Total de Despesas
                </p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-rose-600">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow">
                <TrendingDown className="w-6 h-6 text-white" />
              </div>
            </div>
          </Card>

          <Card className="card-hover group">
            <div className="flex items-center justify-between p-6">
              <div className="flex-1">
                <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>
                  Saldo
                </p>
                <p className={`mt-2 text-2xl sm:text-3xl font-bold ${balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(balance)}
                </p>
              </div>
              <div
                className="p-3 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow"
                style={{
                  background: balance >= 0
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                }}
              >
                {balance >= 0 ? (
                  <TrendingUp className="w-6 h-6 text-white" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions List */}
        <Card>
          <div className="p-6">
            {filteredTransactions.length > 0 ? (
              <div className="space-y-3">
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                  .map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-opacity-50 transition-all duration-200 animate-fadeIn"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {transaction.description}
                        </p>
                        {transaction.type === TransactionType.Income ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
                        <span>{format(new Date(transaction.date), "dd/MM/yyyy", { locale: ptBR })}</span>
                        {transaction.categoryName && <span>• {transaction.categoryName}</span>}
                        {transaction.accountName && <span>• {transaction.accountName}</span>}
                        {transaction.installmentCount && transaction.currentInstallment && (
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                            Parcela {transaction.currentInstallment}/{transaction.installmentCount}
                          </span>
                        )}
                        {transaction.createdByUsername && (
                          <span>• @{transaction.createdByUsername}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <p className={`text-lg font-semibold ${transaction.type === TransactionType.Income ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {transaction.type === TransactionType.Income ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingTransaction(transaction)}
                      >
                        <Edit2 className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id)}
                        disabled={deleteMutation.isPending}
                        className="hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title={hasActiveFilters ? "Nenhuma transação encontrada" : "Nenhuma transação ainda"}
                description={
                  hasActiveFilters
                    ? "Tente ajustar os filtros para encontrar outras transações"
                    : "Comece criando sua primeira transação para acompanhar suas finanças"
                }
                action={
                  hasActiveFilters
                    ? { label: "Limpar Filtros", onClick: resetFilters }
                    : { label: "Nova Transação", onClick: () => setIsCreateModalOpen(true) }
                }
              />
            )}
          </div>
        </Card>

        {/* Create Transaction Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nova Transação"
        >
          <form onSubmit={handleCreateTransaction} className="space-y-4">
            <Select name="type" label="Tipo" required>
              <option value="">Selecione o tipo</option>
              <option value={TransactionType.Income}>Receita</option>
              <option value={TransactionType.Expense}>Despesa</option>
            </Select>

            <Input
              name="description"
              label="Descrição"
              placeholder="Ex: Salário, Aluguel..."
              required
            />

            <Input
              name="amount"
              type="number"
              step="0.01"
              label="Valor"
              placeholder="0.00"
              required
            />

            <Input
              name="installmentCount"
              type="number"
              min="1"
              max="60"
              label="Número de Parcelas (opcional)"
              placeholder="1 = à vista"
              helperText="Deixe vazio ou 1 para compra à vista. Para parcelado, informe o número de parcelas (ex: 12)"
            />

            <Input
              name="date"
              type="date"
              label="Data"
              defaultValue={format(new Date(), 'yyyy-MM-dd')}
              required
            />

            <Select name="accountId" label="Conta" required>
              <option value="">Selecione a conta</option>
              {accounts?.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </Select>

            <Select name="categoryId" label="Categoria" required>
              <option value="">Selecione a categoria</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

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
          </form>
        </Modal>

        {/* Edit Transaction Modal */}
        {editingTransaction && (
          <EditTransactionModal
            transaction={editingTransaction}
            categories={categories}
            isOpen={!!editingTransaction}
            onClose={() => setEditingTransaction(null)}
          />
        )}

        {/* Pagination */}
        {filteredTransactions.length > pageSize && (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredTransactions.length / pageSize)}
            onChange={setCurrentPage}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteId !== null}
          onClose={() => setDeleteId(null)}
          onConfirm={confirmDelete}
          title="Excluir Transação"
          message="Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          variant="danger"
        />

        {/* Templates Modal */}
        <TemplatesModal
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          onApply={() => setShowTemplates(false)}
        />

        {/* Import Modal */}
        <ImportModal
          isOpen={showImport}
          onClose={() => setShowImport(false)}
        />
      </div>
    </PageContainer>
  );
}
