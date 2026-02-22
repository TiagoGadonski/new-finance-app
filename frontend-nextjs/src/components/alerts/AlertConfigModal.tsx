'use client';

import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal, Button, Input, Select } from '@/components/ui';
import { alertConfigurationsApi } from '@/lib/api';
import { AlertConfigurationDto, AlertType, AlertChannel, CreateAlertConfigurationRequest, UpdateAlertConfigurationRequest } from '@/types';
import toast from 'react-hot-toast';

interface AlertConfigModalProps {
  alert?: AlertConfigurationDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const alertTypeLabels: Record<string, string> = {
  [AlertType.BudgetWarning]: 'Alerta de Orcamento',
  [AlertType.BillDue]: 'Conta a Vencer',
  [AlertType.GoalNearTarget]: 'Meta Proxima',
  [AlertType.NegativeBalance]: 'Saldo Negativo',
  [AlertType.DebtDue]: 'Divida a Vencer',
  [AlertType.LastBusinessDay]: 'Ultimo Dia Util',
};

const alertChannelLabels: Record<string, string> = {
  [AlertChannel.InApp]: 'No App',
  [AlertChannel.Telegram]: 'Telegram',
  [AlertChannel.Both]: 'Ambos',
};

export function AlertConfigModal({ alert, isOpen, onClose }: AlertConfigModalProps) {
  const queryClient = useQueryClient();
  const isEditing = !!alert;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      type: alert?.type || AlertType.BudgetWarning,
      threshold: alert?.threshold ?? '',
      channel: alert?.channel || AlertChannel.InApp,
      cronSchedule: alert?.cronSchedule || '',
      isActive: alert?.isActive ?? true,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateAlertConfigurationRequest) => alertConfigurationsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
      onClose();
      toast.success('Alerta criado com sucesso!');
    },
    onError: () => toast.error('Erro ao criar alerta.'),
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateAlertConfigurationRequest) => alertConfigurationsApi.update(alert!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
      onClose();
      toast.success('Alerta atualizado com sucesso!');
    },
    onError: () => toast.error('Erro ao atualizar alerta.'),
  });

  const onSubmit = (data: any) => {
    const threshold = data.threshold === '' || data.threshold === null ? null : parseFloat(data.threshold);
    const cronSchedule = data.cronSchedule || null;

    if (isEditing) {
      updateMutation.mutate({
        type: data.type,
        threshold,
        isActive: data.isActive,
        channel: data.channel,
        cronSchedule,
      });
    } else {
      createMutation.mutate({
        type: data.type,
        threshold: threshold ?? undefined,
        channel: data.channel,
        cronSchedule: cronSchedule ?? undefined,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Alerta' : 'Novo Alerta'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Tipo de Alerta</label>
          <select
            {...register('type', { required: 'Tipo e obrigatorio' })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
          >
            {Object.entries(alertTypeLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Limite (opcional)"
          type="number"
          step="0.01"
          placeholder="Ex: 80 (% do orcamento)"
          {...register('threshold')}
        />

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>Canal</label>
          <select
            {...register('channel')}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)', borderColor: 'var(--border-color)' }}
          >
            {Object.entries(alertChannelLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <Input
          label="Agendamento Cron (opcional)"
          placeholder="Ex: 0 9 * * 1 (segundas as 9h)"
          {...register('cronSchedule')}
        />

        {isEditing && (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              {...register('isActive')}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Alerta ativo</span>
          </label>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Salvando...' : isEditing ? 'Salvar Alteracoes' : 'Criar Alerta'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
