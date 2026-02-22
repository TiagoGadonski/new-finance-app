'use client';

import { TrendingUp, TrendingDown, Pencil, Trash2 } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { InvestmentDto, InvestmentType } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';

const typeLabels: Record<number, string> = {
  [InvestmentType.Stock]: 'Ação',
  [InvestmentType.ETF]: 'ETF',
  [InvestmentType.Fund]: 'Fundo',
  [InvestmentType.Crypto]: 'Cripto',
  [InvestmentType.FixedIncome]: 'Renda Fixa',
  [InvestmentType.Other]: 'Outro',
};

const typeColors: Record<number, string> = {
  [InvestmentType.Stock]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  [InvestmentType.ETF]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  [InvestmentType.Fund]: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  [InvestmentType.Crypto]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  [InvestmentType.FixedIncome]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
  [InvestmentType.Other]: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300',
};

interface Props {
  investment: InvestmentDto;
  onEdit: (inv: InvestmentDto) => void;
  onDelete: (id: string) => void;
}

export function InvestmentCard({ investment, onEdit, onDelete }: Props) {
  const isPositive = investment.totalGainLoss >= 0;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold" style={{ color: 'var(--foreground)' }}>{investment.name}</h3>
            {investment.symbol && (
              <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--muted-foreground)' }}>
                {investment.symbol}
              </span>
            )}
          </div>
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${typeColors[investment.type]}`}>
            {typeLabels[investment.type]}
          </span>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(investment)}>
            <Pencil className="w-4 h-4 text-emerald-500" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(investment.id)}>
            <Trash2 className="w-4 h-4 text-red-400" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Quantidade</p>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{investment.quantity.toFixed(investment.type === InvestmentType.Crypto ? 8 : 2)}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Preço Médio</p>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{formatCurrency(investment.averagePrice)}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Preço Atual</p>
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{formatCurrency(investment.currentPrice)}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor Total</p>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(investment.totalValue)}</p>
        </div>
      </div>

      <div className={`flex items-center gap-1 mt-3 pt-3 border-t`} style={{ borderColor: 'var(--border-color)' }}>
        {isPositive ? (
          <TrendingUp className="w-4 h-4 text-green-500" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500" />
        )}
        <span className={`text-sm font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {formatCurrency(investment.totalGainLoss)} ({investment.gainLossPercentage.toFixed(2)}%)
        </span>
      </div>
    </Card>
  );
}
