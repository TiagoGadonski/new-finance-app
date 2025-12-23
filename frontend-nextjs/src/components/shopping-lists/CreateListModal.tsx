'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { CreateShoppingListRequest } from '@/types';

interface CreateListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateListModal({ isOpen, onClose }: CreateListModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateShoppingListRequest>();

  const createMutation = useMutation({
    mutationFn: (data: CreateShoppingListRequest) => shoppingListsApi.createList(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
      reset();
      onClose();
    },
  });

  const onSubmit = (data: CreateShoppingListRequest) => {
    createMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Lista de Compras">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Lista"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
          placeholder="Ex: Mercado do mês"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição (opcional)
          </label>
          <textarea
            {...register('description')}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            rows={3}
            placeholder="Descrição da lista..."
          />
        </div>

        <Input
          label="Data Alvo (opcional)"
          type="date"
          {...register('targetDate')}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Criando...' : 'Criar Lista'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
