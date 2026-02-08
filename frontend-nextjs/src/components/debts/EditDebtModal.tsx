'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { debtsApi } from '@/lib/api';
import { UpdateDebtRequest, DebtDto } from '@/types';
import toast from 'react-hot-toast';

interface EditDebtModalProps {
  debt: DebtDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditDebtModal({ debt, isOpen, onClose }: EditDebtModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateDebtRequest>({
    defaultValues: {
      name: debt.name,
      remainingAmount: debt.remainingAmount,
      interestRate: debt.interestRate,
      minimumPayment: debt.minimumPayment,
      dueDate: debt.dueDate ? new Date(debt.dueDate).toISOString().split('T')[0] : '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDebtRequest) => debtsApi.update(debt.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      onClose();
      toast.success('Dívida atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar dívida.');
    },
  });

  const onSubmit = (data: UpdateDebtRequest) => {
    updateMutation.mutate({
      ...data,
      remainingAmount: Number(data.remainingAmount),
      interestRate: Number(data.interestRate),
      minimumPayment: Number(data.minimumPayment),
      dueDate: data.dueDate || null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Dívida">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Dívida"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Valor Restante"
          type="number"
          step="0.01"
          {...register('remainingAmount', { required: 'Valor é obrigatório', valueAsNumber: true })}
          error={errors.remainingAmount?.message}
        />

        <Input
          label="Taxa de Juros (% ao mês)"
          type="number"
          step="0.01"
          {...register('interestRate', { required: 'Taxa é obrigatória', valueAsNumber: true })}
          error={errors.interestRate?.message}
        />

        <Input
          label="Pagamento Mínimo Mensal"
          type="number"
          step="0.01"
          {...register('minimumPayment', { required: 'Pagamento mínimo é obrigatório', valueAsNumber: true })}
          error={errors.minimumPayment?.message}
        />

        <Input
          label="Data de Vencimento (opcional)"
          type="date"
          {...register('dueDate')}
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
