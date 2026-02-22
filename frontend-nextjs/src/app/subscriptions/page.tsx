'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { subscriptionsApi, categoriesApi, accountsApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, EmptyState, ListSkeleton, Badge, ConfirmDialog } from '@/components/ui';
import { EditSubscriptionModal } from '@/components/subscriptions/EditSubscriptionModal';
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, Bell, Calendar, RefreshCw, CheckCircle, Clock, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreateSubscriptionRequest, TransactionType, SubscriptionDto } from '@/types';
import toast from 'react-hot-toast';

export default function SubscriptionsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [toggleId, setToggleId] = useState<string | null>(null);
  const [editingSubscription, setEditingSubscription] = useState<SubscriptionDto | null>(null);
  const queryClient = useQueryClient();

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: subscriptionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      setIsCreateModalOpen(false);
      toast.success('Assinatura criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao processar. Tente novamente.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: subscriptionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Assinatura excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao processar. Tente novamente.');
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: subscriptionsApi.toggleActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Status alterado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao processar. Tente novamente.');
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: subscriptionsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Assinatura marcada como paga!');
    },
    onError: () => {
      toast.error('Erro ao marcar como paga');
    },
  });

  const handleCreateSubscription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateSubscriptionRequest = {
      name: formData.get('name') as string,
      categoryId: formData.get('categoryId') as string,
      accountId: formData.get('accountId') as string,
      amount: parseFloat(formData.get('amount') as string),
      billingDay: parseInt(formData.get('billingDay') as string),
    };

    createMutation.mutate(data);
  };

  const processBillings = async () => {
    try {
      const response = await subscriptionsApi.processBillings();
      toast.success(response.message);
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    } catch (error) {
      toast.error('Erro ao processar cobranças');
    }
  };

  const handleDeleteSubscription = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const handleToggleActive = (id: string) => {
    setToggleId(id);
  };

  const confirmToggle = () => {
    if (toggleId) {
      toggleActiveMutation.mutate(toggleId);
      setToggleId(null);
    }
  };

  // Calculate monthly total
  const monthlyTotal = subscriptions
    ?.filter(s => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0) || 0;

  const activeCount = subscriptions?.filter(s => s.isActive).length || 0;
  const inactiveCount = subscriptions?.filter(s => !s.isActive).length || 0;

  // Filter expense categories for subscription creation
  const expenseCategories = categories?.filter(c => c.type === TransactionType.Expense) || [];

  if (subscriptionsLoading) {
    return (
      <PageContainer title="Assinaturas" subtitle="Gerencie suas assinaturas e pagamentos recorrentes">
        <div className="space-y-6">
          <div className="flex justify-end gap-3">
            <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-10 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
          </div>
          <ListSkeleton count={4} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Assinaturas"
      subtitle="Gerencie suas assinaturas e pagamentos recorrentes"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={processBillings}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Processar Cobranças
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Assinatura
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Custo Mensal</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatCurrency(monthlyTotal)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <Bell className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Ativas</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600">
                  {activeCount}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <ToggleRight className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Inativas</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-600">
                  {inactiveCount}
                </p>
              </div>
              <div className="p-3 bg-slate-100 rounded-xl">
                <ToggleLeft className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Subscriptions List */}
        <div className="space-y-4">
          {subscriptions && subscriptions.length > 0 ? (
            subscriptions
              .sort((a, b) => {
                // Sort by active status first, then by name
                if (a.isActive === b.isActive) {
                  return a.name.localeCompare(b.name);
                }
                return a.isActive ? -1 : 1;
              })
              .map((subscription) => (
                <Card key={subscription.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900 truncate">
                          {subscription.name}
                        </h3>
                        <Badge variant={subscription.isActive ? 'success' : 'default'}>
                          {subscription.isActive ? 'Ativa' : 'Inativa'}
                        </Badge>
                        {subscription.isActive && (
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            subscription.isPaidThisMonth
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                          }`}>
                            {subscription.isPaidThisMonth ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                            {subscription.isPaidThisMonth ? 'Pago' : 'Pendente'}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-slate-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Próxima cobrança: {format(new Date(subscription.nextBillingDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                        {subscription.categoryName && (
                          <span>• {subscription.categoryName}</span>
                        )}
                        <span>• Dia {subscription.billingDay}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end sm:self-auto">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">
                          {formatCurrency(subscription.amount)}
                        </p>
                        <p className="text-xs text-slate-500">por mês</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {subscription.isActive && !subscription.isPaidThisMonth && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => markPaidMutation.mutate(subscription.id)}
                            disabled={markPaidMutation.isPending}
                            title="Marcar como Pago"
                          >
                            <CircleDollarSign className="w-4 h-4 text-emerald-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingSubscription(subscription)}
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleActive(subscription.id)}
                          disabled={toggleActiveMutation.isPending}
                        >
                          {subscription.isActive ? (
                            <ToggleRight className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-slate-600" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
          ) : (
            <EmptyState
              icon={Bell}
              title="Nenhuma assinatura cadastrada"
              description="Registre suas assinaturas recorrentes para acompanhar os custos mensais e automatizar cobranças"
              action={{
                label: "Nova Assinatura",
                onClick: () => setIsCreateModalOpen(true)
              }}
            />
          )}
        </div>

      {/* Edit Subscription Modal */}
      {editingSubscription && (
        <EditSubscriptionModal
          subscription={editingSubscription}
          isOpen={!!editingSubscription}
          onClose={() => setEditingSubscription(null)}
        />
      )}

      {/* Create Subscription Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Assinatura"
      >
        <form onSubmit={handleCreateSubscription} className="space-y-4">
          <Input
            name="name"
            label="Nome"
            placeholder="Ex: Netflix, Spotify..."
            required
          />

          <Input
            name="amount"
            type="number"
            step="0.01"
            label="Valor Mensal"
            placeholder="0.00"
            required
          />

          <Input
            name="billingDay"
            type="number"
            min="1"
            max="28"
            label="Dia da Cobrança"
            placeholder="1-28"
            required
            helperText="Dia do mês em que a cobrança ocorre (1-28)"
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
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.icon} {category.name}
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

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir Assinatura"
        message="Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        variant="danger"
      />

      {/* Toggle Active Confirmation Dialog */}
      <ConfirmDialog
        isOpen={toggleId !== null}
        onClose={() => setToggleId(null)}
        onConfirm={confirmToggle}
        title="Alterar Status"
        message="Tem certeza que deseja alterar o status desta assinatura?"
        confirmText="Confirmar"
      />
      </div>
    </PageContainer>
  );
}
