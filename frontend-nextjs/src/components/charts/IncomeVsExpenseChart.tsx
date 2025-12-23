'use client';

import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface Transaction {
  date: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
}

interface Props {
  transactions: Transaction[];
}

export function IncomeVsExpenseChart({ transactions }: Props) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Group by month
    const monthlyData = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }

      if (transaction.type === 0) {
        acc[monthKey].income += transaction.amount;
      } else {
        acc[monthKey].expense += transaction.amount;
      }

      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);

    // Convert to array and sort
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
      .map(item => ({
        ...item,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
      }));
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="monthLabel"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => formatCurrency(value)}
          labelStyle={{ color: '#334155', fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="income"
          name="Receitas"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorIncome)"
        />
        <Area
          type="monotone"
          dataKey="expense"
          name="Despesas"
          stroke="#ef4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorExpense)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
