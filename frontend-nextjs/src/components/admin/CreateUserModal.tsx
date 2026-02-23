'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Input, Select, Button, Alert } from '@/components/ui';
import { adminApi, authApi } from '@/lib/api';
import { Users } from 'lucide-react';
import type { CreateUserRequest } from '@/types/admin';

interface FormValues extends CreateUserRequest {
  familyMode: 'mine' | 'new';
}

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateUserModal({ isOpen, onClose }: CreateUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [adminFamilyName, setAdminFamilyName] = useState('');

  useEffect(() => {
    const user = authApi.getUser();
    if (user?.familyName) setAdminFamilyName(user.familyName);
  }, []);

  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormValues>({
    defaultValues: { role: 'User', familyMode: 'mine' },
  });

  const familyMode = watch('familyMode');

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

  const onSubmit = (data: FormValues) => {
    setError(null);
    const { familyMode: _, newFamilyName, ...rest } = data;
    createMutation.mutate({
      ...rest,
      newFamilyName: familyMode === 'new' ? newFamilyName : undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Criar Novo Usuário" size="md">
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
            minLength: { value: 3, message: 'Mínimo 3 caracteres' },
            pattern: { value: /^[a-zA-Z0-9_-]+$/, message: 'Apenas letras, números, _ e -' },
          })}
          error={errors.username?.message}
        />

        <Input
          label="Senha"
          type="password"
          {...register('password', {
            required: 'Senha é obrigatória',
            minLength: { value: 8, message: 'Mínimo 8 caracteres' },
            pattern: {
              value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/,
              message: 'Deve conter maiúscula, minúscula, número e caractere especial',
            },
          })}
          error={errors.password?.message}
        />

        <Select
          label="Função"
          {...register('role', { required: true })}
          error={errors.role?.message}
        >
          <option value="User">Usuário</option>
          <option value="Admin">Admin</option>
        </Select>

        {/* Family selection */}
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Família</p>
          <div className="space-y-2">
            <label className="flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors"
              style={{
                borderColor: familyMode === 'mine' ? 'var(--emerald-600, #059669)' : 'var(--border-color)',
                backgroundColor: familyMode === 'mine' ? 'var(--background-secondary)' : 'transparent',
              }}>
              <input type="radio" value="mine" {...register('familyMode')} className="mt-0.5 accent-emerald-600" />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Minha família — <span className="text-emerald-600">{adminFamilyName}</span>
                </p>
                <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                  Compartilha todas as transações, contas e dados com você.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg cursor-pointer border transition-colors"
              style={{
                borderColor: familyMode === 'new' ? 'var(--emerald-600, #059669)' : 'var(--border-color)',
                backgroundColor: familyMode === 'new' ? 'var(--background-secondary)' : 'transparent',
              }}>
              <input type="radio" value="new" {...register('familyMode')} className="mt-0.5 accent-emerald-600" />
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                  Nova família independente
                </p>
                <p className="text-xs opacity-60 mt-0.5" style={{ color: 'var(--foreground)' }}>
                  Dados completamente separados. Ideal para parentes ou outras pessoas.
                </p>
                {familyMode === 'new' && (
                  <Input
                    className="mt-2"
                    placeholder="Nome da família (ex: Pais, Samuel e Joanita)"
                    {...register('newFamilyName', {
                      required: familyMode === 'new' ? 'Nome da família é obrigatório' : false,
                    })}
                    error={errors.newFamilyName?.message}
                  />
                )}
              </div>
            </label>
          </div>
        </div>

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
