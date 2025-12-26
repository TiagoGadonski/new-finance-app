'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { accountsApi, transactionsApi, subscriptionsApi } from '@/lib/api';
import { Card, LoadingSpinner, EmptyState } from '@/components/ui';
import { TrendingUp, TrendingDown, Wallet, ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/currency';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';
import { TransactionType } from '@/types';
import { PageContainer } from '@/components/layout/PageContainer';
import { IncomeVsExpenseChart } from '@/components/charts/IncomeVsExpenseChart';
import { CategoryPieChart } from '@/components/charts/CategoryPieChart';
import { BalanceEvolutionChart } from '@/components/charts/BalanceEvolutionChart';
import { TopCategoriesChart } from '@/components/charts/TopCategoriesChart';
import { MonthlyComparisonChart } from '@/components/charts/MonthlyComparisonChart';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';

export default function DashboardPage() {
  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
  });

  const { data: transactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  });

  // Memoize calculations
  const { totalBalance, monthlyIncome, monthlyExpense, recentTransactions } = useMemo(() => {
    const totalBalance = accounts?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

    // Get current month transactions
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthTransactions = transactions?.filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
    }) || [];

    const monthlyIncome = currentMonthTransactions
      .filter(t => t.type === TransactionType.Income)
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyExpense = currentMonthTransactions
      .filter(t => t.type === TransactionType.Expense)
      .reduce((sum, t) => sum + t.amount, 0);

    // Get recent transactions (last 5)
    const recentTransactions = [...(transactions || [])]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return { totalBalance, monthlyIncome, monthlyExpense, recentTransactions };
  }, [accounts, transactions]);

  if (accountsLoading || transactionsLoading) {
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
      title="Dashboard"
      subtitle="Visão geral das suas finanças"
    >
      <div className="space-y-6">
        {/* Summary Cards - Enhanced KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="card-hover group cursor-pointer animate-fadeIn">
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Saldo Total</p>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold animate-scaleIn" style={{ color: 'var(--foreground)' }}>
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-hover group cursor-pointer animate-fadeIn" style={{ animationDelay: '0.1s' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Receitas do Mês</p>
                  <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-emerald-600 animate-scaleIn">
                  {formatCurrency(monthlyIncome)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-hover group cursor-pointer animate-fadeIn" style={{ animationDelay: '0.2s' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Despesas do Mês</p>
                  <div className="p-2 bg-rose-50 dark:bg-rose-900/30 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                    <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-rose-600 animate-scaleIn">
                  {formatCurrency(monthlyExpense)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="card-hover group cursor-pointer animate-fadeIn" style={{ animationDelay: '0.3s' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-5" style={{ background: monthlyIncome - monthlyExpense >= 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }} />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium opacity-70" style={{ color: 'var(--foreground)' }}>Economia</p>
                  <div
                    className={`p-2 rounded-lg shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all ${
                      monthlyIncome - monthlyExpense >= 0
                        ? 'bg-emerald-50 dark:bg-emerald-900/30'
                        : 'bg-rose-50 dark:bg-rose-900/30'
                    }`}
                  >
                    {monthlyIncome - monthlyExpense >= 0 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    )}
                  </div>
                </div>
                <p className={`text-3xl font-bold animate-scaleIn ${monthlyIncome - monthlyExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(Math.abs(monthlyIncome - monthlyExpense))}
                </p>
                <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--foreground)' }}>
                  {monthlyIncome > 0 ? `${((monthlyExpense / monthlyIncome) * 100).toFixed(1)}% gasto` : 'Sem receitas'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upcoming Bills */}
        {subscriptions && subscriptions.length > 0 && (
          <div className="animate-fadeIn">
            <UpcomingBills subscriptions={subscriptions} daysAhead={7} />
          </div>
        )}

        {/* Accounts */}
        <Card className="card-hover animate-slideIn">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Contas</h2>
              <Link
                href="/accounts"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {accounts && accounts.length > 0 ? (
              <div className="space-y-3">
                {accounts.map((account, index) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.02] animate-fadeIn"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full shadow-md flex items-center justify-center"
                        style={{ backgroundColor: account.color }}
                      >
                        <Wallet className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--foreground)' }}>{account.name}</p>
                        <p className="text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
                          {account.type === 0 && 'Conta Bancária'}
                          {account.type === 1 && 'Cartão de Crédito'}
                          {account.type === 2 && 'Carteira'}
                          {account.type === 3 && 'Investimento'}
                        </p>
                      </div>
                    </div>
                    <p className={`font-bold text-lg ${account.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatCurrency(account.balance)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Wallet}
                title="Nenhuma conta cadastrada"
                description="Comece criando sua primeira conta para gerenciar suas finanças"
                action={{
                  label: "Criar Conta",
                  onClick: () => window.location.href = '/accounts'
                }}
              />
            )}
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card className="card-hover animate-slideIn" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Transações Recentes</h2>
              <Link
                href="/transactions"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center gap-1 transition-colors"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:scale-[1.01] animate-fadeIn"
                    style={{
                      backgroundColor: 'var(--background-secondary)',
                      animationDelay: `${index * 0.05}s`
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                          {transaction.description}
                        </p>
                        {transaction.type === TransactionType.Income ? (
                          <TrendingUp className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs mt-1 opacity-60" style={{ color: 'var(--foreground)' }}>
                        {format(new Date(transaction.date), "dd 'de' MMM", { locale: ptBR })}
                        {transaction.categoryName && ` • ${transaction.categoryName}`}
                      </p>
                    </div>
                    <p className={`font-bold text-lg ml-4 ${transaction.type === TransactionType.Income ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {transaction.type === TransactionType.Income ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={TrendingUp}
                title="Nenhuma transação ainda"
                description="Comece registrando suas receitas e despesas para acompanhar suas finanças"
                action={{
                  label: "Nova Transação",
                  onClick: () => window.location.href = '/transactions'
                }}
              />
            )}
          </div>
        </Card>

        {/* Income vs Expense Chart */}
        <Card className="p-6 card-hover animate-scaleIn" style={{ animationDelay: '0.2s' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Receitas vs Despesas (Últimos 6 meses)
          </h2>
          <IncomeVsExpenseChart transactions={transactions || []} />
        </Card>

        {/* Category Pie Chart */}
        <Card className="p-6 card-hover animate-scaleIn" style={{ animationDelay: '0.3s' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Despesas por Categoria
          </h2>
          <CategoryPieChart transactions={transactions || []} />
        </Card>

        {/* Grid com 2 colunas para novos gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Balance Evolution Chart */}
          <Card className="p-6 card-hover animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Evolução do Saldo
            </h2>
            <BalanceEvolutionChart transactions={transactions || []} initialBalance={totalBalance - (monthlyIncome - monthlyExpense)} />
          </Card>

          {/* Monthly Comparison Chart */}
          <Card className="p-6 card-hover animate-fadeIn" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              Comparação Mensal
            </h2>
            <MonthlyComparisonChart transactions={transactions || []} />
          </Card>
        </div>

        {/* Top Categories Chart */}
        <Card className="p-6 card-hover animate-scaleIn" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
            Top 5 Categorias de Despesas (Mês Atual)
          </h2>
          <TopCategoriesChart transactions={transactions || []} limit={5} />
        </Card>
      </div>
    </PageContainer>
  );
}
