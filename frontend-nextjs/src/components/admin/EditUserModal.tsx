'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Alert } from '@/components/ui';
import { adminApi } from '@/lib/api';
import { Calculator } from 'lucide-react';
import type { UpdateUserRequest, AdminUserDto } from '@/types/admin';

interface EditUserModalProps {
  isOpen: boolean;
  user: AdminUserDto;
  onClose: () => void;
}

export function EditUserModal({ isOpen, user, onClose }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<UpdateUserRequest>({
    defaultValues: {
      name: user.name,
      role: user.role,
      isMeiEnabled: user.isMeiEnabled,
    },
  });

  useEffect(() => {
    reset({
      name: user.name,
      role: user.role,
      isMeiEnabled: user.isMeiEnabled,
    });
  }, [user, reset]);

  const isMeiEnabled = watch('isMeiEnabled');

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

        <div className="text-sm opacity-60 -mt-1" style={{ color: 'var(--foreground)' }}>
          @{user.username} · {user.familyName}
        </div>

        <Input
          label="Nome"
          {...register('name', { required: 'Nome é obrigatório' })}
          error={errors.name?.message}
        />

        <Select
          label="Função"
          {...register('role', { required: 'Função é obrigatória' })}
          error={errors.role?.message}
        >
          <option value="User">Usuário</option>
          <option value="Admin">Admin</option>
        </Select>

        {/* MEI toggle */}
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: 'var(--foreground)' }}>Módulos</p>
          <label
            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors"
            style={{
              borderColor: isMeiEnabled ? 'var(--emerald-600, #059669)' : 'var(--border-color)',
              backgroundColor: isMeiEnabled ? 'var(--background-secondary)' : 'transparent',
            }}
          >
            <input
              type="checkbox"
              {...register('isMeiEnabled')}
              className="accent-emerald-600 w-4 h-4"
            />
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>MEI / Trabalho</p>
                <p className="text-xs opacity-60" style={{ color: 'var(--foreground)' }}>
                  Acesso à calculadora de DAS, calendário de trabalho e relatórios PJ.
                </p>
              </div>
            </div>
          </label>
        </div>

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
