'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Play, Pencil, Trash2, Plus } from 'lucide-react';
import { Modal, Button, Input, Select } from '@/components/ui';
import { transactionTemplatesApi, accountsApi, categoriesApi } from '@/lib/api';
import { TransactionTemplateDto, CreateTransactionTemplateRequest, TransactionType } from '@/types';
import toast from 'react-hot-toast';

interface TemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (template: TransactionTemplateDto) => void;
}

export function TemplatesModal({ isOpen, onClose, onApply }: TemplatesModalProps) {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateTransactionTemplateRequest>({
    name: '', accountId: '', categoryId: '', amount: 0, type: TransactionType.Expense,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['transaction-templates'],
    queryFn: transactionTemplatesApi.getAll,
    enabled: isOpen,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
    enabled: isOpen && (showCreate || !!editingId),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
    enabled: isOpen && (showCreate || !!editingId),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTransactionTemplateRequest) => transactionTemplatesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-templates'] });
      toast.success('Template criado');
      setShowCreate(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateTransactionTemplateRequest }) =>
      transactionTemplatesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-templates'] });
      toast.success('Template atualizado');
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: transactionTemplatesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transaction-templates'] });
      toast.success('Template apagado');
    },
  });

  const applyMutation = useMutation({
    mutationFn: transactionTemplatesApi.apply,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast.success('Transação criada a partir do template');
      onClose();
    },
  });

  const resetForm = () => {
    setForm({ name: '', accountId: '', categoryId: '', amount: 0, type: TransactionType.Expense });
  };

  const startEdit = (t: TransactionTemplateDto) => {
    setEditingId(t.id);
    setForm({ name: t.name, accountId: t.accountId, categoryId: t.categoryId, amount: t.amount, type: t.type, description: t.description, tags: t.tags });
  };

  const handleSave = () => {
    if (!form.name || !form.accountId || !form.categoryId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isEditing = showCreate || !!editingId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Templates de Transação">
      {!isEditing ? (
        <div>
          <div className="flex justify-end mb-3">
            <Button size="sm" onClick={() => setShowCreate(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Novo Template
            </Button>
          </div>

          {templates.length === 0 ? (
            <p className="text-center py-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Nenhum template criado ainda.
            </p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        {t.type === TransactionType.Income ? '+' : '-'}R$ {t.amount.toFixed(2)} • {t.categoryName} • {t.accountName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => applyMutation.mutate(t.id)} title="Usar template">
                      <Play className="w-4 h-4 text-green-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => startEdit(t)} title="Editar">
                      <Pencil className="w-4 h-4 text-blue-500" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteMutation.mutate(t.id)} title="Apagar">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <Input label="Nome do Template" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select label="Tipo" value={String(form.type)} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}>
            <option value="0">Receita</option>
            <option value="1">Despesa</option>
          </Select>
          <Input label="Valor" type="number" value={form.amount || ''} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
          <Select label="Conta" value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}>
            <option value="">Selecionar conta</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </Select>
          <Select label="Categoria" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            <option value="">Selecionar categoria</option>
            {categories.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Input label="Descrição (opcional)" value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="flex gap-2 justify-end">
            <Button variant="secondary" onClick={() => { setShowCreate(false); setEditingId(null); resetForm(); }}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
