'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { alertConfigurationsApi, remindersApi } from '@/lib/api';
import { Card, Button, EmptyState } from '@/components/ui';
import { AlertConfigModal } from '@/components/alerts/AlertConfigModal';
import { ReminderModal } from '@/components/alerts/ReminderModal';
import { Plus, Trash2, Edit2, Bell, Calendar } from 'lucide-react';
import { AlertConfigurationDto, AlertType, AlertChannel, ReminderDto } from '@/types';
import toast from 'react-hot-toast';

const alertTypeLabels: Record<string, string> = {
  [AlertType.BudgetWarning]: 'Alerta de Orcamento',
  [AlertType.BillDue]: 'Conta a Vencer',
  [AlertType.GoalNearTarget]: 'Meta Proxima',
  [AlertType.NegativeBalance]: 'Saldo Negativo',
  [AlertType.DebtDue]: 'Divida a Vencer',
  [AlertType.LastBusinessDay]: 'Ultimo Dia Util',
};

const alertTypeIcons: Record<string, string> = {
  [AlertType.BudgetWarning]: '💰',
  [AlertType.BillDue]: '📅',
  [AlertType.GoalNearTarget]: '🎯',
  [AlertType.NegativeBalance]: '⚠️',
  [AlertType.DebtDue]: '💳',
  [AlertType.LastBusinessDay]: '📆',
};

const alertChannelLabels: Record<string, string> = {
  [AlertChannel.InApp]: 'No App',
  [AlertChannel.Telegram]: 'Telegram',
  [AlertChannel.Both]: 'Ambos',
};

const monthNames = [
  '', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
];

type TabType = 'alerts' | 'reminders';

export default function AlertsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('alerts');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertConfigurationDto | null>(null);
  const [editingReminder, setEditingReminder] = useState<ReminderDto | null>(null);
  const queryClient = useQueryClient();

  // Alert queries/mutations
  const { data: alerts, isLoading: isLoadingAlerts } = useQuery({
    queryKey: ['alertConfigurations'],
    queryFn: alertConfigurationsApi.getAll,
  });

  const toggleAlertMutation = useMutation({
    mutationFn: alertConfigurationsApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
    },
    onError: () => toast.error('Erro ao alterar status do alerta.'),
  });

  const deleteAlertMutation = useMutation({
    mutationFn: alertConfigurationsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertConfigurations'] });
      toast.success('Alerta excluido!');
    },
    onError: () => toast.error('Erro ao excluir alerta.'),
  });

  // Reminder queries/mutations
  const { data: reminders, isLoading: isLoadingReminders } = useQuery({
    queryKey: ['reminders'],
    queryFn: remindersApi.getAll,
  });

  const toggleReminderMutation = useMutation({
    mutationFn: remindersApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
    onError: () => toast.error('Erro ao alterar status do lembrete.'),
  });

  const deleteReminderMutation = useMutation({
    mutationFn: remindersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      toast.success('Lembrete excluido!');
    },
    onError: () => toast.error('Erro ao excluir lembrete.'),
  });

  const handleDeleteAlert = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este alerta?')) {
      deleteAlertMutation.mutate(id);
    }
  };

  const handleDeleteReminder = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este lembrete?')) {
      deleteReminderMutation.mutate(id);
    }
  };

  const alertActiveCount = alerts?.filter(a => a.isActive).length ?? 0;
  const alertTotalCount = alerts?.length ?? 0;
  const reminderActiveCount = reminders?.filter(r => r.isActive).length ?? 0;
  const reminderTotalCount = reminders?.length ?? 0;

  return (
    <PageContainer
      title="Alertas e Lembretes"
      subtitle="Configure alertas automaticos e lembretes de datas importantes"
    >
      <div className="space-y-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'alerts'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Bell className="w-4 h-4" />
            Alertas ({alertTotalCount})
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'reminders'
                ? 'border-emerald-600 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Lembretes ({reminderTotalCount})
          </button>
        </div>

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{alertTotalCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                </div>
              </Card>
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{alertActiveCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ativos</p>
                </div>
              </Card>
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-400">{alertTotalCount - alertActiveCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Inativos</p>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={() => { setEditingAlert(null); setIsAlertModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Alerta
              </Button>
            </div>

            {/* Alert List */}
            {isLoadingAlerts ? (
              <div className="text-center py-8">Carregando...</div>
            ) : alerts && alerts.length > 0 ? (
              <div className="grid gap-4">
                {alerts.map((alert) => (
                  <Card key={alert.id} className={`hover:shadow-lg transition-shadow ${!alert.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">
                          {alertTypeIcons[alert.type] || '🔔'}
                        </span>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {alertTypeLabels[alert.type] || alert.type}
                          </h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                              {alertChannelLabels[alert.channel] || alert.channel}
                            </span>
                            {alert.threshold != null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                Limite: {alert.threshold}%
                              </span>
                            )}
                            {alert.cronSchedule && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                                Cron: {alert.cronSchedule}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Criado por @{alert.createdByUsername}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleAlertMutation.mutate(alert.id)}
                          disabled={toggleAlertMutation.isPending}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          style={{ backgroundColor: alert.isActive ? '#10b981' : '#94a3b8' }}
                          title={alert.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <span className="sr-only">{alert.isActive ? 'Desativar' : 'Ativar'}</span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              alert.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingAlert(alert); setIsAlertModalOpen(true); }}
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteAlert(alert.id)}
                          disabled={deleteAlertMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Bell}
                title="Nenhum alerta configurado"
                description="Crie alertas para ser notificado sobre eventos importantes nas suas financas"
                action={{
                  label: "Novo Alerta",
                  onClick: () => { setEditingAlert(null); setIsAlertModalOpen(true); }
                }}
              />
            )}
          </>
        )}

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-600">{reminderTotalCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Total</p>
                </div>
              </Card>
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{reminderActiveCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Ativos</p>
                </div>
              </Card>
              <Card>
                <div className="p-4 text-center">
                  <p className="text-2xl font-bold text-slate-400">{reminderTotalCount - reminderActiveCount}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Inativos</p>
                </div>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex justify-end">
              <Button onClick={() => { setEditingReminder(null); setIsReminderModalOpen(true); }}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Lembrete
              </Button>
            </div>

            {/* Reminder List */}
            {isLoadingReminders ? (
              <div className="text-center py-8">Carregando...</div>
            ) : reminders && reminders.length > 0 ? (
              <div className="grid gap-4">
                {reminders.map((reminder) => (
                  <Card key={reminder.id} className={`hover:shadow-lg transition-shadow ${!reminder.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-center justify-between p-4 sm:p-6">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex flex-col items-center justify-center">
                          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                            {monthNames[reminder.month]}
                          </span>
                          <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-none">
                            {reminder.day}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                            {reminder.name}
                          </h3>
                          {reminder.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                              {reminder.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-1">
                            {reminder.isRecurring && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                Recorrente
                              </span>
                            )}
                            {reminder.daysInAdvance > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                                {reminder.daysInAdvance}d antes
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            Criado por @{reminder.createdByUsername}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => toggleReminderMutation.mutate(reminder.id)}
                          disabled={toggleReminderMutation.isPending}
                          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                          style={{ backgroundColor: reminder.isActive ? '#10b981' : '#94a3b8' }}
                          title={reminder.isActive ? 'Desativar' : 'Ativar'}
                        >
                          <span className="sr-only">{reminder.isActive ? 'Desativar' : 'Ativar'}</span>
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              reminder.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingReminder(reminder); setIsReminderModalOpen(true); }}
                        >
                          <Edit2 className="w-4 h-4 text-emerald-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReminder(reminder.id)}
                          disabled={deleteReminderMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Nenhum lembrete configurado"
                description="Crie lembretes para datas importantes como aniversarios e eventos"
                action={{
                  label: "Novo Lembrete",
                  onClick: () => { setEditingReminder(null); setIsReminderModalOpen(true); }
                }}
              />
            )}
          </>
        )}
      </div>

      {isAlertModalOpen && (
        <AlertConfigModal
          alert={editingAlert}
          isOpen={isAlertModalOpen}
          onClose={() => { setIsAlertModalOpen(false); setEditingAlert(null); }}
        />
      )}

      {isReminderModalOpen && (
        <ReminderModal
          reminder={editingReminder}
          isOpen={isReminderModalOpen}
          onClose={() => { setIsReminderModalOpen(false); setEditingReminder(null); }}
        />
      )}
    </PageContainer>
  );
}
