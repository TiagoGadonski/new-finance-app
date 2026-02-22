'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, Select } from '@/components/ui';
import { reportsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/currency';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

export function CashFlowChart() {
  const [months, setMonths] = useState(3);

  const { data: forecast, isLoading } = useQuery({
    queryKey: ['cashflow', months],
    queryFn: () => reportsApi.getCashFlow(months),
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Projeção para:</span>
        <Select value={String(months)} onChange={(e) => setMonths(Number(e.target.value))}>
          <option value="1">1 mês</option>
          <option value="3">3 meses</option>
          <option value="6">6 meses</option>
          <option value="12">12 meses</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</div>
      ) : forecast ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Saldo Projetado</span>
              </div>
              <p className={`text-lg font-bold ${forecast.projectedBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(forecast.projectedBalance)}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-orange-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Despesas Fixas/mês</span>
              </div>
              <p className="text-lg font-bold text-orange-600">{formatCurrency(forecast.monthlyFixedExpenses)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Média Receita/mês</span>
              </div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(forecast.averageMonthlyIncome)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Média Despesa/mês</span>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(forecast.averageMonthlyExpenses)}</p>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Projeção de Saldo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={forecast.points}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </>
      ) : null}
    </div>
  );
}
