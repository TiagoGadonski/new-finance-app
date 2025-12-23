'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { CreateShoppingItemRequest, ItemPriority } from '@/types';

interface AddItemModalProps {
  listId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddItemModal({ listId, isOpen, onClose }: AddItemModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateShoppingItemRequest>({
    defaultValues: {
      priority: ItemPriority.Medium,
      quantity: 1,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateShoppingItemRequest) => shoppingListsApi.createItem(listId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: CreateShoppingItemRequest) => {
    createMutation.mutate({
      ...data,
      priority: Number(data.priority),
      quantity: Number(data.quantity),
      estimatedPrice: Number(data.estimatedPrice),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Adicionar Item">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do Item"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
          placeholder="Ex: Arroz 5kg"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            min="1"
            {...register('quantity', { required: 'Quantidade é obrigatória', min: 1 })}
            error={errors.quantity?.message}
          />

          <Input
            label="Preço Estimado"
            type="number"
            step="0.01"
            min="0"
            {...register('estimatedPrice', { required: 'Preço é obrigatório', min: 0 })}
            error={errors.estimatedPrice?.message}
            placeholder="0.00"
          />
        </div>

        <Input
          label="Categoria (opcional)"
          {...register('category')}
          placeholder="Ex: Alimentos, Limpeza, Higiene"
        />

        <Select
          label="Prioridade"
          {...register('priority')}
        >
          <option value={ItemPriority.Low}>Baixa</option>
          <option value={ItemPriority.Medium}>Média</option>
          <option value={ItemPriority.High}>Alta</option>
          <option value={ItemPriority.Urgent}>Urgente</option>
        </Select>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adicionando...' : 'Adicionar Item'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
