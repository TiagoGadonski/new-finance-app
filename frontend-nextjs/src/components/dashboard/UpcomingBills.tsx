'use client';

import { memo } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui';
import Link from 'next/link';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextBillingDate: string;
  categoryName?: string;
  isActive: boolean;
}

interface Props {
  subscriptions: Subscription[];
  daysAhead?: number;
}

export const UpcomingBills = memo(function UpcomingBills({ subscriptions, daysAhead = 7 }: Props) {
  // Filter active subscriptions due in the next N days
  const upcomingBills = subscriptions
    .filter(sub => {
      if (!sub.isActive) return false;
      const nextBilling = new Date(sub.nextBillingDate);
      const daysUntil = differenceInDays(nextBilling, new Date());
      return daysUntil >= 0 && daysUntil <= daysAhead;
    })
    .sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime())
    .slice(0, 5); // Show max 5

  const totalUpcoming = upcomingBills.reduce((sum, bill) => sum + bill.amount, 0);

  if (upcomingBills.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Próximas Contas
          </h3>
          <Link
            href="/monthly-bills"
            className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
          >
            Ver assinaturas
          </Link>
        </div>
        <div className="text-center py-8" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
          <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma conta nos próximos {daysAhead} dias</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            Próximas Contas
          </h3>
          <p className="text-sm opacity-60 mt-1" style={{ color: 'var(--foreground)' }}>
            Total: {formatCurrency(totalUpcoming)}
          </p>
        </div>
        <Link
          href="/monthly-bills"
          className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
        >
          Ver todas
        </Link>
      </div>

      <div className="space-y-3">
        {upcomingBills.map((bill, index) => {
          const daysUntil = differenceInDays(new Date(bill.nextBillingDate), new Date());
          const isUrgent = daysUntil <= 2;

          return (
            <div
              key={bill.id}
              className="flex items-center justify-between p-3 rounded-lg transition-all duration-200 hover:scale-[1.02] animate-fadeIn"
              style={{
                backgroundColor: 'var(--background-secondary)',
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className={`p-2 rounded-lg ${isUrgent ? 'bg-rose-100 dark:bg-rose-900/20' : 'bg-emerald-100 dark:bg-emerald-900/20'}`}
                >
                  {isUrgent ? (
                    <AlertCircle className="w-5 h-5 text-rose-600" />
                  ) : (
                    <Calendar className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate" style={{ color: 'var(--foreground)' }}>
                    {bill.name}
                  </p>
                  <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                    {daysUntil === 0 && 'Hoje'}
                    {daysUntil === 1 && 'Amanhã'}
                    {daysUntil > 1 && `Em ${daysUntil} dias`}
                    {' • '}
                    {format(new Date(bill.nextBillingDate), "dd/MM", { locale: ptBR })}
                  </p>
                </div>
              </div>
              <div className="text-right ml-3">
                <p className={`font-bold ${isUrgent ? 'text-rose-600' : 'text-slate-900 dark:text-slate-100'}`}>
                  {formatCurrency(bill.amount)}
                </p>
                {bill.categoryName && (
                  <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                    {bill.categoryName}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
});
