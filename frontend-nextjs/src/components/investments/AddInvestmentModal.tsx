'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { investmentsApi, accountsApi } from '@/lib/api';
import { CreateInvestmentRequest, InvestmentType, InvestmentDto, UpdateInvestmentRequest } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  editingInvestment?: InvestmentDto | null;
}

const investmentTypeLabels: Record<number, string> = {
  [InvestmentType.Stock]: 'Ação',
  [InvestmentType.ETF]: 'ETF',
  [InvestmentType.Fund]: 'Fundo',
  [InvestmentType.Crypto]: 'Cripto',
  [InvestmentType.FixedIncome]: 'Renda Fixa',
  [InvestmentType.Other]: 'Outro',
};

export function AddInvestmentModal({ isOpen, onClose, editingInvestment }: Props) {
  const queryClient = useQueryClient();
  const isEditing = !!editingInvestment;

  const [form, setForm] = useState<CreateInvestmentRequest>({
    name: editingInvestment?.name || '',
    type: editingInvestment?.type ?? InvestmentType.Stock,
    symbol: editingInvestment?.symbol || '',
    quantity: editingInvestment?.quantity || 0,
    averagePrice: editingInvestment?.averagePrice || 0,
    currentPrice: editingInvestment?.currentPrice || 0,
    currency: editingInvestment?.currency || 'BRL',
    accountId: editingInvestment?.accountId || undefined,
  });

  const { data: accounts = [] } = useQuery({
    queryKey: ['accounts'],
    queryFn: accountsApi.getAll,
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateInvestmentRequest) => investmentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      toast.success('Investimento adicionado');
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateInvestmentRequest) => investmentsApi.update(editingInvestment!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['investments'] });
      queryClient.invalidateQueries({ queryKey: ['investment-summary'] });
      toast.success('Investimento atualizado');
      onClose();
    },
  });

  const handleSave = () => {
    if (!form.name) {
      toast.error('Nome é obrigatório');
      return;
    }
    if (isEditing) {
      updateMutation.mutate({
        name: form.name,
        type: form.type,
        symbol: form.symbol,
        currentPrice: form.currentPrice,
        currency: form.currency,
        accountId: form.accountId,
      });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Investimento' : 'Novo Investimento'}>
      <div className="space-y-3">
        <Input label="Nome" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select label="Tipo" value={String(form.type)} onChange={(e) => setForm({ ...form, type: Number(e.target.value) })}>
          {Object.entries(investmentTypeLabels).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </Select>
        <Input label="Símbolo" value={form.symbol || ''} onChange={(e) => setForm({ ...form, symbol: e.target.value })} placeholder="Ex: PETR4, BTC" />
        {!isEditing && (
          <>
            <Input label="Quantidade" type="number" value={form.quantity || ''} onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })} />
            <Input label="Preço Médio" type="number" value={form.averagePrice || ''} onChange={(e) => setForm({ ...form, averagePrice: Number(e.target.value) })} />
          </>
        )}
        <Input label="Preço Atual" type="number" value={form.currentPrice || ''} onChange={(e) => setForm({ ...form, currentPrice: Number(e.target.value) })} />
        <Select label="Moeda" value={form.currency || 'BRL'} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
          <option value="BRL">BRL</option>
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
        </Select>
        <Select label="Conta (opcional)" value={form.accountId || ''} onChange={(e) => setForm({ ...form, accountId: e.target.value || undefined })}>
          <option value="">Nenhuma</option>
          {accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </Select>
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave}>{isEditing ? 'Atualizar' : 'Adicionar'}</Button>
        </div>
      </div>
    </Modal>
  );
}
