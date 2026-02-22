'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { UpdateShoppingListRequest, ShoppingListDto, ShoppingListStatus } from '@/types';

interface EditListModalProps {
  list: ShoppingListDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditListModal({ list, isOpen, onClose }: EditListModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateShoppingListRequest>({
    defaultValues: {
      name: list.name,
      description: list.description || '',
      targetDate: list.targetDate ? new Date(list.targetDate).toISOString().split('T')[0] : '',
      status: list.status,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateShoppingListRequest) => shoppingListsApi.updateList(list.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', list.id] });
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      onClose();
    },
  });

  const onSubmit = (data: UpdateShoppingListRequest) => {
    updateMutation.mutate({
      ...data,
      status: Number(data.status),
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Lista">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Lista"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            {...register('description')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
            rows={3}
          />
        </div>

        <Input
          label="Data Alvo (opcional)"
          type="date"
          {...register('targetDate')}
        />

        <Select
          label="Status"
          {...register('status')}
        >
          <option value={ShoppingListStatus.Planning}>Planejando</option>
          <option value={ShoppingListStatus.Active}>Ativa</option>
          <option value={ShoppingListStatus.Completed}>Concluída</option>
          <option value={ShoppingListStatus.Cancelled}>Cancelada</option>
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
