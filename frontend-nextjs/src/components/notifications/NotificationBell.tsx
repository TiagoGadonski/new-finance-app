'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionsApi, budgetsApi, debtsApi } from '@/lib/api';
import { clsx } from 'clsx';
import { formatCurrency } from '@/lib/utils/currency';

interface Notification {
  id: string;
  type: 'subscription' | 'budget' | 'debt' | 'goal';
  severity: 'info' | 'warning' | 'danger';
  message: string;
  date?: Date;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const { data: subscriptions } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: subscriptionsApi.getAll,
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const { data: budgets } = useQuery({
    queryKey: ['budgets', currentMonth, currentYear],
    queryFn: () => budgetsApi.getConsolidated(currentMonth, currentYear),
  });

  const { data: debts } = useQuery({
    queryKey: ['debts'],
    queryFn: debtsApi.getAll,
  });

  useEffect(() => {
    const newNotifications: Notification[] = [];

    // Check subscriptions due soon
    if (subscriptions) {
      const today = new Date();
      const threeDaysFromNow = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

      subscriptions.forEach(sub => {
        if (sub.nextBillingDate && sub.isActive) {
          const billingDate = new Date(sub.nextBillingDate);
          if (billingDate >= today && billingDate <= threeDaysFromNow) {
            const daysUntil = Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `sub-${sub.id}`,
              type: 'subscription',
              severity: daysUntil === 0 ? 'danger' : 'warning',
              message: `${sub.name} vence ${daysUntil === 0 ? 'hoje' : `em ${daysUntil} dia(s)`} - ${formatCurrency(sub.amount)}`,
              date: billingDate,
            });
          }
        }
      });
    }

    // Check budgets exceeded
    if (budgets?.budgets) {
      budgets.budgets.forEach(budget => {
        const percentUsed = (budget.spent / budget.limit) * 100;
        if (percentUsed >= 80) {
          newNotifications.push({
            id: `budget-${budget.categoryId}`,
            type: 'budget',
            severity: percentUsed >= 100 ? 'danger' : 'warning',
            message: `Orçamento de ${budget.categoryName}: ${percentUsed.toFixed(0)}% utilizado (${formatCurrency(budget.spent)} de ${formatCurrency(budget.limit)})`,
          });
        }
      });
    }

    // Check debts with due dates
    if (debts) {
      debts.forEach(debt => {
        if (debt.dueDate) {
          const today = new Date();
          const dueDate = new Date(debt.dueDate);
          const fiveDaysFromNow = new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000);

          if (dueDate >= today && dueDate <= fiveDaysFromNow) {
            const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            newNotifications.push({
              id: `debt-${debt.id}`,
              type: 'debt',
              severity: daysUntil <= 1 ? 'danger' : 'warning',
              message: `Dívida "${debt.name}" vence ${daysUntil === 0 ? 'hoje' : `em ${daysUntil} dia(s)`} - ${formatCurrency(debt.minimumPayment)} (pagamento mínimo)`,
              date: dueDate,
            });
          }
        }
      });
    }

    setNotifications(newNotifications);
  }, [subscriptions, budgets, debts]);

  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Notificações"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                Notificações {unreadCount > 0 && `(${unreadCount})`}
              </h3>
            </div>

            <div className="overflow-y-auto flex-1">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Bell className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={clsx(
                        'p-4 hover:bg-slate-50 transition-colors',
                        notification.severity === 'danger' && 'border-l-4 border-rose-500',
                        notification.severity === 'warning' && 'border-l-4 border-amber-500',
                        notification.severity === 'info' && 'border-l-4 border-blue-500'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={clsx(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          notification.severity === 'danger' && 'bg-rose-500',
                          notification.severity === 'warning' && 'bg-amber-500',
                          notification.severity === 'info' && 'bg-blue-500'
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-slate-900">{notification.message}</p>
                          {notification.date && (
                            <p className="text-xs text-slate-500 mt-1">
                              {notification.date.toLocaleDateString('pt-BR')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
