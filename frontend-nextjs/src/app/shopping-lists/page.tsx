'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart } from 'lucide-react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, EmptyState, ListSkeleton, Alert } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { ShoppingListCard } from '@/components/shopping-lists/ShoppingListCard';
import { CreateListModal } from '@/components/shopping-lists/CreateListModal';

export default function ShoppingListsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: lists, isLoading, error } = useQuery({
    queryKey: ['shopping-lists'],
    queryFn: () => shoppingListsApi.getAllLists(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => shoppingListsApi.deleteList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-lists'] });
    },
  });

  if (isLoading) {
    return (
      <PageContainer title="Listas de Compras" description="Gerencie suas listas de compras e acompanhe orçamentos">
        <div className="space-y-6">
          <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
            <ListSkeleton count={1} />
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="danger" title="Erro ao carregar listas">
          Não foi possível carregar as listas de compras. Tente novamente mais tarde.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="Listas de Compras"
      description="Gerencie suas listas de compras e acompanhe orçamentos"
    >
      <div className="mb-6">
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="w-5 h-5 mr-2" />
          Nova Lista
        </Button>
      </div>

      {lists && lists.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <ShoppingListCard
              key={list.id}
              list={list}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={ShoppingCart}
          title="Nenhuma lista de compras"
          description="Crie sua primeira lista de compras para organizar suas compras e controlar orçamentos"
          action={{
            label: "Nova Lista",
            onClick: () => setIsCreateModalOpen(true)
          }}
        />
      )}

      <CreateListModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </PageContainer>
  );
}
