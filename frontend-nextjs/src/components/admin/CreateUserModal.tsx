'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Alert } from '@/components/ui';
import { adminApi, authApi } from '@/lib/api';
import { Users } from 'lucide-react';
import type { CreateUserRequest } from '@/types/admin';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState<string>('');

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.familyName) setFamilyName(user.familyName);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateUserRequest>({
    defaultValues: {
      role: 'User',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserRequest) => adminApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Falha ao criar usuário');
    },
  });

  const onSubmit = (data: CreateUserRequest) => {
    setError(null);
    createMutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Usuário" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Family info banner */}
        <div className="flex items-start gap-3 rounded-lg p-3 text-sm" style={{ backgroundColor: 'var(--background-secondary)' }}>
          <Users className="w-4 h-4 mt-0.5 text-emerald-600 flex-shrink-0" />
          <div style={{ color: 'var(--foreground)' }}>
            <span className="font-medium">Família: {familyName || '—'}</span>
            <p className="opacity-70 mt-0.5">
              Este usuário será adicionado à sua família e terá acesso a todos os dados compartilhados (contas, transações, metas, etc).
            </p>
          </div>
        </div>

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

        <Input
          label="Senha"
          type="password"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: {
              value: 8,
              message: 'A senha deve ter pelo menos 8 caracteres',
            },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
              message: 'Deve conter maiúscula, minúscula, número e caractere especial',
            },
          })}
          error={errors.password?.message}
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando...' : 'Criar Usuário'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
