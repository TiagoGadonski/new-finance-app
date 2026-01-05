'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { transactionsApi, subscriptionsApi, goalsApi, debtsApi } from '@/lib/api';
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { TrendingUp, TrendingDown, Receipt, CreditCard, Target, Wallet, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TransactionType } from '@/types';

// Tipo unificado para todas as movimentações
interface StatementItem {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'subscription' | 'goal' | 'debt';
  categoryName?: string;
  accountName?: string;
  installmentInfo?: string;
  icon: any;
  color: string;
}

export default function StatementPage() {
  const currentDate = new Date();
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  });

  const { data: subscriptions, isLoading: subscriptionsLoading } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  });

  const { data: goals, isLoading: goalsLoading } = useQuery({
    queryKey: ['goals'],
    queryFn: goalsApi.getAll,
  });

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['debts'],
    queryFn: debtsApi.getAll,
  });

  // Combinar todas as movimentações em uma lista unificada
  const statementItems: StatementItem[] = useMemo(() => {
    const items: StatementItem[] = [];

    // Adicionar transações
    transactions?.forEach(t => {
      const installmentInfo = t.installmentCount && t.currentInstallment
        ? `${t.currentInstallment}/${t.installmentCount}`
        : undefined;

      items.push({
        id: `transaction-${t.id}`,
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type === TransactionType.Income ? 'income' : 'expense',
        categoryName: t.categoryName,
        accountName: t.accountName,
        installmentInfo,
        icon: t.type === TransactionType.Income ? TrendingUp : TrendingDown,
        color: t.type === TransactionType.Income ? '#10b981' : '#ef4444',
      });
    });

    // Adicionar assinaturas ativas
    subscriptions?.filter(s => s.isActive).forEach(s => {
      const nextBillingDate = new Date(s.nextBillingDate);

      items.push({
        id: `subscription-${s.id}`,
        date: nextBillingDate,
        description: `${s.name} (Assinatura)`,
        amount: s.amount,
        type: 'subscription',
        categoryName: s.categoryName,
        icon: Receipt,
        color: '#8b5cf6',
      });
    });

    // Adicionar metas ativas
    goals?.filter(g => g.status === 0).forEach(g => {
      items.push({
        id: `goal-${g.id}`,
        date: g.targetDate ? new Date(g.targetDate) : currentDate,
        description: `${g.name} (Meta)`,
        amount: g.targetAmount - g.currentAmount,
        type: 'goal',
        icon: Target,
        color: '#06b6d4',
      });
    });

    // Adicionar dívidas
    debts?.forEach(d => {
      items.push({
        id: `debt-${d.id}`,
        date: d.dueDate ? new Date(d.dueDate) : currentDate,
        description: `${d.name} (Dívida)`,
        amount: d.remainingAmount,
        type: 'debt',
        icon: CreditCard,
        color: '#f97316',
      });
    });

    // Ordenar por data (mais recente primeiro)
    return items.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [transactions, subscriptions, goals, debts, currentDate]);

  // Calcular totais
  const { totalIncome, totalExpense, totalSubscriptions, totalDebts, totalGoals } = useMemo(() => {
    const totalIncome = statementItems
      .filter(i => i.type === 'income')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalExpense = statementItems
      .filter(i => i.type === 'expense')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalSubscriptions = statementItems
      .filter(i => i.type === 'subscription')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalDebts = statementItems
      .filter(i => i.type === 'debt')
      .reduce((sum, i) => sum + i.amount, 0);

    const totalGoals = statementItems
      .filter(i => i.type === 'goal')
      .reduce((sum, i) => sum + i.amount, 0);

    return { totalIncome, totalExpense, totalSubscriptions, totalDebts, totalGoals };
  }, [statementItems]);

  const balance = totalIncome - totalExpense;

  if (transactionsLoading || subscriptionsLoading || goalsLoading || debtsLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Extrato Completo"
      subtitle="Visualização unificada de todas as suas movimentações financeiras"
    >
      <div className="space-y-6">
        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs opacity-70" style={{ color: 'var(--foreground)' }}>Receitas</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(totalIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-lg">
                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-xs opacity-70" style={{ color: 'var(--foreground)' }}>Despesas</p>
                <p className="text-lg font-bold text-rose-600">
                  {formatCurrency(totalExpense)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs opacity-70" style={{ color: 'var(--foreground)' }}>Assinaturas</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(totalSubscriptions)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <CreditCard className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs opacity-70" style={{ color: 'var(--foreground)' }}>Dívidas</p>
                <p className="text-lg font-bold text-orange-600">
                  {formatCurrency(totalDebts)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                balance >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-rose-100 dark:bg-rose-900/30'
              }`}>
                <DollarSign className={`w-5 h-5 ${
                  balance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-rose-600 dark:text-rose-400'
                }`} />
              </div>
              <div>
                <p className="text-xs opacity-70" style={{ color: 'var(--foreground)' }}>Saldo</p>
                <p className={`text-lg font-bold ${
                  balance >= 0 ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {formatCurrency(Math.abs(balance))}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Movimentações */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Todas as Movimentações ({statementItems.length})
            </h2>

            {statementItems.length > 0 ? (
              <div className="space-y-3">
                {statementItems.map((item, index) => {
                  const Icon = item.icon;
                  const isNegative = item.type === 'expense' || item.type === 'subscription' || item.type === 'debt';

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 rounded-lg hover:bg-opacity-50 transition-all duration-200 animate-fadeIn"
                      style={{
                        backgroundColor: 'var(--background-secondary)',
                        animationDelay: `${index * 0.02}s`,
                      }}
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div
                          className="p-3 rounded-lg"
                          style={{ backgroundColor: `${item.color}20` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: item.color }} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
                            <span>{format(item.date, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}</span>
                            {item.categoryName && <span>• {item.categoryName}</span>}
                            {item.accountName && <span>• {item.accountName}</span>}
                            {item.installmentInfo && (
                              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium">
                                Parcela {item.installmentInfo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="ml-4 text-right">
                        <p
                          className="text-xl font-bold"
                          style={{ color: item.color }}
                        >
                          {isNegative ? '-' : '+'}
                          {formatCurrency(item.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="Nenhuma movimentação encontrada"
                description="Comece criando transações, assinaturas, metas ou dívidas para ver seu extrato completo"
              />
            )}
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
