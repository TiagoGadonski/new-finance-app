'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Card, Select } from '@/components/ui';
import { reportsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/currency';

export function PeriodComparison() {
  const now = new Date();
  const [month1, setMonth1] = useState(now.getMonth()); // previous month
  const [year1, setYear1] = useState(month1 === 0 ? now.getFullYear() - 1 : now.getFullYear());
  const [month2, setMonth2] = useState(now.getMonth() + 1);
  const [year2, setYear2] = useState(now.getFullYear());

  const { data: comparison, isLoading } = useQuery({
    queryKey: ['period-comparison', month1, year1, month2, year2],
    queryFn: () => reportsApi.getComparison(month1 || 12, year1, month2, year2),
    enabled: month1 > 0 && month2 > 0,
  });

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const ChangeIndicator = ({ value, percentage }: { value: number; percentage: number }) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${isNeutral ? 'text-gray-500' : isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isNeutral ? <Minus className="w-3 h-3" /> : isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
        {Math.abs(percentage).toFixed(1)}%
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Período 1</h4>
          <div className="flex gap-2">
            <Select value={String(month1)} onChange={(e) => setMonth1(Number(e.target.value))}>
              {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </Select>
            <Select value={String(year1)} onChange={(e) => setYear1(Number(e.target.value))}>
              {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
        </Card>
        <Card className="p-4">
          <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Período 2</h4>
          <div className="flex gap-2">
            <Select value={String(month2)} onChange={(e) => setMonth2(Number(e.target.value))}>
              {monthNames.map((name, i) => <option key={i} value={i + 1}>{name}</option>)}
            </Select>
            <Select value={String(year2)} onChange={(e) => setYear2(Number(e.target.value))}>
              {[now.getFullYear() - 2, now.getFullYear() - 1, now.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</div>
      ) : comparison ? (
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>Receitas</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 1</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(comparison.period1.totalIncome)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 2</span>
                <span className="text-sm font-medium text-green-600">{formatCurrency(comparison.period2.totalIncome)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Variação</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{formatCurrency(comparison.incomeChange)}</span>
                  <ChangeIndicator value={comparison.incomeChange} percentage={comparison.incomeChangePercentage} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>Despesas</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 1</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(comparison.period1.totalExpenses)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 2</span>
                <span className="text-sm font-medium text-red-600">{formatCurrency(comparison.period2.totalExpenses)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Variação</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{formatCurrency(comparison.expenseChange)}</span>
                  <ChangeIndicator value={-comparison.expenseChange} percentage={-comparison.expenseChangePercentage} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>Saldo</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 1</span>
                <span className={`text-sm font-medium ${comparison.period1.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.period1.balance)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período 2</span>
                <span className={`text-sm font-medium ${comparison.period2.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.period2.balance)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center" style={{ borderColor: 'var(--border-color)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Variação</span>
                <span className={`text-sm font-bold ${comparison.balanceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(comparison.balanceChange)}
                </span>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
