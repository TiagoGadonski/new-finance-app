'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Alert } from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { UpdateUserRequest, AdminUserDto } from '@/types/admin';

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUserDto;
  onClose: () => void;
}

export function EditUserModal({ isOpen, user, onClose }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<UpdateUserRequest>({
    defaultValues: {
      name: user.name,
      username: user.username,
      role: user.role,
    },
  });

  useEffect(() => {
    reset({
      name: user.name,
      username: user.username,
      role: user.role,
    });
  }, [user, reset]);

  const updateMutation = useMutation({
    mutationFn: (data: UpdateUserRequest) => adminApi.updateUser(user.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Falha ao atualizar usuário');
    },
  });

  const onSubmit = (data: UpdateUserRequest) => {
    setError(null);
    updateMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Usuário" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <Input
          label="Nome"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Input
          label="Usuário"
          type="text"
          {...register('username', {
            required: 'Usuário é obrigatório',
            minLength: {
              value: 3,
              message: 'Usuário deve ter no mínimo 3 caracteres',
            },
            pattern: {
              value: /^[a-zA-Z0-9_-]+$/,
              message: 'Usuário pode conter apenas letras, números, _ e -',
            },
          })}
          error={errors.username?.message}
        />

        <Select
          label="Função"
          {...register('role', { required: 'Função é obrigatória' })}
          error={errors.role?.message}
        >
          <option value="User">Usuário</option>
          <option value="Admin">Admin</option>
        </Select>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
