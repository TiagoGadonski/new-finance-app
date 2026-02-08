'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { transactionsApi } from '@/lib/api';
import { UpdateTransactionRequest, TransactionDto, CategoryDto } from '@/types';
import toast from 'react-hot-toast';

interface EditTransactionModalProps {
  transaction: TransactionDto;
  categories?: CategoryDto[];
  isOpen: boolean;
  onClose: () => void;
}

export function EditTransactionModal({ transaction, categories, isOpen, onClose }: EditTransactionModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateTransactionRequest>({
    defaultValues: {
      categoryId: transaction.categoryId,
      amount: transaction.amount,
      description: transaction.description,
      date: new Date(transaction.date).toISOString().split('T')[0],
      isRecurring: transaction.isRecurring,
      tags: transaction.tags || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTransactionRequest) => transactionsApi.update(transaction.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onClose();
      toast.success('Transação atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar transação.');
    },
  });

  const onSubmit = (data: UpdateTransactionRequest) => {
    updateMutation.mutate({
      ...data,
      amount: Number(data.amount),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Transação">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Descrição"
          {...register('description', { required: 'Descrição é obrigatória' })}
          error={errors.description?.message}
        />

        <Input
          label="Valor"
          type="number"
          step="0.01"
          {...register('amount', { required: 'Valor é obrigatório', valueAsNumber: true })}
          error={errors.amount?.message}
        />

        <Input
          label="Data"
          type="date"
          {...register('date', { required: 'Data é obrigatória' })}
          error={errors.date?.message}
        />

        <Select
          label="Categoria"
          {...register('categoryId', { required: 'Categoria é obrigatória' })}
        >
          {categories?.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </Select>

        <Input
          label="Tags (opcional)"
          {...register('tags')}
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
