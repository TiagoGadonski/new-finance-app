'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { categoriesApi } from '@/lib/api';
import { UpdateCategoryRequest, CategoryDto } from '@/types';
import toast from 'react-hot-toast';

interface EditCategoryModalProps {
  category: CategoryDto;
  isOpen: boolean;
  onClose: () => void;
}

export function EditCategoryModal({ category, isOpen, onClose }: EditCategoryModalProps) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors } } = useForm<UpdateCategoryRequest>({
    defaultValues: {
      name: category.name,
      icon: category.icon || '',
      color: category.color || '#3b82f6',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateCategoryRequest) => categoriesApi.update(category.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria.');
    },
  });

  const onSubmit = (data: UpdateCategoryRequest) => {
    updateMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Categoria">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome da Categoria"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Ícone (emoji)"
          {...register('icon')}
          maxLength={2}
        />

        <Input
          label="Cor"
          type="color"
          {...register('color')}
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
