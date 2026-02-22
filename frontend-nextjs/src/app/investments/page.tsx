'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card, Button, LoadingSpinner, EmptyState, ConfirmDialog } from '@/components/ui';
import { InvestmentCard } from '@/components/investments/InvestmentCard';
import { AddInvestmentModal } from '@/components/investments/AddInvestmentModal';
import { AllocationChart } from '@/components/investments/AllocationChart';
import { investmentsApi } from '@/lib/api';
import { InvestmentDto } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';
import toast from 'react-hot-toast';

export default function InvestmentsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<InvestmentDto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: investments = [], isLoading } = useQuery({
    queryKey: ['investments'],
    queryFn: investmentsApi.getAll,
  });

  const { data: summary } = useQuery({
    queryKey: ['investment-summary'],
    queryFn: investmentsApi.getSummary,
  });

  const deleteMutation = useMutation({
    mutationFn: investmentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      toast.success('Investimento removido');
      setDeleteId(null);
    },
  });

  const handleEdit = (inv: InvestmentDto) => {
    setEditingInvestment(inv);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingInvestment(null);
  };

  if (isLoading) {
    return (
      <PageContainer title="Investimentos">
        <LoadingSpinner />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Investimentos" subtitle="Gerencie seu portfolio de investimentos">
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Investido</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(summary.totalInvested)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <PieChartIcon className="w-4 h-4 text-purple-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Valor Atual</span>
            </div>
            <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(summary.totalCurrentValue)}</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              {summary.totalGainLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Ganho/Perda</span>
            </div>
            <p className={`text-lg font-bold ${summary.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(summary.totalGainLoss)}
            </p>
            <p className={`text-xs ${summary.totalGainLossPercentage >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.totalGainLossPercentage.toFixed(2)}%
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-500" />
              <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Dividendos</span>
            </div>
            <p className="text-lg font-bold text-green-600">{formatCurrency(summary.totalDividends)}</p>
          </Card>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>Portfolio</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-1" />
          Novo Investimento
        </Button>
      </div>

      {investments.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="Nenhum investimento"
          description="Adicione seu primeiro investimento para acompanhar seu portfolio."
          action={{ label: "Novo Investimento", onClick: () => setShowModal(true) }}
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {investments.map(inv => (
            <InvestmentCard
              key={inv.id}
              investment={inv}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {summary && summary.allocation.length > 0 && (
        <div className="mt-6">
          <AllocationChart allocation={summary.allocation} />
        </div>
      )}

      {showModal && (
        <AddInvestmentModal
          isOpen={showModal}
          onClose={handleCloseModal}
          editingInvestment={editingInvestment}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteMutation.mutate(deleteId)}
        title="Remover Investimento"
        message="Tem certeza que deseja remover este investimento? Esta ação não pode ser desfeita."
      />
    </PageContainer>
  );
}
