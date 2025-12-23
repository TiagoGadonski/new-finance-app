'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Button, Alert } from '@/components/ui';
import { adminApi } from '@/lib/api';
import type { ChangeUserPasswordRequest, AdminUserDto } from '@/types/admin';

interface ChangePasswordModalProps {
  isOpen: boolean;
  user: AdminUserDto;
  onClose: () => void;
}

interface PasswordForm extends ChangeUserPasswordRequest {
  confirmPassword: string;
}

export function ChangePasswordModal({ isOpen, user, onClose }: ChangePasswordModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, reset } = useForm<PasswordForm>();

  const changePasswordMutation = useMutation({
    mutationFn: (data: ChangeUserPasswordRequest) =>
      adminApi.changeUserPassword(user.id, data),
    onSuccess: () => {
      setSuccess(true);
      reset();
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Falha ao alterar senha');
    },
  });

  const onSubmit = (data: PasswordForm) => {
    setError(null);
    changePasswordMutation.mutate({ newPassword: data.newPassword });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Alterar Senha" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">Senha alterada com sucesso!</Alert>}

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Alterando senha para: <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        <Input
          label="Nova Senha"
          type="password"
          {...register('newPassword', {
            required: 'Nova senha é obrigatória',
            minLength: {
              value: 6,
              message: 'A senha deve ter pelo menos 6 caracteres',
            },
          })}
          error={errors.newPassword?.message}
        />

        <Input
          label="Confirmar Senha"
          type="password"
          {...register('confirmPassword', {
            required: 'Confirmação de senha é obrigatória',
            validate: (value) =>
              value === watch('newPassword') || 'As senhas não coincidem',
          })}
          error={errors.confirmPassword?.message}
        />

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={changePasswordMutation.isPending || success}>
            {changePasswordMutation.isPending ? 'Alterando...' : 'Alterar Senha'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
