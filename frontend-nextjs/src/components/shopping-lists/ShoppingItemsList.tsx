'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ShoppingItemDto, ItemPriority } from '@/types';
import { Badge, Button } from '@/components/ui';
import { formatCurrency } from '@/lib/utils/format';
import { Check, Edit, Trash2 } from 'lucide-react';
import { shoppingListsApi } from '@/lib/api';
import { EditItemModal } from './EditItemModal';

interface ShoppingItemsListProps {
  listId: string;
  items: ShoppingItemDto[];
}

export function ShoppingItemsList({ listId, items }: ShoppingItemsListProps) {
  const [editingItem, setEditingItem] = useState<ShoppingItemDto | null>(null);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (itemId: string) => shoppingListsApi.deleteItem(listId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
    },
  });

  const togglePurchasedMutation = useMutation({
    mutationFn: (item: ShoppingItemDto) =>
      item.isPurchased
        ? shoppingListsApi.updateItem(listId, item.id, { ...item, isPurchased: false })
        : shoppingListsApi.markItemPurchased(listId, item.id, {
            createTransaction: false,
            actualPrice: item.estimatedPrice,
          }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-list', listId] });
    },
  });

  const getPriorityBadge = (priority: ItemPriority) => {
    switch (priority) {
      case ItemPriority.Low:
        return <Badge variant="default">Baixa</Badge>;
      case ItemPriority.Medium:
        return <Badge variant="info">Média</Badge>;
      case ItemPriority.High:
        return <Badge variant="warning">Alta</Badge>;
      case ItemPriority.Urgent:
        return <Badge variant="danger">Urgente</Badge>;
    }
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Nenhum item adicionado ainda. Clique em "Adicionar Item" para começar.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-3"></th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Qtd
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Est.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preço Real
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <tr
                key={item.id}
                className={item.isPurchased ? 'bg-green-50' : ''}
              >
                <td className="px-6 py-4">
                  <button
                    onClick={() => togglePurchasedMutation.mutate(item)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      item.isPurchased
                        ? 'bg-green-600 border-green-600'
                        : 'border-gray-300 hover:border-green-600'
                    }`}
                  >
                    {item.isPurchased && <Check className="w-4 h-4 text-white" />}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <div className={`text-sm font-medium ${item.isPurchased ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {item.name}
                    </div>
                    {item.category && (
                      <div className="text-xs text-gray-500">{item.category}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(item.estimatedPrice)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.actualPrice ? formatCurrency(item.actualPrice) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(item.isPurchased ? item.totalActual : item.totalEstimated)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(item.priority)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingItem(item)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir este item?')) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingItem && (
        <EditItemModal
          listId={listId}
          item={editingItem}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </>
  );
}
