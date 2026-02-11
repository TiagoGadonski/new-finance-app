'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { accountsApi, categoriesApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, EmptyState, Alert } from '@/components/ui';
import { EditAccountModal } from '@/components/settings/EditAccountModal';
import { EditCategoryModal } from '@/components/settings/EditCategoryModal';
import { Plus, Trash2, Edit2, Wallet, Tag, Circle } from 'lucide-react';
import { CreateCategoryRequest, CreateAccountRequest, AccountType, TransactionType, AccountDto, CategoryDto } from '@/types';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'categories'>('accounts');
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<AccountDto | null>(null);
  const [editingCategory, setEditingCategory] = useState<CategoryDto | null>(null);
  const queryClient = useQueryClient();

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const createAccountMutation = useMutation({
    mutationFn: accountsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsAccountModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating account:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar conta';
      alert(errorMessage);
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsCategoryModalOpen(false);
    },
    onError: (error: any) => {
      console.error('Error creating category:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Erro ao criar categoria';
      alert(errorMessage);
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: categoriesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const handleCreateAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateAccountRequest = {
      name: formData.get('name') as string,
      type: parseInt(formData.get('type') as string) as AccountType,
      initialBalance: parseFloat(formData.get('initialBalance') as string) || 0,
      color: formData.get('color') as string || undefined,
      currency: formData.get('currency') as string || 'BRL',
    };

    createAccountMutation.mutate(data);
  };

  const handleCreateCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateCategoryRequest = {
      name: formData.get('name') as string,
      type: parseInt(formData.get('type') as string) as TransactionType,
      icon: formData.get('icon') as string || undefined,
      color: formData.get('color') as string || undefined,
    };

    createCategoryMutation.mutate(data);
  };

  const handleDeleteAccount = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta conta?')) {
      deleteAccountMutation.mutate(id);
    }
  };

  const handleDeleteCategory = (id: string, isDefault: boolean) => {
    if (isDefault) {
      alert('Categorias padrão não podem ser excluídas');
      return;
    }
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const accountTypeLabels: Partial<Record<AccountType, string>> = {
    [AccountType.Checking]: 'Conta Corrente',
    [AccountType.Savings]: 'Poupança',
    [AccountType.CreditCard]: 'Cartão de Crédito',
    [AccountType.Investment]: 'Investimentos',
    [AccountType.Wallet]: 'Dinheiro',
    [AccountType.Business]: 'Negócio',
  };
  // Cash is an alias for Wallet (both have value 4)

  const customCategories = categories?.filter(c => !c.isDefault) || [];
  const defaultCategories = categories?.filter(c => c.isDefault) || [];

  return (
    <PageContainer
      title="Configurações"
      subtitle="Gerencie suas contas e categorias"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'accounts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Contas
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'categories'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Categorias
          </button>
        </div>

        {/* Accounts Tab */}
        {activeTab === 'accounts' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button onClick={() => setIsAccountModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </div>

            {accountsLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : accounts && accounts.length > 0 ? (
              <div className="grid gap-4">
                {accounts.map((account) => (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100">
                            {account.name}
                          </h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {accountTypeLabels[account.type]}
                            {account.currency && account.currency !== 'BRL' && (
                              <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">{account.currency}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-slate-600 dark:text-slate-400">Saldo</p>
                          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                            {new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(account.balance)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingAccount(account)}
                        >
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAccount(account.id)}
                          disabled={deleteAccountMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="Nenhuma conta cadastrada"
                description="Crie sua primeira conta para começar a gerenciar suas finanças"
                action={{
                  label: "Nova Conta",
                  onClick: () => setIsAccountModalOpen(true)
                }}
              />
            )}
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={() => setIsCategoryModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Categoria
              </Button>
            </div>

            {categoriesLoading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : (
              <>
                {/* Custom Categories */}
                {customCategories.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                      Minhas Categorias
                    </h3>
                    <div className="grid gap-3">
                      {customCategories.map((category) => (
                        <Card key={category.id} className="hover:shadow-lg transition-shadow">
                          <div className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-3">
                              {category.icon && <span className="text-2xl">{category.icon}</span>}
                              <div>
                                <p className="font-medium text-slate-900 dark:text-slate-100">
                                  {category.name}
                                </p>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                  {category.type === TransactionType.Income ? 'Receita' : 'Despesa'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {category.color && (
                                <Circle
                                  className="w-4 h-4"
                                  fill={category.color}
                                  stroke={category.color}
                                />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteCategory(category.id, category.isDefault)}
                              >
                                <Trash2 className="w-4 h-4 text-rose-600" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Default Categories */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100">
                    Categorias Padrão
                  </h3>
                  <div className="grid gap-3">
                    {defaultCategories.map((category) => (
                      <Card key={category.id} className="opacity-75">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            {category.icon && <span className="text-2xl">{category.icon}</span>}
                            <div>
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {category.name}
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {category.type === TransactionType.Income ? 'Receita' : 'Despesa'}
                              </p>
                            </div>
                          </div>
                          {category.color && (
                            <Circle
                              className="w-4 h-4"
                              fill={category.color}
                              stroke={category.color}
                            />
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      <Modal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        title="Nova Conta"
      >
        <form onSubmit={handleCreateAccount} className="space-y-4">
          <Input
            name="name"
            label="Nome da Conta"
            placeholder="Ex: Conta Corrente"
            required
          />

          <Select name="type" label="Tipo de Conta" required>
            <option value="">Selecione o tipo</option>
            <option value={AccountType.Checking}>Conta Corrente</option>
            <option value={AccountType.Savings}>Poupança</option>
            <option value={AccountType.CreditCard}>Cartão de Crédito</option>
            <option value={AccountType.Investment}>Investimentos</option>
            <option value={AccountType.Cash}>Dinheiro</option>
          </Select>

          <Input
            name="initialBalance"
            type="number"
            step="0.01"
            label="Saldo Inicial"
            placeholder="0.00"
            required
          />

          <Select name="currency" label="Moeda" required>
            <option value="BRL">BRL - Real Brasileiro</option>
            <option value="USD">USD - Dólar Americano</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - Libra Esterlina</option>
          </Select>

          <Input
            name="color"
            type="color"
            label="Cor (opcional)"
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAccountModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createAccountMutation.isPending}
            >
              {createAccountMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Nova Categoria"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <Input
            name="name"
            label="Nome da Categoria"
            placeholder="Ex: Streaming"
            required
          />

          <Select name="type" label="Tipo" required>
            <option value="">Selecione o tipo</option>
            <option value={TransactionType.Income}>Receita</option>
            <option value={TransactionType.Expense}>Despesa</option>
          </Select>

          <Input
            name="icon"
            label="Ícone (emoji)"
            placeholder="📺"
            maxLength={2}
          />

          <Input
            name="color"
            type="color"
            label="Cor"
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createCategoryMutation.isPending}
            >
              {createCategoryMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
}
