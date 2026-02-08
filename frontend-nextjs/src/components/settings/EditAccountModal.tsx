'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { accountsApi } from '@/lib/api';
import { UpdateAccountRequest, AccountDto } from '@/types';
import toast from 'react-hot-toast';

interface EditAccountModalProps {
  account: AccountDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditAccountModal({ account, isOpen, onClose }: EditAccountModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateAccountRequest>({
    defaultValues: {
      name: account.name,
      color: account.color || '#3b82f6',
      isActive: account.isActive,
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAccountRequest) => accountsApi.update(account.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      onClose();
      toast.success('Conta atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar conta.');
    },
  });

  const onSubmit = (data: UpdateAccountRequest) => {
    updateMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Conta">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Conta"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Cor"
          type="color"
          {...register('color')}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('isActive')}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Conta ativa</span>
        </label>

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
