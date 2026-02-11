'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from '@/components/ui';
import { InvestmentAllocationDto, InvestmentType } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';

const typeLabels: Record<number, string> = {
  [InvestmentType.Stock]: 'Ações',
  [InvestmentType.ETF]: 'ETFs',
  [InvestmentType.Fund]: 'Fundos',
  [InvestmentType.Crypto]: 'Cripto',
  [InvestmentType.FixedIncome]: 'Renda Fixa',
  [InvestmentType.Other]: 'Outros',
};

const COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f97316', '#14b8a6', '#64748b'];

interface Props {
  allocation: InvestmentAllocationDto[];
}

export function AllocationChart({ allocation }: Props) {
  const data = allocation.map((a, i) => ({
    name: typeLabels[a.type] || 'Outro',
    value: a.value,
    percentage: a.percentage,
    color: COLORS[i % COLORS.length],
  }));

  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Alocação por Tipo</h3>
        <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sem dados</p>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Alocação por Tipo</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ payload }: any) => `${payload?.percentage?.toFixed(1) || '0'}%`}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}
