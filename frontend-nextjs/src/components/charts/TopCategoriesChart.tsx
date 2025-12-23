'use client';

import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface Transaction {
  date: string;
  amount: number;
  type: number;
  categoryName?: string;
}

interface Props {
  transactions: Transaction[];
  limit?: number;
}

const COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#84cc16', // lime-500
];

export function TopCategoriesChart({ transactions, limit = 5 }: Props) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    // Get current month transactions (expenses only)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    const currentMonthExpenses = transactions.filter(t => {
      const txDate = new Date(t.date);
      return (
        t.type === 1 && // Expense
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear
      );
    });

    // Group by category
    const categoryTotals: Record<string, number> = {};
    currentMonthExpenses.forEach(transaction => {
      const category = transaction.categoryName || 'Sem Categoria';
      categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
    });

    // Convert to array and sort by amount
    return Object.entries(categoryTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, limit);
  }, [transactions, limit]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px]" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
        Sem despesas no mês atual
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" horizontal={true} vertical={false} />
        <XAxis
          type="number"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          tickFormatter={(value) => {
            if (value >= 1000) {
              return `R$ ${(value / 1000).toFixed(1)}k`;
            }
            return `R$ ${value}`;
          }}
        />
        <YAxis
          type="category"
          dataKey="name"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          width={70}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number) => [formatCurrency(value), 'Total']}
          labelStyle={{ color: 'var(--foreground)', fontWeight: 600 }}
          cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }}
        />
        <Bar dataKey="total" radius={[0, 8, 8, 0]}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
