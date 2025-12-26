'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { goalsApi } from '@/lib/api';
import { Card, Button, Modal, Input, EmptyState, ListSkeleton, Badge } from '@/components/ui';
import { Plus, Trash2, Target, TrendingUp, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CreateGoalRequest, ContributeGoalRequest, GoalStatus } from '@/types';

export default function GoalsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [contributeModalGoalId, setContributeModalGoalId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: goalsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setIsCreateModalOpen(false);
    },
  });

  const contributeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContributeGoalRequest }) =>
      goalsApi.contribute(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      setContributeModalGoalId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: goalsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
    },
  });

  const handleCreateGoal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateGoalRequest = {
      name: formData.get('name') as string,
      targetAmount: parseFloat(formData.get('targetAmount') as string),
      targetDate: formData.get('targetDate') as string,
    };

    createMutation.mutate(data);
  };

  const handleContribute = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!contributeModalGoalId) return;

    const formData = new FormData(e.currentTarget);

    const data: ContributeGoalRequest = {
      amount: parseFloat(formData.get('amount') as string),
    };

    contributeMutation.mutate({ id: contributeModalGoalId, data });
  };

  const handleDeleteGoal = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta meta?')) {
      deleteMutation.mutate(id);
    }
  };

  const activeGoals = goals?.filter(g => g.status === GoalStatus.InProgress) || [];
  const completedGoals = goals?.filter(g => g.status === GoalStatus.Completed) || [];
  const totalSaved = goals?.reduce((sum, g) => sum + g.currentAmount, 0) || 0;

  const contributeGoal = goals?.find(g => g.id === contributeModalGoalId);

  if (goalsLoading) {
    return (
      <PageContainer title="Metas Financeiras" subtitle="Alcance seus objetivos financeiros">
        <div className="space-y-6">
          <div className="flex justify-end">
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
          </div>
          <ListSkeleton count={3} />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Metas Financeiras"
      subtitle="Alcance seus objetivos financeiros"
    >
      <div className="space-y-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Meta
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Economizado</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900">
                  {formatCurrency(totalSaved)}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Metas Ativas</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-blue-600">
                  {activeGoals.length}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-600">Concluídas</p>
                <p className="mt-2 text-2xl sm:text-3xl font-bold text-emerald-600">
                  {completedGoals.length}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Metas em Progresso</h2>
            <div className="space-y-4">
              {activeGoals.map((goal) => {
                const daysUntilTarget = Math.ceil(
                  (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );

                return (
                  <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                    <div className="space-y-4 p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
                            <Badge variant="info">Em Progresso</Badge>
                          </div>
                          <p className="text-sm text-slate-600">
                            Meta até {format(new Date(goal.targetDate), "dd/MM/yyyy", { locale: ptBR })}
                            {daysUntilTarget > 0 && ` (${daysUntilTarget} dias)`}
                          </p>
                        </div>
                        <div className="flex gap-2 self-end sm:self-auto">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setContributeModalGoalId(goal.id)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Contribuir
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteGoal(goal.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-rose-600" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">
                            {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                          </span>
                          <span className="font-semibold text-slate-900">
                            {goal.percentageAchieved.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-blue-600 transition-all"
                            style={{ width: `${Math.min(goal.percentageAchieved, 100)}%` }}
                          />
                        </div>
                        <p className="text-sm text-slate-600 mt-2">
                          Faltam: <span className="font-semibold text-slate-900">{formatCurrency(goal.remainingAmount)}</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Metas Concluídas</h2>
            <div className="space-y-4">
              {completedGoals.map((goal) => (
                <Card key={goal.id} className="opacity-75 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CheckCircle className="w-5 h-5 text-emerald-600" />
                        <h3 className="text-lg font-semibold text-slate-900">{goal.name}</h3>
                        <Badge variant="success">Concluída</Badge>
                      </div>
                      <p className="text-sm text-slate-600">
                        {formatCurrency(goal.currentAmount)} economizados
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGoal(goal.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4 text-rose-600" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!goals || goals.length === 0 ? (
          <EmptyState
            icon={Target}
            title="Nenhuma meta cadastrada"
            description="Comece definindo suas metas financeiras e acompanhe seu progresso rumo aos seus objetivos"
            action={{
              label: "Nova Meta",
              onClick: () => setIsCreateModalOpen(true)
            }}
          />
        ) : null}

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Meta Financeira"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            name="name"
            label="Nome da Meta"
            placeholder="Ex: Viagem, Carro novo..."
            required
          />

          <Input
            name="targetAmount"
            type="number"
            step="0.01"
            label="Valor Alvo"
            placeholder="0.00"
            required
          />

          <Input
            name="targetDate"
            type="date"
            label="Data Alvo"
            min={format(new Date(), 'yyyy-MM-dd')}
            required
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
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
              Erro ao criar meta. Tente novamente.
            </Alert>
          )}
        </form>
      </Modal>

        {/* Contribute Modal */}
        <Modal
          isOpen={contributeModalGoalId !== null}
          onClose={() => setContributeModalGoalId(null)}
          title={`Contribuir para: ${contributeGoal?.name || ''}`}
        >
          <form onSubmit={handleContribute} className="space-y-4">
            {contributeGoal && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Progresso atual:</span>
                  <span className="font-semibold">
                    {formatCurrency(contributeGoal.currentAmount)} / {formatCurrency(contributeGoal.targetAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Falta:</span>
                  <span className="font-semibold text-blue-700">
                    {formatCurrency(contributeGoal.targetAmount - contributeGoal.currentAmount)}
                  </span>
                </div>
              </div>
            )}

          <Input
            name="amount"
            type="number"
            step="0.01"
            label="Valor da Contribuição"
            placeholder="0.00"
            required
            autoFocus
          />

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setContributeModalGoalId(null)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={contributeMutation.isPending}
            >
              {contributeMutation.isPending ? 'Contribuindo...' : 'Contribuir'}
            </Button>
          </div>

          {contributeMutation.isError && (
            <Alert variant="danger">
              Erro ao fazer contribuição. Tente novamente.
            </Alert>
          )}
        </form>
      </Modal>
      </div>
    </PageContainer>
  );
}
