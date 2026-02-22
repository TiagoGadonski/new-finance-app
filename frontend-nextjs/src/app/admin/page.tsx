'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, Card, Badge, Alert, ListSkeleton } from '@/components/ui';
import { Plus, Trash2, Edit, Shield, User as UserIcon, Key } from 'lucide-react';
import { adminApi, authApi } from '@/lib/api';
import { CreateUserModal } from '@/components/admin/CreateUserModal';
import { EditUserModal } from '@/components/admin/EditUserModal';
import { ChangePasswordModal } from '@/components/admin/ChangePasswordModal';
import { DeleteUserModal } from '@/components/admin/DeleteUserModal';
import type { AdminUserDto } from '@/types/admin';

export default function AdminPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserDto | null>(null);
  const [changingPasswordFor, setChangingPasswordFor] = useState<AdminUserDto | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserDto | null>(null);
  const [mounted, setMounted] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(authApi.getUser());
  }, []);

  // Fetch all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getAllUsers,
    enabled: mounted,
  });

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'Admin';

  if (!mounted) {
    return (
      <PageContainer title="Painel Admin" subtitle="Gerenciar usuários e configurações do sistema">
        <Card>
          <div className="p-6">
            <ListSkeleton count={5} />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (!isAdmin) {
    return (
      <PageContainer title="Acesso Negado">
        <Alert variant="danger">
          Você não tem permissão para acessar esta página.
        </Alert>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer title="Painel Admin" subtitle="Gerenciar usuários e configurações do sistema">
        <Card>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <ListSkeleton count={5} />
          </div>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer title="Painel Admin">
        <Alert variant="danger">
          Falha ao carregar usuários. Por favor, tente novamente.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Painel Admin"
      subtitle="Gerenciar usuários e configurações do sistema"
    >
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold" style={{ color: 'var(--foreground)' }}>Usuários</h2>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Usuário
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead style={{ backgroundColor: 'var(--background-secondary)' }}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--foreground)', opacity: 0.7 }}>
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
                {users?.map((user) => (
                  <tr key={user.id} className="hover:opacity-80 transition-opacity">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                          <UserIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
                            {user.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm" style={{ color: 'var(--foreground)' }}>@{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={user.role === 'Admin' ? 'success' : 'default'}
                      >
                        {user.role === 'Admin' && <Shield className="w-3 h-3 mr-1 inline" />}
                        {user.role === 'Admin' ? 'Admin' : 'Usuário'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'var(--foreground)', opacity: 0.6 }}>
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setChangingPasswordFor(user)}
                        >
                          <Key className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingUser(user)}
                          disabled={user.id === currentUser.id}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>

      {/* Modals */}
      {createModalOpen && (
        <CreateUserModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {editingUser && (
        <EditUserModal
          isOpen={!!editingUser}
          user={editingUser}
          onClose={() => setEditingUser(null)}
        />
      )}

      {changingPasswordFor && (
        <ChangePasswordModal
          isOpen={!!changingPasswordFor}
          user={changingPasswordFor}
          onClose={() => setChangingPasswordFor(null)}
        />
      )}

      {deletingUser && (
        <DeleteUserModal
          isOpen={!!deletingUser}
          user={deletingUser}
          onClose={() => setDeletingUser(null)}
        />
      )}
    </PageContainer>
  );
}
