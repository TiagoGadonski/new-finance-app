'use client';

import { useState, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Settings, CalendarDays, Clock, DollarSign, Briefcase, Star, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { Card, Button, Modal, Input, Alert, LoadingSpinner } from '@/components/ui';
import { workCalendarApi } from '@/lib/api/workCalendarApi';
import type { HolidayDto } from '@/types/workCalendar';

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(date: string): string {
  const d = new Date(date);
  return d.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isoToDateKey(iso: string): string {
  return iso.split('T')[0];
}

export function WorkCalendarContent() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [showSettings, setShowSettings] = useState(false);
  const [showHolidays, setShowHolidays] = useState(false);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<HolidayDto | null>(null);

  const [hourlyRate, setHourlyRate] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState('');

  const [holidayName, setHolidayName] = useState('');
  const [holidayIsFixed, setHolidayIsFixed] = useState(true);
  const [holidayMonth, setHolidayMonth] = useState('');
  const [holidayDay, setHolidayDay] = useState('');
  const [holidayEasterOffset, setHolidayEasterOffset] = useState('');

  const { data: settings } = useQuery({
    queryKey: ['work-calendar-settings'],
    queryFn: workCalendarApi.getSettings,
  });

  const { data: summary, isLoading } = useQuery({
    queryKey: ['work-calendar-month', year, month],
    queryFn: () => workCalendarApi.getMonthSummary(year, month),
  });

  const { data: holidays } = useQuery({
    queryKey: ['work-calendar-holidays'],
    queryFn: workCalendarApi.getHolidays,
  });

  const toggleMutation = useMutation({
    mutationFn: (date: string) => workCalendarApi.toggleWorkDay(date),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month', year, month] });
    },
  });

  const settingsMutation = useMutation({
    mutationFn: workCalendarApi.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-settings'] });
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month'] });
      setShowSettings(false);
    },
  });

  const createHolidayMutation = useMutation({
    mutationFn: workCalendarApi.createHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month'] });
      resetHolidayForm();
    },
  });

  const updateHolidayMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => workCalendarApi.updateHoliday(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month'] });
      resetHolidayForm();
    },
  });

  const deleteHolidayMutation = useMutation({
    mutationFn: workCalendarApi.deleteHoliday,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month'] });
    },
  });

  const resetHolidaysMutation = useMutation({
    mutationFn: workCalendarApi.resetHolidays,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work-calendar-holidays'] });
      queryClient.invalidateQueries({ queryKey: ['work-calendar-month'] });
    },
  });

  const goToPreviousMonth = useCallback(() => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }, [month]);

  const goToNextMonth = useCallback(() => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }, [month]);

  const goToToday = useCallback(() => {
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
  }, []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDow = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean; day: number }> = [];

    for (let i = startDow - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      days.push({ date: new Date(prevYear, prevMonth - 1, d), isCurrentMonth: false, day: d });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month - 1, d), isCurrentMonth: true, day: d });
    }

    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      const nextMonth = month === 12 ? 1 : month + 1;
      const nextYear = month === 12 ? year + 1 : year;
      for (let d = 1; d <= remaining; d++) {
        days.push({ date: new Date(nextYear, nextMonth - 1, d), isCurrentMonth: false, day: d });
      }
    }

    return days;
  }, [year, month]);

  const workedDates = useMemo(() => {
    if (!summary) return new Set<string>();
    return new Set(summary.workDays.map(w => isoToDateKey(w.date)));
  }, [summary]);

  const holidayMap = useMemo(() => {
    if (!summary) return new Map<string, string>();
    const map = new Map<string, string>();
    summary.holidays.forEach(h => {
      map.set(isoToDateKey(h.date), h.name);
    });
    return map;
  }, [summary]);

  const handleDayClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    if (date.getDay() === 0 || date.getDay() === 6) return;
    if (toggleMutation.isPending) return;
    const dateStr = `${toDateKey(date)}T00:00:00`;
    toggleMutation.mutate(dateStr);
  };

  const openSettingsModal = () => {
    setHourlyRate(settings?.hourlyRate?.toString() || '0');
    setHoursPerDay(settings?.hoursPerDay?.toString() || '8');
    setShowSettings(true);
  };

  const saveSettings = () => {
    settingsMutation.mutate({
      hourlyRate: parseFloat(hourlyRate) || 0,
      hoursPerDay: parseFloat(hoursPerDay) || 8,
    });
  };

  const resetHolidayForm = () => {
    setShowHolidayForm(false);
    setEditingHoliday(null);
    setHolidayName('');
    setHolidayIsFixed(true);
    setHolidayMonth('');
    setHolidayDay('');
    setHolidayEasterOffset('');
  };

  const openEditHoliday = (h: HolidayDto) => {
    setEditingHoliday(h);
    setHolidayName(h.name);
    setHolidayIsFixed(h.isFixed);
    setHolidayMonth(h.month?.toString() || '');
    setHolidayDay(h.day?.toString() || '');
    setHolidayEasterOffset(h.easterOffset?.toString() || '');
    setShowHolidayForm(true);
  };

  const saveHoliday = () => {
    const data = {
      name: holidayName,
      isFixed: holidayIsFixed,
      month: holidayIsFixed ? (parseInt(holidayMonth) || null) : null,
      day: holidayIsFixed ? (parseInt(holidayDay) || null) : null,
      easterOffset: !holidayIsFixed ? (parseInt(holidayEasterOffset) || null) : null,
    };

    if (editingHoliday) {
      updateHolidayMutation.mutate({ id: editingHoliday.id, data });
    } else {
      createHolidayMutation.mutate(data);
    }
  };

  const isToday = (date: Date) => date.toDateString() === now.toDateString();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Month Navigation Bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={goToPreviousMonth}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold min-w-[200px] text-center" style={{ color: 'var(--foreground)' }}>
              {MONTH_NAMES[month - 1]} {year}
            </h2>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="sm" onClick={goToToday}>
              Hoje
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowHolidays(true)}>
              <Star className="w-4 h-4" /> Feriados
            </Button>
            <Button variant="secondary" size="sm" onClick={openSettingsModal}>
              <Settings className="w-4 h-4" /> Configurações
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Dias úteis</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{summary.businessDays}</p>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Dias trabalhados</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{summary.workedDays}</p>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Horas totais</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{summary.totalHours}h</p>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Valor estimado</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(summary.estimatedValue)}</p>
                </div>
              </div>
            </Card>

            <Card padding="sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                  <CalendarDays className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Pagamento</p>
                  <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{formatDate(summary.paymentDate)}</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Rate info */}
        {settings && settings.hourlyRate > 0 && (
          <p className="text-sm text-slate-500">
            Taxa: {formatCurrency(settings.hourlyRate)}/hora &middot; {settings.hoursPerDay}h/dia
          </p>
        )}
        {(!settings || settings.hourlyRate === 0) && (
          <Alert variant="info" title="Configure seu valor/hora">
            Clique em &quot;Configurações&quot; para definir seu valor por hora e horas por dia.
          </Alert>
        )}

        {/* Calendar Grid */}
        <Card padding="none">
          {/* Day headers */}
          <div className="grid grid-cols-7">
            {DAY_NAMES.map((d, i) => (
              <div
                key={d}
                className="p-2 text-center text-xs font-semibold border-b"
                style={{
                  color: i === 0 || i === 6 ? '#94a3b8' : 'var(--foreground)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calendarDays.map((cell, idx) => {
              const dateKey = toDateKey(cell.date);
              const isWeekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
              const isWorked = workedDates.has(dateKey);
              const holidayName = holidayMap.get(dateKey);
              const isHoliday = !!holidayName;
              const isTodayDate = isToday(cell.date);
              const isClickable = cell.isCurrentMonth && !isWeekend;

              let bgColor = 'transparent';
              let textColor = 'var(--foreground)';
              let cursor = 'default';

              if (!cell.isCurrentMonth) {
                textColor = '#cbd5e1';
              } else if (isWorked) {
                bgColor = '#dcfce7';
                textColor = '#166534';
              } else if (isHoliday) {
                bgColor = '#fee2e2';
                textColor = '#991b1b';
              } else if (isWeekend) {
                bgColor = '#f1f5f9';
                textColor = '#94a3b8';
              }

              if (isClickable) {
                cursor = toggleMutation.isPending ? 'wait' : 'pointer';
              }

              return (
                <div
                  key={idx}
                  onClick={() => isClickable ? handleDayClick(cell.date, cell.isCurrentMonth) : undefined}
                  title={holidayName || undefined}
                  className="relative border-b border-r p-1 sm:p-2 min-h-[48px] sm:min-h-[64px] transition-colors"
                  style={{
                    backgroundColor: bgColor,
                    color: textColor,
                    cursor,
                    borderColor: 'var(--border-color)',
                  }}
                >
                  <span
                    className={`text-xs sm:text-sm font-medium inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full ${
                      isTodayDate ? 'bg-blue-600 text-white' : ''
                    }`}
                  >
                    {cell.day}
                  </span>
                  {isWorked && cell.isCurrentMonth && (
                    <span className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 text-[10px] sm:text-xs text-green-700">
                      &#10003;
                    </span>
                  )}
                  {isHoliday && cell.isCurrentMonth && (
                    <span className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 text-[8px] sm:text-[10px] text-red-600 truncate max-w-[calc(100%-8px)]">
                      {holidayName}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs" style={{ color: 'var(--foreground)' }}>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac' }} />
            Trabalhado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }} />
            Feriado
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }} />
            Fim de semana
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-blue-600" />
            Hoje
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Modal isOpen={showSettings} onClose={() => setShowSettings(false)} title="Configurações PJ">
        <div className="space-y-4">
          <Input
            label="Valor por hora (R$)"
            type="number"
            step="0.01"
            min="0"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="Ex: 75.00"
          />
          <Input
            label="Horas por dia"
            type="number"
            step="0.5"
            min="0"
            max="24"
            value={hoursPerDay}
            onChange={(e) => setHoursPerDay(e.target.value)}
            placeholder="Ex: 8"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setShowSettings(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={saveSettings} disabled={settingsMutation.isPending}>
              {settingsMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Holidays Modal */}
      <Modal isOpen={showHolidays} onClose={() => { setShowHolidays(false); resetHolidayForm(); }} title="Feriados" size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Gerencie os feriados da sua família</p>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  if (confirm('Resetar feriados para o padrão de Araucária/PR?')) {
                    resetHolidaysMutation.mutate();
                  }
                }}
                disabled={resetHolidaysMutation.isPending}
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </Button>
              <Button size="sm" onClick={() => { resetHolidayForm(); setShowHolidayForm(true); }}>
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </Button>
            </div>
          </div>

          {/* Holiday Form (inline) */}
          {showHolidayForm && (
            <Card padding="sm" className="border-blue-200 dark:border-blue-800">
              <div className="space-y-3">
                <Input
                  label="Nome do feriado"
                  value={holidayName}
                  onChange={(e) => setHolidayName(e.target.value)}
                  placeholder="Ex: Natal"
                />
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--foreground)' }}>
                    <input
                      type="radio"
                      checked={holidayIsFixed}
                      onChange={() => setHolidayIsFixed(true)}
                      className="accent-blue-600"
                    />
                    Data fixa
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: 'var(--foreground)' }}>
                    <input
                      type="radio"
                      checked={!holidayIsFixed}
                      onChange={() => setHolidayIsFixed(false)}
                      className="accent-blue-600"
                    />
                    Relativo à Páscoa
                  </label>
                </div>
                {holidayIsFixed ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Mês"
                      type="number"
                      min="1"
                      max="12"
                      value={holidayMonth}
                      onChange={(e) => setHolidayMonth(e.target.value)}
                      placeholder="1-12"
                    />
                    <Input
                      label="Dia"
                      type="number"
                      min="1"
                      max="31"
                      value={holidayDay}
                      onChange={(e) => setHolidayDay(e.target.value)}
                      placeholder="1-31"
                    />
                  </div>
                ) : (
                  <Input
                    label="Offset da Páscoa (dias)"
                    type="number"
                    value={holidayEasterOffset}
                    onChange={(e) => setHolidayEasterOffset(e.target.value)}
                    helperText="Ex: -2 = Sexta Santa, -47 = Carnaval terça, +60 = Corpus Christi"
                  />
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" size="sm" onClick={resetHolidayForm}>
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveHoliday}
                    disabled={!holidayName || createHolidayMutation.isPending || updateHolidayMutation.isPending}
                  >
                    {editingHoliday ? 'Atualizar' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Holiday List */}
          <div className="divide-y" style={{ borderColor: 'var(--border-color)' }}>
            {holidays && holidays.length > 0 ? (
              holidays.map((h) => (
                <div key={h.id} className="flex items-center justify-between py-2.5 px-1">
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{h.name}</p>
                    <p className="text-xs text-slate-500">
                      {h.isFixed
                        ? `${String(h.day).padStart(2, '0')}/${String(h.month).padStart(2, '0')}`
                        : `Páscoa ${h.easterOffset! >= 0 ? '+' : ''}${h.easterOffset} dias`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditHoliday(h)}
                      className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remover "${h.name}"?`)) {
                          deleteHolidayMutation.mutate(h.id);
                        }
                      }}
                      className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-500" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-4 text-sm text-center text-slate-500">Nenhum feriado cadastrado.</p>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
