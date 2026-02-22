'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { subscriptionsApi, debtsApi, reportsApi } from '@/lib/api';
import { Card, LoadingSpinner, Badge, Tabs, Button } from '@/components/ui';
import { PageContainer } from '@/components/layout/PageContainer';
import { formatCurrency } from '@/lib/utils/currency';
import { Receipt, CreditCard, Wallet, ArrowRight, CheckCircle, Clock, RefreshCw, CircleDollarSign } from 'lucide-react';
import Link from 'next/link';
import type { SubscriptionDto, DebtDto } from '@/types';
import toast from 'react-hot-toast';

export default function MonthlyBillsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const queryClient = useQueryClient();

  const processBillingsMutation = useMutation({
    mutationFn: reportsApi.generateRecurring,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success(`${data.length} transações recorrentes criadas`);
    },
    onError: () => {
      toast.error('Erro ao processar cobranças');
    },
  });

  const markSubPaidMutation = useMutation({
    mutationFn: subscriptionsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      toast.success('Assinatura marcada como paga!');
    },
    onError: () => {
      toast.error('Erro ao marcar como paga');
    },
  });

  const markDebtPaidMutation = useMutation({
    mutationFn: debtsApi.markPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      toast.success('Parcela marcada como paga!');
    },
    onError: () => {
      toast.error('Erro ao marcar parcela como paga');
    },
  });

  const { data: subscriptions, isLoading: subsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  });

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: debtsApi.getAll,
  });

  const isLoading = subsLoading || debtsLoading;

  const { activeSubscriptions, totalSubscriptions, activeDebts, totalDebtPayments, debtCount } = useMemo(() => {
    const activeSubscriptions = subscriptions?.filter(s => s.isActive) || [];
    const totalSubscriptions = activeSubscriptions.reduce((sum, s) => sum + s.amount, 0);
    const activeDebts = debts?.filter(d => !d.isSettled) || [];
    const totalDebtPayments = activeDebts.reduce((sum, d) => sum + d.minimumPayment, 0);
    const debtCount = activeDebts.length;

    return { activeSubscriptions, totalSubscriptions, activeDebts, totalDebtPayments, debtCount };
  }, [subscriptions, debts]);

  const totalMonthly = totalSubscriptions + totalDebtPayments;

  if (isLoading) {
    return (
      <PageContainer title="Contas do Mês">
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Contas do Mês"
      subtitle="Visão consolidada das suas despesas fixas mensais"
    >
      <div className="space-y-6">
        {/* Process Recurring Button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => processBillingsMutation.mutate()}
            disabled={processBillingsMutation.isPending}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${processBillingsMutation.isPending ? 'animate-spin' : ''}`} />
            {processBillingsMutation.isPending ? 'Processando...' : 'Processar Cobranças do Mês'}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Card className="card-hover group animate-fadeIn">
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #10b981 0%, #8b5cf6 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Total Mensal</p>
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                    <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalMonthly)}
                </p>
                <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--foreground)' }}>
                  Assinaturas + parcelas de dívidas
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-hover group animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Assinaturas Ativas</p>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(totalSubscriptions)}
                </p>
                <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--foreground)' }}>
                  {activeSubscriptions.length} assinatura{activeSubscriptions.length !== 1 ? 's' : ''} ativa{activeSubscriptions.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-hover group animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Parcelas de Dívidas</p>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {formatCurrency(totalDebtPayments)}
                </p>
                <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--foreground)' }}>
                  {debtCount} dívida{debtCount !== 1 ? 's' : ''} ativa{debtCount !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs
          tabs={[
            { key: 'all', label: 'Todos' },
            { key: 'subscriptions', label: 'Assinaturas' },
            { key: 'debts', label: 'Dívidas / Parcelas' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {/* Tab Content */}
        {(activeTab === 'all' || activeTab === 'subscriptions') && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Assinaturas Ativas
                </h3>
                <Link
                  href="/subscriptions"
                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Gerenciar Assinaturas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {activeSubscriptions.length > 0 ? (
                <div className="space-y-3">
                  {[...activeSubscriptions]
                    .sort((a, b) => a.billingDay - b.billingDay)
                    .map((sub, index) => {
                      const nextDate = new Date(sub.nextBillingDate);

                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] animate-fadeIn"
                          style={{
                            backgroundColor: 'var(--background-secondary)',
                            animationDelay: `${index * 0.05}s`,
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                              <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                                {sub.name}
                              </p>
                              <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                                Dia {sub.billingDay} &middot; Próxima: {nextDate.toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              sub.isPaidThisMonth
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {sub.isPaidThisMonth ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {sub.isPaidThisMonth ? 'Pago' : 'Pendente'}
                            </span>
                            {!sub.isPaidThisMonth && (
                              <button
                                onClick={() => markSubPaidMutation.mutate(sub.id)}
                                disabled={markSubPaidMutation.isPending}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                title="Marcar como Pago"
                              >
                                <CircleDollarSign className="w-4 h-4" />
                              </button>
                            )}
                            <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                              {formatCurrency(sub.amount)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma assinatura ativa</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {(activeTab === 'all' || activeTab === 'debts') && (
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  Dívidas com Parcela Mensal
                </h3>
                <Link
                  href="/debts"
                  className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium flex items-center gap-1 transition-colors"
                >
                  Gerenciar Dívidas
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {activeDebts.length > 0 ? (
                <div className="space-y-3">
                  {activeDebts.map((debt, index) => {
                    const progress = debt.totalAmount
                      ? ((debt.totalAmount - debt.remainingAmount) / debt.totalAmount) * 100
                      : null;

                    return (
                      <div
                        key={debt.id}
                        className="p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] animate-fadeIn"
                        style={{
                          backgroundColor: 'var(--background-secondary)',
                          animationDelay: `${index * 0.05}s`,
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                              <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                                {debt.name}
                              </p>
                              <div className="flex items-center gap-2 text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                                <span>Parcela: {formatCurrency(debt.minimumPayment)}</span>
                                {debt.interestRate > 0 && (
                                  <span>&middot; Juros: {debt.interestRate.toFixed(1)}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 ml-3">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              debt.isPaidThisMonth
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            }`}>
                              {debt.isPaidThisMonth ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {debt.isPaidThisMonth ? 'Pago' : 'Pendente'}
                            </span>
                            {!debt.isPaidThisMonth && (
                              <button
                                onClick={() => markDebtPaidMutation.mutate(debt.id)}
                                disabled={markDebtPaidMutation.isPending}
                                className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                                title="Marcar Parcela Paga"
                              >
                                <CircleDollarSign className="w-4 h-4" />
                              </button>
                            )}
                            <div className="text-right">
                              <p className="font-bold text-lg" style={{ color: 'var(--foreground)' }}>
                                {formatCurrency(debt.minimumPayment)}
                              </p>
                              <p className="text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
                                Restante: {formatCurrency(debt.remainingAmount)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {progress !== null && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'var(--foreground)' }}>
                              <span className="opacity-60">Progresso</span>
                              <span className="font-medium">{progress.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                  <CreditCard className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhuma dívida registrada</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
