'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { goalsApi } from '@/lib/api';
import { UpdateGoalRequest, GoalDto, GoalStatus } from '@/types';
import toast from 'react-hot-toast';

interface EditGoalModalProps {
  goal: GoalDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditGoalModal({ goal, isOpen, onClose }: EditGoalModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateGoalRequest>({
    defaultValues: {
      name: goal.name,
      targetAmount: goal.targetAmount,
      currentAmount: goal.currentAmount,
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      status: goal.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateGoalRequest) => goalsApi.update(goal.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['goals'] });
      onClose();
      toast.success('Meta atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar meta.');
    },
  });

  const onSubmit = (data: UpdateGoalRequest) => {
    updateMutation.mutate({
      ...data,
      targetAmount: Number(data.targetAmount),
      currentAmount: Number(data.currentAmount),
      status: Number(data.status),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Meta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Meta"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Valor Alvo"
          type="number"
          step="0.01"
          {...register('targetAmount', { required: 'Valor alvo é obrigatório', valueAsNumber: true })}
          error={errors.targetAmount?.message}
        />

        <Input
          label="Valor Atual"
          type="number"
          step="0.01"
          {...register('currentAmount', { required: 'Valor atual é obrigatório', valueAsNumber: true })}
          error={errors.currentAmount?.message}
        />

        <Input
          label="Data Alvo"
          type="date"
          {...register('targetDate', { required: 'Data é obrigatória' })}
          error={errors.targetDate?.message}
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
