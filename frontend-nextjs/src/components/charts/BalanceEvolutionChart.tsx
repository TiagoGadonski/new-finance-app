'use client';

import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface Transaction {
  date: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
}

interface Props {
  transactions: Transaction[];
  initialBalance?: number;
}

export function BalanceEvolutionChart({ transactions, initialBalance = 0 }: Props) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Sort transactions by date
    const sorted = [...transactions].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Group by month and calculate cumulative balance
    const monthlyData: Record<string, { month: string; balance: number; income: number; expense: number }> = {};
    let cumulativeBalance = initialBalance;

    sorted.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          balance: cumulativeBalance,
          income: 0,
          expense: 0
        };
      }

      if (transaction.type === 0) {
        cumulativeBalance += transaction.amount;
        monthlyData[monthKey].income += transaction.amount;
      } else {
        cumulativeBalance -= transaction.amount;
        monthlyData[monthKey].expense += transaction.amount;
      }

      monthlyData[monthKey].balance = cumulativeBalance;
    });

    // Convert to array and format
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6) // Last 6 months
      .map(item => ({
        ...item,
        monthLabel: new Date(item.month + '-01').toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit'
        })
      }));
  }, [transactions, initialBalance]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
        Sem dados para exibir
      </div>
    );
  }

  const isPositiveTrend = data.length >= 2 && data[data.length - 1].balance >= data[0].balance;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositiveTrend ? "#10b981" : "#ef4444"} stopOpacity={0.1}/>
            <stop offset="95%" stopColor={isPositiveTrend ? "#10b981" : "#ef4444"} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
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
          tickFormatter={(value) => {
            if (Math.abs(value) >= 1000) {
              return `R$ ${(value / 1000).toFixed(0)}k`;
            }
            return formatCurrency(value);
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number | undefined) => value !== undefined ? [formatCurrency(value), 'Saldo'] : ['', 'Saldo']}
          labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="line"
        />
        <Line
          type="monotone"
          dataKey="balance"
          name="Saldo Acumulado"
          stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
          strokeWidth={3}
          dot={{ fill: isPositiveTrend ? "#10b981" : "#ef4444", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
