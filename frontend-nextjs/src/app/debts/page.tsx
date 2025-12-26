'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { debtsApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, EmptyState, ListSkeleton, Alert } from '@/components/ui';
import { Plus, Trash2, CreditCard, Calculator, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { CreateDebtRequest, DebtSimulationRequest, PaymentStrategy, DebtSimulationResult } from '@/types';

export default function DebtsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<DebtSimulationResult | null>(null);
  const queryClient = useQueryClient();

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: debtsApi.getAll,
  });

  const createMutation = useMutation({
    mutationFn: debtsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      setIsCreateModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: debtsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
  });

  const simulateMutation = useMutation({
    mutationFn: debtsApi.simulate,
    onSuccess: (data) => {
      setSimulationResult(data);
    },
  });

  const handleCreateDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: CreateDebtRequest = {
      name: formData.get('name') as string,
      totalAmount: parseFloat(formData.get('totalAmount') as string),
      remainingAmount: parseFloat(formData.get('remainingAmount') as string),
      interestRate: parseFloat(formData.get('interestRate') as string),
      minimumPayment: parseFloat(formData.get('minimumPayment') as string),
    };

    createMutation.mutate(data);
  };

  const handleDeleteDebt = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta dívida?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSimulate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const data: DebtSimulationRequest = {
      monthlyPayment: parseFloat(formData.get('monthlyPayment') as string),
      strategy: parseInt(formData.get('strategy') as string) as PaymentStrategy,
    };

    simulateMutation.mutate(data);
  };

  // Calculate totals
  const totalDebt = debts?.reduce((sum, d) => sum + d.totalAmount, 0) || 0;
  const totalRemaining = debts?.reduce((sum, d) => sum + d.remainingAmount, 0) || 0;
  const totalPaid = totalDebt - totalRemaining;
  const averageProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;
  const totalMinimumPayment = debts?.reduce((sum, d) => sum + d.minimumPayment, 0) || 0;

  if (debtsLoading) {
    return (
      <PageContainer title="Dívidas" subtitle="Gerencie e planeje o pagamento de suas dívidas">
        <div className="space-y-6">
          <div className="flex justify-end gap-2">
            <div className="h-10 w-44 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <ListSkeleton count={1} />
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
      title="Dívidas"
      subtitle="Gerencie e planeje o pagamento de suas dívidas"
    >
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsSimulatorOpen(true)}
            disabled={!debts || debts.length === 0}
          >
            <Calculator className="w-4 h-4 mr-2" />
            Simular Pagamento
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Dívida
          </Button>
        </div>

        {/* Summary Cards */}
        {debts && debts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Dívida Total</p>
                  <p className="mt-2 text-xl sm:text-2xl font-bold text-rose-600">
                    {formatCurrency(totalDebt)}
                  </p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl">
                  <CreditCard className="w-5 h-5 text-rose-600" />
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Restante</p>
                  <p className="mt-2 text-xl sm:text-2xl font-bold text-orange-600">
                    {formatCurrency(totalRemaining)}
                  </p>
                </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <TrendingDown className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm font-medium text-slate-600">Pago</p>
                  <p className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600">
                    {formatCurrency(totalPaid)}
                  </p>
                </div>
                <div className="text-sm text-slate-600">
                  {averageProgress.toFixed(1)}%
                </div>
              </div>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <p className="text-sm font-medium text-slate-600">Pagamento Mínimo</p>
                <p className="mt-2 text-xl sm:text-2xl font-bold text-slate-900">
                  {formatCurrency(totalMinimumPayment)}
                </p>
                <p className="text-xs text-slate-500 mt-1">por mês</p>
              </div>
            </Card>
          </div>
        )}

        {/* Debts List */}
        <div className="space-y-4">
          {debts && debts.length > 0 ? (
            debts.map((debt) => {
              const percentagePaid = debt.totalAmount > 0
                ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
                : 0;

              return (
                <Card key={debt.id} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-4 p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{debt.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-slate-600">
                          <span>Taxa: {debt.interestRate}% a.m.</span>
                          <span>• Parcela mínima: {formatCurrency(debt.minimumPayment)}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDebt(debt.id)}
                        disabled={deleteMutation.isPending}
                        className="self-end sm:self-auto"
                      >
                        <Trash2 className="w-4 h-4 text-rose-600" />
                      </Button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600">
                          {formatCurrency(debt.totalAmount - debt.remainingAmount)} de {formatCurrency(debt.totalAmount)} pagos
                        </span>
                        <span className="font-semibold text-slate-900">
                          {percentagePaid.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${
                            percentagePaid >= 75
                              ? 'bg-emerald-600'
                              : percentagePaid >= 50
                              ? 'bg-yellow-500'
                              : 'bg-rose-600'
                          }`}
                          style={{ width: `${Math.min(percentagePaid, 100)}%` }}
                        />
                      </div>
                      <p className="text-sm text-slate-600 mt-2">
                        Restante: <span className="font-semibold text-rose-600">{formatCurrency(debt.remainingAmount)}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })
          ) : (
            <EmptyState
              icon={CreditCard}
              title="Nenhuma dívida cadastrada"
              description="Registre suas dívidas para gerenciá-las e simular estratégias de pagamento"
              action={{
                label: "Nova Dívida",
                onClick: () => setIsCreateModalOpen(true)
              }}
            />
          )}
        </div>

      {/* Create Debt Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Nova Dívida"
      >
        <form onSubmit={handleCreateDebt} className="space-y-4">
          <Input
            name="name"
            label="Nome da Dívida"
            placeholder="Ex: Cartão de crédito, Empréstimo..."
            required
          />

          <Input
            name="totalAmount"
            type="number"
            step="0.01"
            label="Valor Total"
            placeholder="0.00"
            required
          />

          <Input
            name="remainingAmount"
            type="number"
            step="0.01"
            label="Valor Restante"
            placeholder="0.00"
            required
          />

          <Input
            name="interestRate"
            type="number"
            step="0.01"
            label="Taxa de Juros (% ao mês)"
            placeholder="0.00"
            required
          />

          <Input
            name="minimumPayment"
            type="number"
            step="0.01"
            label="Pagamento Mínimo Mensal"
            placeholder="0.00"
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
              Erro ao criar dívida. Tente novamente.
            </Alert>
          )}
        </form>
      </Modal>

      {/* Simulator Modal */}
      <Modal
        isOpen={isSimulatorOpen}
        onClose={() => {
          setIsSimulatorOpen(false);
          setSimulationResult(null);
        }}
        title="Simulador de Pagamento de Dívidas"
      >
        <div className="space-y-6">
          <form onSubmit={handleSimulate} className="space-y-4">
            <Alert variant="info">
              Simule quanto tempo levará para pagar todas as suas dívidas com diferentes estratégias.
            </Alert>

            <Input
              name="monthlyPayment"
              type="number"
              step="0.01"
              label="Valor Mensal Disponível"
              placeholder="0.00"
              required
              helperText="Quanto você pode pagar por mês no total"
            />

            <Select name="strategy" label="Estratégia de Pagamento" required>
              <option value="">Selecione a estratégia</option>
              <option value={PaymentStrategy.Snowball}>
                Snowball (menor saldo primeiro)
              </option>
              <option value={PaymentStrategy.Avalanche}>
                Avalanche (maior juros primeiro)
              </option>
            </Select>

            <Button
              type="submit"
              className="w-full"
              disabled={simulateMutation.isPending}
            >
              {simulateMutation.isPending ? 'Simulando...' : 'Simular'}
            </Button>

            {simulateMutation.isError && (
              <Alert variant="danger">
                Erro ao simular. Verifique se o valor mensal é suficiente para cobrir os pagamentos mínimos.
              </Alert>
            )}
          </form>

          {/* Simulation Results */}
          {simulationResult && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-lg text-slate-900">Resultado da Simulação</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="bg-blue-50 hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <p className="text-sm text-slate-600">Tempo para quitar</p>
                    <p className="text-2xl font-bold text-blue-700">
                      {simulationResult.totalMonths} meses
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      ({Math.floor(simulationResult.totalMonths / 12)} anos e {simulationResult.totalMonths % 12} meses)
                    </p>
                  </div>
                </Card>

                <Card className="bg-orange-50 hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <p className="text-sm text-slate-600">Juros Total</p>
                    <p className="text-2xl font-bold text-orange-700">
                      {formatCurrency(simulationResult.totalInterestPaid)}
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <p className="text-sm text-slate-600">Valor Total a Pagar</p>
                  <p className="text-3xl font-bold text-slate-900">
                    {formatCurrency(simulationResult.totalAmountPaid)}
                  </p>
                </div>
              </Card>

              {/* Payment Plan Preview (first 6 months) */}
              {simulationResult.monthlyPlan && simulationResult.monthlyPlan.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Plano de Pagamento (primeiros meses)
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {simulationResult.monthlyPlan.slice(0, 6).map((plan) => (
                      <div
                        key={`${plan.month}-${plan.debtName}`}
                        className="bg-slate-50 rounded-lg p-3 text-sm hover:bg-slate-100 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                            <p className="font-medium text-slate-900">
                              Mês {plan.month} - {plan.debtName}
                            </p>
                            <p className="text-xs text-slate-600 mt-1">
                              Principal: {formatCurrency(plan.principal)} | Juros: {formatCurrency(plan.interest)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900">
                              {formatCurrency(plan.payment)}
                            </p>
                            <p className="text-xs text-slate-600">
                              Saldo: {formatCurrency(plan.remainingBalance)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {simulationResult.monthlyPlan.length > 6 && (
                    <p className="text-xs text-slate-500 text-center mt-2">
                      Mostrando 6 de {simulationResult.monthlyPlan.length} meses
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
      </div>
    </PageContainer>
  );
}
