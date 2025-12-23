'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface Transaction {
  date: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
}

interface Props {
  transactions: Transaction[];
}

export function MonthlyComparisonChart({ transactions }: Props) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate previous month
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear -= 1;
    }

    // Get transactions for current and previous month
    const currentMonthTxs = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const prevMonthTxs = transactions.filter(t => {
      const date = new Date(t.date);
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });

    // Calculate totals
    const calculateTotals = (txs: Transaction[]) => {
      return txs.reduce(
        (acc, t) => {
          if (t.type === 0) {
            acc.income += t.amount;
          } else {
            acc.expense += t.amount;
          }
          return acc;
        },
        { income: 0, expense: 0 }
      );
    };

    const currentTotals = calculateTotals(currentMonthTxs);
    const prevTotals = calculateTotals(prevMonthTxs);

    const prevMonthName = new Date(prevYear, prevMonth, 1).toLocaleDateString('pt-BR', { month: 'short' });
    const currentMonthName = new Date(currentYear, currentMonth, 1).toLocaleDateString('pt-BR', { month: 'short' });

    return [
      {
        category: 'Receitas',
        [prevMonthName]: prevTotals.income,
        [currentMonthName]: currentTotals.income,
        type: 'income'
      },
      {
        category: 'Despesas',
        [prevMonthName]: prevTotals.expense,
        [currentMonthName]: currentTotals.expense,
        type: 'expense'
      },
      {
        category: 'Saldo',
        [prevMonthName]: prevTotals.income - prevTotals.expense,
        [currentMonthName]: currentTotals.income - currentTotals.expense,
        type: 'balance'
      }
    ];
  }, [transactions]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
        Sem dados para exibir
      </div>
    );
  }

  const prevMonthKey = Object.keys(data[0]).find(k => k !== 'category' && k !== 'type') || '';
  const currentMonthKey = Object.keys(data[0]).find(k => k !== 'category' && k !== 'type' && k !== prevMonthKey) || '';

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
        <XAxis
          dataKey="category"
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
            return `R$ ${value}`;
          }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => formatCurrency(value)}
          labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="rect"
        />
        <Bar dataKey={prevMonthKey} fill="#94a3b8" radius={[8, 8, 0, 0]} />
        <Bar dataKey={currentMonthKey} fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
