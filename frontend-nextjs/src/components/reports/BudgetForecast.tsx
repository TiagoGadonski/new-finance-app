'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Cell,
} from 'recharts';
import { budgetForecastApi } from '@/lib/api';
import { MonthForecastDto } from '@/types';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Wallet } from 'lucide-react';

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SurplusBar({ entry }: { entry: MonthForecastDto }) {
  const positive = entry.surplus >= 0;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold ${
      positive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
               : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
    }`}>
      {positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
      {formatCurrency(entry.surplus)}
    </div>
  );
}

export function BudgetForecast() {
  const [months, setMonths] = useState(6);
  const [initialBalance, setInitialBalance] = useState<string>('');

  const initBal = initialBalance !== '' ? parseFloat(initialBalance) : undefined;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['budget-forecast', months, initBal],
    queryFn: () => budgetForecastApi.getForecast(months, initBal),
  });

  const chartData = data?.months.map(m => ({
    ...m,
    surplusAbs: Math.abs(m.surplus),
    isPositive: m.surplus >= 0,
  })) ?? [];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Período</label>
          <div className="flex gap-1">
            {[3, 6, 12].map(m => (
              <button
                key={m}
                onClick={() => setMonths(m)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  months === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {m} meses
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">
            Saldo inicial (opcional)
          </label>
          <input
            type="number"
            value={initialBalance}
            onChange={e => setInitialBalance(e.target.value)}
            placeholder="R$ 0,00"
            className="w-36 px-3 py-1.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          Calculando projeção...
        </div>
      )}

      {isError && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Erro ao carregar a projeção. Verifique se há renda recorrente cadastrada.
        </div>
      )}

      {data && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Renda mensal</p>
              <p className="text-lg font-bold text-emerald-600">{formatCurrency(data.monthlyIncome)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <p className="text-xs text-muted-foreground mb-1">Fixos recorrentes</p>
              <p className="text-lg font-bold">{formatCurrency(data.recurringFixedTotal)}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4 col-span-2 sm:col-span-1">
              <p className="text-xs text-muted-foreground mb-1">Sobra no 1º mês</p>
              {data.months[0] && (
                <p className={`text-lg font-bold ${data.months[0].surplus >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {formatCurrency(data.months[0].surplus)}
                </p>
              )}
            </div>
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="text-sm font-semibold mb-4">Sobra mensal projetada</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `R$${(v/1000).toFixed(1)}k`} />
                <Tooltip
                  formatter={(_value: unknown, _name: unknown, props: { payload?: { surplus?: number } }) => {
                    const surplus = props.payload?.surplus ?? 0;
                    return [formatCurrency(surplus), 'Sobra'];
                  }}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeDasharray="4 4" />
                <Bar dataKey="surplusAbs" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={index}
                      fill={entry.isPositive ? '#10b981' : '#ef4444'}
                      fillOpacity={0.85}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Month-by-month table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground">Mês</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Renda</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Fixos</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Parcelas</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Total saída</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Sobra</th>
                    <th className="text-right px-3 py-3 font-medium text-muted-foreground">Saldo acum.</th>
                    <th className="px-3 py-3 font-medium text-muted-foreground">Encerra</th>
                  </tr>
                </thead>
                <tbody>
                  {data.months.map((m, idx) => (
                    <tr key={idx} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{m.month}</td>
                      <td className="px-3 py-3 text-right text-emerald-600 font-medium">
                        {formatCurrency(m.income)}
                      </td>
                      <td className="px-3 py-3 text-right">{formatCurrency(m.fixedExpenses)}</td>
                      <td className="px-3 py-3 text-right">
                        {m.debtInstallments > 0 ? (
                          <span className="text-amber-600 font-medium">{formatCurrency(m.debtInstallments)}</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-right font-medium">{formatCurrency(m.total)}</td>
                      <td className="px-3 py-3 text-right">
                        <SurplusBar entry={m} />
                      </td>
                      <td className={`px-3 py-3 text-right font-semibold ${
                        m.accumulatedBalance >= 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {formatCurrency(m.accumulatedBalance)}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {m.endingThisMonth.map((name, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              {name}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {data.monthlyIncome === 0 && (
            <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800 text-sm text-amber-800 dark:text-amber-300">
              <Wallet className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Nenhuma renda recorrente cadastrada</p>
                <p className="text-xs mt-0.5">
                  Acesse <strong>Contas do Mês → Renda Recorrente</strong> para adicionar sua renda mensal e ver a projeção real.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
