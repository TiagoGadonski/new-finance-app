'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tantml:react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { UpdateShoppingItemRequest, ItemPriority, ShoppingItemDto } from '@/types';

interface EditItemModalProps {
  listId: string;
  item: ShoppingItemDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditItemModal({ listId, item, isOpen, onClose }: EditItemModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateShoppingItemRequest>({
    defaultValues: {
      name: item.name,
      quantity: item.quantity,
      estimatedPrice: item.estimatedPrice,
      actualPrice: item.actualPrice || undefined,
      category: item.category || '',
      priority: item.priority,
      isPurchased: item.isPurchased,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateShoppingItemRequest) => shoppingListsApi.updateItem(listId, item.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
      onClose();
    },
  });

  const onSubmit = (data: UpdateShoppingItemRequest) => {
    updateMutation.mutate({
      ...data,
      priority: Number(data.priority),
      quantity: Number(data.quantity),
      estimatedPrice: Number(data.estimatedPrice),
      actualPrice: data.actualPrice ? Number(data.actualPrice) : null,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Item">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome do Item"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
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
          />
        </div>

        <Input
          label="Preço Real (opcional)"
          type="number"
          step="0.01"
          min="0"
          {...register('actualPrice')}
          placeholder="Deixe em branco se não comprado"
        />

        <Input
          label="Categoria (opcional)"
          {...register('category')}
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

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPurchased"
            {...register('isPurchased')}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPurchased" className="ml-2 block text-sm text-gray-900">
            Marcar como comprado
          </label>
        </div>

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
