'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { expenseSplitsApi } from '@/lib/api';
import { CreateExpenseSplitRequest, CreateExpenseSplitItemRequest } from '@/types';
import { Plus, Trash2, Users } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateSplitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSplitModal({ isOpen, onClose }: CreateSplitModalProps) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [items, setItems] = useState<{ username: string; amount: string }[]>([
    { username: '', amount: '' },
    { username: '', amount: '' },
  ]);

  const createMutation = useMutation({
    mutationFn: (data: CreateExpenseSplitRequest) => expenseSplitsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenseSplits'] });
      onClose();
      toast.success('Divisao criada com sucesso!');
    },
    onError: () => toast.error('Erro ao criar divisao.'),
  });

  const addItem = () => {
    setItems([...items, { username: '', amount: '' }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 2) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: 'username' | 'amount', value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const splitEqually = () => {
    const total = parseFloat(totalAmount);
    if (!total || items.length === 0) return;
    const perPerson = Math.round((total / items.length) * 100) / 100;
    const remainder = Math.round((total - perPerson * items.length) * 100) / 100;
    const newItems = items.map((item, i) => ({
      ...item,
      amount: (i === 0 ? perPerson + remainder : perPerson).toFixed(2),
    }));
    setItems(newItems);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = parseFloat(totalAmount);
    if (!total || !description.trim()) {
      toast.error('Preencha descricao e valor total.');
      return;
    }

    const validItems = items.filter(i => i.username.trim() && parseFloat(i.amount) > 0);
    if (validItems.length < 2) {
      toast.error('Adicione pelo menos 2 participantes com valor.');
      return;
    }

    const splitItems: CreateExpenseSplitItemRequest[] = validItems.map(i => ({
      username: i.username.trim(),
      amount: parseFloat(i.amount),
    }));

    createMutation.mutate({
      totalAmount: total,
      description: description.trim(),
      items: splitItems,
    });
  };

  const itemsTotal = items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
  const total = parseFloat(totalAmount) || 0;
  const diff = Math.round((total - itemsTotal) * 100) / 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nova Divisao de Despesa">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Descricao"
          placeholder="Ex: Jantar de aniversario"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <Input
          label="Valor Total"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={totalAmount}
          onChange={(e) => setTotalAmount(e.target.value)}
          required
        />

        {/* Participants */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              Participantes
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={splitEqually} disabled={!totalAmount}>
                <Users className="w-3 h-3 mr-1" />
                Dividir Igual
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={addItem}>
                <Plus className="w-3 h-3 mr-1" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="@username"
                  value={item.username}
                  onChange={(e) => updateItem(index, 'username', e.target.value)}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={item.amount}
                  onChange={(e) => updateItem(index, 'amount', e.target.value)}
                  className="w-28 rounded-lg border px-3 py-2 text-sm"
                  style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={items.length <= 2}
                  className="p-2 text-rose-500 hover:text-rose-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Balance indicator */}
          {total > 0 && (
            <div className={`mt-2 text-xs font-medium ${
              Math.abs(diff) < 0.01 ? 'text-green-600' : 'text-amber-600'
            }`}>
              Soma dos itens: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemsTotal)}
              {Math.abs(diff) >= 0.01 && (
                <span> (diferenca: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(diff)})</span>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Criando...' : 'Criar Divisao'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
