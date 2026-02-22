'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { expenseSplitsApi } from '@/lib/api';
import { Card, Button, EmptyState } from '@/components/ui';
import { SplitCard } from '@/components/splits/SplitCard';
import { CreateSplitModal } from '@/components/splits/CreateSplitModal';
import { Plus, Scissors } from 'lucide-react';

export default function SplitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: splits, isLoading } = useQuery({
    queryKey: ['expenseSplits'],
    queryFn: expenseSplitsApi.getAll,
  });

  const totalAmount = splits?.reduce((sum, s) => sum + s.totalAmount, 0) ?? 0;
  const pendingCount = splits?.filter(s => s.items.some(i => !i.isPaid)).length ?? 0;
  const settledCount = splits?.filter(s => s.items.every(i => i.isPaid)).length ?? 0;
  const pendingAmount = splits
    ?.flatMap(s => s.items)
    .filter(i => !i.isPaid)
    .reduce((sum, i) => sum + i.amount, 0) ?? 0;

  return (
    <PageContainer
      title="Divisao de Despesas"
      subtitle="Divida despesas entre membros da familia"
    >
      <div className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Total Dividido</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-600">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(pendingAmount)}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Pendente</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Em Aberto</p>
            </div>
          </Card>
          <Card>
            <div className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{settledCount}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">Quitados</p>
            </div>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex justify-end">
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nova Divisao
          </Button>
        </div>

        {/* Split List */}
        {isLoading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : splits && splits.length > 0 ? (
          <div className="grid gap-4">
            {splits.map((split) => (
              <SplitCard key={split.id} split={split} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Scissors}
            title="Nenhuma divisao de despesa"
            description="Crie uma divisao para compartilhar despesas entre membros da familia"
            action={{
              label: "Nova Divisao",
              onClick: () => setIsModalOpen(true)
            }}
          />
        )}
      </div>

      {isModalOpen && (
        <CreateSplitModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </PageContainer>
  );
}
