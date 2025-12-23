'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Alert } from '@/components/ui';
import { AlertTriangle } from 'lucide-react';
import { adminApi, authApi } from '@/lib/api';
import type { AdminUserDto } from '@/types/admin';

interface DeleteUserModalProps {
  isOpen: boolean;
  user: AdminUserDto;
  onClose: () => void;
}

export function DeleteUserModal({ isOpen, user, onClose }: DeleteUserModalProps) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const currentUser = authApi.getUser();

  const deleteMutation = useMutation({
    mutationFn: () => adminApi.deleteUser(user.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      onClose();
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Falha ao deletar usuário');
    },
  });

  const handleDelete = () => {
    setError(null);
    deleteMutation.mutate();
  };

  const isOwnAccount = currentUser?.id === user.id;
  const isAdmin = user.role === 'Admin';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Deletar Usuário" size="md">
      <div className="space-y-4">
        {error && <Alert variant="danger">{error}</Alert>}

        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-yellow-900 mb-1">Atenção!</h4>
            <p className="text-sm text-yellow-700">
              Esta ação não pode ser desfeita. Todos os dados deste usuário serão permanentemente deletados.
            </p>
          </div>
        </div>

        {isOwnAccount && (
          <Alert variant="danger">
            Você não pode deletar sua própria conta enquanto está logado.
          </Alert>
        )}

        {isAdmin && !isOwnAccount && (
          <Alert variant="warning">
            Este usuário é um administrador. Certifique-se de que há outro administrador ativo no sistema.
          </Alert>
        )}

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informações do Usuário</h4>
          <dl className="space-y-1 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Nome:</dt>
              <dd className="font-medium text-gray-900">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Email:</dt>
              <dd className="font-medium text-gray-900">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Função:</dt>
              <dd className="font-medium text-gray-900">
                {user.role === 'Admin' ? 'Admin' : 'Usuário'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={deleteMutation.isPending || isOwnAccount}
          >
            {deleteMutation.isPending ? 'Deletando...' : 'Deletar Usuário'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
