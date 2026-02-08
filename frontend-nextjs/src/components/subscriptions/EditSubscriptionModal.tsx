'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { subscriptionsApi } from '@/lib/api';
import { UpdateSubscriptionRequest, SubscriptionDto, SubscriptionStatus } from '@/types';
import toast from 'react-hot-toast';

interface EditSubscriptionModalProps {
  subscription: SubscriptionDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditSubscriptionModal({ subscription, isOpen, onClose }: EditSubscriptionModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateSubscriptionRequest>({
    defaultValues: {
      name: subscription.name,
      amount: subscription.amount,
      billingDay: subscription.billingDay,
      status: subscription.isActive ? SubscriptionStatus.Active : SubscriptionStatus.Paused,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateSubscriptionRequest) => subscriptionsApi.update(subscription.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      onClose();
      toast.success('Assinatura atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar assinatura.');
    },
  });

  const onSubmit = (data: UpdateSubscriptionRequest) => {
    updateMutation.mutate({
      ...data,
      amount: Number(data.amount),
      billingDay: Number(data.billingDay),
      status: Number(data.status),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Assinatura">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Valor Mensal"
          type="number"
          step="0.01"
          {...register('amount', { required: 'Valor é obrigatório', valueAsNumber: true })}
          error={errors.amount?.message}
        />

        <Input
          label="Dia da Cobrança"
          type="number"
          min={1}
          max={28}
          {...register('billingDay', { required: 'Dia é obrigatório', valueAsNumber: true })}
          error={errors.billingDay?.message}
        />

        <Select
          label="Status"
          {...register('status')}
        >
          <option value={SubscriptionStatus.Active}>Ativa</option>
          <option value={SubscriptionStatus.Paused}>Pausada</option>
          <option value={SubscriptionStatus.Cancelled}>Cancelada</option>
        </Select>

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
