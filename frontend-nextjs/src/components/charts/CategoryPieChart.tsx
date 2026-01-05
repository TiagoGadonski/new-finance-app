'use client';

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { formatCurrency } from '@/lib/utils/currency';

interface Transaction {
  categoryName?: string;
  amount: number;
  type: number; // 0 = Income, 1 = Expense
}

interface Props {
  transactions: Transaction[];
  type?: 'income' | 'expense';
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // rose
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
];

export function CategoryPieChart({ transactions, type = 'expense' }: Props) {
  const data = useMemo(() => {
    if (!transactions || transactions.length === 0) return [];

    const targetType = type === 'income' ? 0 : 1;

    // Filter and group by category
    const categoryData = transactions
      .filter(t => t.type === targetType)
      .reduce((acc, transaction) => {
        const category = transaction.categoryName || 'Sem categoria';

        if (!acc[category]) {
          acc[category] = { name: category, value: 0 };
        }

        acc[category].value += transaction.amount;

        return acc;
      }, {} as Record<string, { name: string; value: number }>);

    // Convert to array and sort by value
    return Object.values(categoryData)
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [transactions, type]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-slate-500">
        Sem dados para exibir
      </div>
    );
  }

  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={(entry) => {
            const percent = ((entry.value / totalValue) * 100).toFixed(0);
            return `${entry.name}: ${percent}%`;
          }}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value: number | undefined) => value !== undefined ? formatCurrency(value) : ''}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
