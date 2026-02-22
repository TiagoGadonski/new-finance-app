'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { debtsApi } from '@/lib/api';
import { Card, Button, Modal, Input, Select, EmptyState, ListSkeleton, Alert } from '@/components/ui';
import { EditDebtModal } from '@/components/debts/EditDebtModal';
import { Plus, Trash2, Edit2, CreditCard, Calculator, TrendingDown, CheckCircle, Clock, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { Tabs, Badge } from '@/components/ui';
import { CreateDebtRequest, DebtSimulationRequest, PaymentStrategy, DebtSimulationResult, DebtDto } from '@/types';
import toast from 'react-hot-toast';

export default function DebtsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [simulationResult, setSimulationResult] = useState<DebtSimulationResult | null>(null);
  const [editingDebt, setEditingDebt] = useState<DebtDto | null>(null);
  const [debtTab, setDebtTab] = useState('active');
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

  const markPaidMutation = useMutation({
    mutationFn: debtsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Parcela marcada como paga!');
    },
    onError: () => {
      toast.error('Erro ao marcar parcela como paga');
    },
  });

  const handleCreateDebt = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const totalAmountStr = formData.get('totalAmount') as string;
    const data: CreateDebtRequest = {
      name: formData.get('name') as string,
      totalAmount: totalAmountStr ? parseFloat(totalAmountStr) : null,
      remainingAmount: parseFloat(formData.get('remainingAmount') as string) || 0,
      interestRate: parseFloat(formData.get('interestRate') as string) || 0,
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
  const debtsWithTotal = debts?.filter(d => d.totalAmount != null) || [];
  const totalDebt = debtsWithTotal.reduce((sum, d) => sum + d.totalAmount!, 0);
  const totalRemaining = debts?.reduce((sum, d) => sum + d.remainingAmount, 0) || 0;
  const totalPaid = debtsWithTotal.reduce((sum, d) => sum + (d.totalAmount! - d.remainingAmount), 0);
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
            variant="secondary"
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

        {/* Tabs */}
        {debts && debts.length > 0 && (
          <Tabs
            tabs={[
              { key: 'active', label: `Ativas (${debts.filter(d => !d.isSettled).length})` },
              { key: 'settled', label: `Quitadas (${debts.filter(d => d.isSettled).length})` },
            ]}
            activeTab={debtTab}
            onChange={setDebtTab}
          />
        )}

        {/* Debts List */}
        <div className="space-y-4">
          {debts && debts.length > 0 ? (
            debts
              .filter(d => debtTab === 'active' ? !d.isSettled : d.isSettled)
              .map((debt) => {
              const hasTotalAmount = debt.totalAmount != null && debt.totalAmount > 0;
              const percentagePaid = hasTotalAmount
                ? ((debt.totalAmount! - debt.remainingAmount) / debt.totalAmount!) * 100
                : 0;

              return (
                <Card key={debt.id} className="hover:shadow-lg transition-shadow">
                  <div className="space-y-4 p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">{debt.name}</h3>
                          {debt.isSettled ? (
                            <Badge variant="success">Quitada</Badge>
                          ) : (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              debt.isPaidThisMonth
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {debt.isPaidThisMonth ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {debt.isPaidThisMonth ? 'Pago este mês' : 'Pendente'}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-sm text-slate-600">
                          {debt.interestRate > 0 && <span>Taxa: {debt.interestRate}% a.m.</span>}
                          {debt.interestRate > 0 && <span>•</span>}
                          <span>Parcela: {formatCurrency(debt.minimumPayment)}/mês</span>
                          {!hasTotalAmount && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700">Valor indeterminado</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 self-end sm:self-auto">
                        {!debt.isSettled && !debt.isPaidThisMonth && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => markPaidMutation.mutate(debt.id)}
                            disabled={markPaidMutation.isPending}
                            title="Marcar Parcela Paga"
                          >
                            <CircleDollarSign className="w-4 h-4 mr-1 text-emerald-600" />
                            <span className="text-xs">Pagar</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingDebt(debt)}
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDebt(debt.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>

                    {hasTotalAmount ? (
                      <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-slate-600">
                            {formatCurrency(debt.totalAmount! - debt.remainingAmount)} de {formatCurrency(debt.totalAmount!)} pagos
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
                    ) : (
                      <div className="text-sm text-slate-600">
                        <p>Valor mensal: <span className="font-semibold">{formatCurrency(debt.minimumPayment)}</span></p>
                        {debt.remainingAmount > 0 && (
                          <p className="mt-1">Já pago acumulado: <span className="font-semibold text-emerald-600">{formatCurrency(debt.remainingAmount)}</span></p>
                        )}
                      </div>
                    )}
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

      {/* Edit Debt Modal */}
      {editingDebt && (
        <EditDebtModal
          debt={editingDebt}
          isOpen={!!editingDebt}
          onClose={() => setEditingDebt(null)}
        />
      )}

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
            label="Valor Total (opcional)"
            placeholder="Deixe vazio se não souber"
            helperText="Ex: dívida de valor indeterminado como faculdade"
          />

          <Input
            name="remainingAmount"
            type="number"
            step="0.01"
            label="Valor Restante"
            placeholder="0.00"
            helperText="Quanto ainda falta pagar (0 se não souber)"
          />

          <Input
            name="interestRate"
            type="number"
            step="0.01"
            label="Taxa de Juros (% ao mês)"
            placeholder="0"
            helperText="0 se não tiver juros"
          />

          <Input
            name="minimumPayment"
            type="number"
            step="0.01"
            label="Valor da Parcela Mensal"
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
                <Card className="bg-emerald-50 hover:shadow-lg transition-shadow">
                  <div className="p-4">
                    <p className="text-sm text-slate-600">Tempo para quitar</p>
                    <p className="text-2xl font-bold text-emerald-700">
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
