'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input } from '@/components/ui';
import { remindersApi } from '@/lib/api';
import { ReminderDto, CreateReminderRequest, UpdateReminderRequest } from '@/types';
import toast from 'react-hot-toast';

interface ReminderModalProps {
  reminder?: ReminderDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const monthNames = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function ReminderModal({ reminder, isOpen, onClose }: ReminderModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!reminder;

  const { register, handleSubmit } = useForm({
    defaultValues: {
      name: reminder?.name || '',
      description: reminder?.description || '',
      month: reminder?.month || 1,
      day: reminder?.day || 1,
      isRecurring: reminder?.isRecurring ?? true,
      daysInAdvance: reminder?.daysInAdvance || 0,
      isActive: reminder?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateReminderRequest) => remindersApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      onClose();
      toast.success('Lembrete criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar lembrete.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateReminderRequest) => remindersApi.update(reminder!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      onClose();
      toast.success('Lembrete atualizado com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar lembrete.'),
  });

  const onSubmit = (data: any) => {
    if (isEditing) {
      updateMutation.mutate({
        name: data.name,
        description: data.description || null,
        month: parseInt(data.month),
        day: parseInt(data.day),
        isRecurring: data.isRecurring,
        daysInAdvance: parseInt(data.daysInAdvance) || 0,
        isActive: data.isActive,
      });
    } else {
      createMutation.mutate({
        name: data.name,
        description: data.description || null,
        month: parseInt(data.month),
        day: parseInt(data.day),
        isRecurring: data.isRecurring,
        daysInAdvance: parseInt(data.daysInAdvance) || 0,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Nome"
          placeholder="Ex: Aniversario da Mae"
          {...register('name', { required: 'Nome e obrigatorio' })}
        />

        <Input
          label="Descricao (opcional)"
          placeholder="Ex: Comprar presente"
          {...register('description')}
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Mes</label>
            <select
              {...register('month', { required: true })}
              className="w-full rounded-lg border px-3 py-2 text-sm"
              style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
            >
              {monthNames.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
          </div>

          <Input
            label="Dia"
            type="number"
            min={1}
            max={31}
            {...register('day', { required: true, min: 1, max: 31 })}
          />
        </div>

        <Input
          label="Dias de antecedencia"
          type="number"
          min={0}
          max={30}
          placeholder="0 = notificar no dia"
          {...register('daysInAdvance')}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            {...register('isRecurring')}
            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          />
          <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Recorrente (todo ano)</span>
        </label>

        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Lembrete ativo</span>
          </label>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Criar Lembrete'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
