'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, Select } from '@/components/ui';
import { reportsApi } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/currency';

const COLORS = ['#3b82f6', '#10b981', '#f97316', '#a855f7', '#ec4899', '#eab308', '#14b8a6', '#6366f1', '#f43f5e', '#64748b'];

export function MonthlyReport() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: report, isLoading } = useQuery({
    queryKey: ['monthly-report', month, year],
    queryFn: () => reportsApi.getMonthlyReport(month, year),
  });

  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const categoryData = report?.expensesByCategory.map((c, i) => ({
    name: c.categoryName,
    value: c.amount,
    color: COLORS[i % COLORS.length],
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex gap-3">
        <Select value={String(month)} onChange={(e) => setMonth(Number(e.target.value))}>
          {monthNames.map((name, i) => (
            <option key={i} value={i + 1}>{name}</option>
          ))}
        </Select>
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
          {[year - 2, year - 1, year, year + 1].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'var(--muted-foreground)' }}>Carregando...</div>
      ) : report ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Receitas</span>
              </div>
              <p className="text-lg font-bold text-green-600">{formatCurrency(report.totalIncome)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingDown className="w-4 h-4 text-red-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Despesas</span>
              </div>
              <p className="text-lg font-bold text-red-600">{formatCurrency(report.totalExpenses)}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Saldo</span>
              </div>
              <p className={`text-lg font-bold ${report.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(report.balance)}
              </p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Percent className="w-4 h-4 text-purple-500" />
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Taxa de Poupança</span>
              </div>
              <p className="text-lg font-bold text-purple-600">{report.savingsRate.toFixed(1)}%</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-4">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Despesas por Categoria</h3>
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                      {categoryData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sem dados</p>
              )}
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Top 10 Despesas</h3>
              {report.topExpenses.length > 0 ? (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {report.topExpenses.map((exp, i) => (
                    <div key={i} className="flex items-center justify-between py-1">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{exp.description}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {exp.categoryName} • {new Date(exp.date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-red-600">{formatCurrency(exp.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--muted-foreground)' }}>Sem dados</p>
              )}
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
}
