'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { budgetsApi } from '@/lib/api';
import { UpdateBudgetRequest, BudgetDto } from '@/types';
import toast from 'react-hot-toast';

interface EditBudgetModalProps {
  budget: BudgetDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditBudgetModal({ budget, isOpen, onClose }: EditBudgetModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateBudgetRequest>({
    defaultValues: {
      limit: budget.limit,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateBudgetRequest) => budgetsApi.update(budget.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      onClose();
      toast.success('Orçamento atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar orçamento.');
    },
  });

  const onSubmit = (data: UpdateBudgetRequest) => {
    updateMutation.mutate({
      limit: Number(data.limit),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Orçamento">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-800">
          Categoria: <strong>{budget.categoryName}</strong>
        </div>

        <Input
          label="Limite"
          type="number"
          step="0.01"
          {...register('limit', { required: 'Limite é obrigatório', valueAsNumber: true })}
          error={errors.limit?.message}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
