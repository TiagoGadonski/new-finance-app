'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit } from 'lucide-react';
import Link from 'next/link';
import { PageContainer } from '@/components/layout/PageContainer';
import { Button, LoadingSpinner, Alert, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';
import { shoppingListsApi } from '@/lib/api';
import { ShoppingListStatus } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { ShoppingItemsList } from '@/components/shopping-lists/ShoppingItemsList';
import { AddItemModal } from '@/components/shopping-lists/AddItemModal';
import { EditListModal } from '@/components/shopping-lists/EditListModal';

export default function ShoppingListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditListModalOpen, setIsEditListModalOpen] = useState(false);
  const listId = params.id as string;

  const { data: list, isLoading, error } = useQuery({
    queryKey: ['shopping-list', listId],
    queryFn: () => shoppingListsApi.getListById(listId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => shoppingListsApi.deleteList(listId),
    onSuccess: () => {
      router.push('/shopping-lists');
    },
  });

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingSpinner size="lg" className="py-12" />
      </PageContainer>
    );
  }

  if (error || !list) {
    return (
      <PageContainer>
        <Alert variant="danger" title="Erro ao carregar lista">
          Não foi possível carregar os detalhes da lista. Tente novamente mais tarde.
        </Alert>
      </PageContainer>
    );
  }

  const getStatusBadge = (status: ShoppingListStatus) => {
    switch (status) {
      case ShoppingListStatus.Planning:
        return <Badge variant="info">Planejando</Badge>;
      case ShoppingListStatus.Active:
        return <Badge variant="warning">Ativa</Badge>;
      case ShoppingListStatus.Completed:
        return <Badge variant="success">Concluída</Badge>;
      case ShoppingListStatus.Cancelled:
        return <Badge variant="default">Cancelada</Badge>;
    }
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <Link href="/shopping-lists">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            {getStatusBadge(list.status)}
          </div>
          {list.description && (
            <p className="text-gray-600">{list.description}</p>
          )}
          {list.targetDate && (
            <p className="text-sm text-gray-500 mt-2">
              Data alvo: {formatDate(list.targetDate)}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsEditListModalOpen(true)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta lista?')) {
                deleteMutation.mutate();
              }
            }}
          >
            Excluir Lista
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Total de Itens</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{list.totalItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Itens Comprados</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{list.purchasedItems}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Custo Estimado</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(list.totalEstimatedCost)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">Custo Real</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {formatCurrency(list.totalSpent)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>Progresso</span>
            <span>{list.completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-emerald-600 h-3 rounded-full transition-all"
              style={{ width: `${list.completionPercentage}%` }}
            />
          </div>
          {list.remainingBudget < 0 && (
            <p className="text-sm text-red-600 mt-2">
              Orçamento excedido em {formatCurrency(Math.abs(list.remainingBudget))}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens da Lista</CardTitle>
            <Button onClick={() => setIsAddItemModalOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ShoppingItemsList listId={listId} items={list.items} />
        </CardContent>
      </Card>

      <AddItemModal
        listId={listId}
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
      />

      <EditListModal
        list={list}
        isOpen={isEditListModalOpen}
        onClose={() => setIsEditListModalOpen(false)}
      />
    </PageContainer>
  );
}
