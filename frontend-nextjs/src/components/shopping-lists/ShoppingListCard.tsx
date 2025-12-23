import Link from 'next/link';
import { ShoppingListDto, ShoppingListStatus } from '@/types';
import { Card, CardContent, Badge, Button } from '@/components/ui';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Calendar, ShoppingCart, Trash2, CheckCircle } from 'lucide-react';

interface ShoppingListCardProps {
  list: ShoppingListDto;
  onDelete: (id: string) => void;
}

export function ShoppingListCard({ list, onDelete }: ShoppingListCardProps) {
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
      default:
        return null;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <Link href={`/shopping-lists/${list.id}`} className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
              {list.name}
            </h3>
          </Link>
          {getStatusBadge(list.status)}
        </div>

        {list.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {list.description}
          </p>
        )}

        <div className="space-y-3 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <ShoppingCart className="w-4 h-4 mr-2" />
            <span>
              {list.purchasedItems} de {list.totalItems} itens comprados
            </span>
          </div>

          {list.targetDate && (
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Data alvo: {formatDate(list.targetDate)}</span>
            </div>
          )}

          <div className="flex items-center text-sm text-gray-600">
            <CheckCircle className="w-4 h-4 mr-2" />
            <span>{list.completionPercentage.toFixed(0)}% completo</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${list.completionPercentage}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="text-xs text-gray-600">Estimado</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(list.totalEstimatedCost)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">Gasto</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatCurrency(list.totalSpent)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <Link href={`/shopping-lists/${list.id}`}>
            <Button variant="primary" size="sm">
              Ver Detalhes
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (confirm('Tem certeza que deseja excluir esta lista?')) {
                onDelete(list.id);
              }
            }}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
