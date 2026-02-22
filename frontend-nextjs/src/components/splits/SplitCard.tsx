'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseSplitsApi } from '@/lib/api';
import { Card, Button } from '@/components/ui';
import { Trash2, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react';
import { ExpenseSplitDto } from '@/types';
import toast from 'react-hot-toast';

interface SplitCardProps {
  split: ExpenseSplitDto;
}

export function SplitCard({ split }: SplitCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();

  const markPaidMutation = useMutation({
    mutationFn: ({ splitId, itemId }: { splitId: string; itemId: string }) =>
      expenseSplitsApi.markPaid(splitId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseSplits'] });
      toast.success('Marcado como pago!');
    },
    onError: () => toast.error('Erro ao marcar como pago.'),
  });

  const deleteMutation = useMutation({
    mutationFn: expenseSplitsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseSplits'] });
      toast.success('Divisao excluida!');
    },
    onError: () => toast.error('Erro ao excluir divisao.'),
  });

  const handleDelete = () => {
    if (confirm('Tem certeza que deseja excluir esta divisao?')) {
      deleteMutation.mutate(split.id);
    }
  };

  const paidCount = split.items.filter(i => i.isPaid).length;
  const totalItems = split.items.length;
  const allPaid = paidCount === totalItems;
  const paidAmount = split.items.filter(i => i.isPaid).reduce((sum, i) => sum + i.amount, 0);

  return (
    <Card className={`hover:shadow-lg transition-shadow ${allPaid ? 'opacity-70' : ''}`}>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {split.description}
              </h3>
              {allPaid && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex-shrink-0">
                  Quitado
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(split.totalAmount)}
              </p>
              <span className="text-xs text-slate-500">
                {paidCount}/{totalItems} pagos
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              por @{split.createdByUsername} em {new Date(split.createdAt).toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
              <Trash2 className="w-4 h-4 text-rose-600" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${totalItems > 0 ? (paidCount / totalItems) * 100 : 0}%` }}
          />
        </div>

        {/* Expanded Items */}
        {isExpanded && (
          <div className="mt-4 space-y-2 border-t pt-4" style={{ borderColor: 'var(--border-color)' }}>
            {split.items.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  item.isPaid
                    ? 'bg-green-50 dark:bg-green-900/10'
                    : 'bg-slate-50 dark:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    item.isPaid
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}>
                    {item.isPaid ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                      @{item.username}
                    </p>
                    {item.isPaid && item.paidAt && (
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Pago em {new Date(item.paidAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.amount)}
                  </span>
                  {!item.isPaid && (
                    <Button
                      size="sm"
                      onClick={() => markPaidMutation.mutate({ splitId: split.id, itemId: item.id })}
                      disabled={markPaidMutation.isPending}
                    >
                      Pagar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
