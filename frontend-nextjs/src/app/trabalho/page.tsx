'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs, ListSkeleton, Alert, Card, Select } from '@/components/ui';
import { WorkCalendarContent } from '@/components/work-calendar/WorkCalendarContent';
import { meiApi, transactionsApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDashboard, setSelectedYear } from '@/store/slices/meiSlice';
import { MeiDashboard } from '@/components/mei/MeiDashboard';
import { MeiAlerts } from '@/components/mei/MeiAlerts';
import { YearSelector } from '@/components/mei/YearSelector';
import { TransactionType } from '@/types';
import { formatCurrency } from '@/lib/utils/currency';
import { Calculator, AlertTriangle, Calendar, DollarSign } from 'lucide-react';

function MeiTabContent() {
  const dispatch = useAppDispatch();
  const selectedYear = useAppSelector((state) => state.mei.selectedYear);

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ['mei-dashboard', selectedYear],
    queryFn: () => meiApi.getDashboard(selectedYear),
  });

  const { data: alerts } = useQuery({
    queryKey: ['mei-alerts', selectedYear],
    queryFn: () => meiApi.getAlerts(selectedYear),
    enabled: !!dashboard,
  });

  useEffect(() => {
    if (dashboard) {
      dispatch(setDashboard(dashboard));
    }
  }, [dashboard, dispatch]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-12 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <ListSkeleton count={1} />
          <ListSkeleton count={1} />
          <ListSkeleton count={1} />
          <ListSkeleton count={1} />
        </div>
        <ListSkeleton count={2} />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" title="Erro ao carregar dados">
        Não foi possível carregar os dados do MEI. Tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <YearSelector
        selectedYear={selectedYear}
        onYearChange={(year) => dispatch(setSelectedYear(year))}
      />
      {alerts && alerts.length > 0 && <MeiAlerts alerts={alerts} />}
      {dashboard && <MeiDashboard dashboard={dashboard} />}
    </div>
  );
}

function MeiTaxCalculator() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [activityType, setActivityType] = useState<'commerce' | 'service'>('service');

  const { data: transactions = [] } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getAll,
  });

  const monthlyRevenue = useMemo(() => {
    const months: { month: number; revenue: number; das: number }[] = [];
    const annualLimit = 81000;

    for (let m = 1; m <= 12; m++) {
      const revenue = transactions
        .filter(t =>
          t.type === TransactionType.Income &&
          new Date(t.date).getFullYear() === year &&
          new Date(t.date).getMonth() + 1 === m
        )
        .reduce((sum, t) => sum + t.amount, 0);

      // DAS rate: 5% for commerce/industry, 3% for services (simplified)
      const dasRate = activityType === 'commerce' ? 0.05 : 0.03;
      // Minimum DAS is ~R$75 for services, ~R$67 for commerce (2024 values)
      const minDas = activityType === 'commerce' ? 67 : 75;
      const das = revenue > 0 ? Math.max(revenue * dasRate, minDas) : 0;

      months.push({ month: m, revenue, das });
    }

    return months;
  }, [transactions, year, activityType]);

  const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
  const totalDas = monthlyRevenue.reduce((sum, m) => sum + m.das, 0);
  const annualLimit = 81000;
  const percentUsed = (totalRevenue / annualLimit) * 100;
  const isNearLimit = percentUsed > 80;

  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  return (
    <div className="space-y-6">
      <div className="flex gap-3 items-center">
        <Select value={String(year)} onChange={(e) => setYear(Number(e.target.value))}>
          {[year - 1, year, year + 1].map(y => <option key={y} value={y}>{y}</option>)}
        </Select>
        <Select value={activityType} onChange={(e) => setActivityType(e.target.value as 'commerce' | 'service')}>
          <option value="service">Prestação de Serviços (3%)</option>
          <option value="commerce">Comércio/Indústria (5%)</option>
        </Select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Faturamento Anual</span>
          </div>
          <p className="text-lg font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calculator className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Total DAS Estimado</span>
          </div>
          <p className="text-lg font-bold text-blue-600">{formatCurrency(totalDas)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-4 h-4 ${isNearLimit ? 'text-red-500' : 'text-amber-500'}`} />
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Limite Anual</span>
          </div>
          <p className={`text-lg font-bold ${isNearLimit ? 'text-red-600' : ''}`} style={!isNearLimit ? { color: 'var(--foreground)' } : undefined}>
            {percentUsed.toFixed(1)}%
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Restante</span>
          </div>
          <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>{formatCurrency(annualLimit - totalRevenue)}</p>
        </Card>
      </div>

      {isNearLimit && (
        <Alert variant="warning" title="Atenção ao Limite">
          Você já atingiu {percentUsed.toFixed(1)}% do limite anual de {formatCurrency(annualLimit)}.
          {percentUsed >= 100 && ' Você ultrapassou o limite e pode precisar migrar para ME.'}
        </Alert>
      )}

      <Card className="p-4">
        <h3 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>DAS Mensal Estimado</h3>
        <div className="space-y-2">
          {monthlyRevenue.map((m) => (
            <div key={m.month} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{monthNames[m.month - 1]}</span>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Faturamento</span>
                  <p className="text-sm font-medium text-green-600">{formatCurrency(m.revenue)}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>DAS</span>
                  <p className="text-sm font-medium text-blue-600">{formatCurrency(m.das)}</p>
                </div>
                <div className="text-right min-w-[60px]">
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Vencimento</span>
                  <p className="text-xs" style={{ color: 'var(--foreground)' }}>20/{String(m.month).padStart(2, '0')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default function TrabalhoPage() {
  const [activeTab, setActiveTab] = useState('mei');

  return (
    <PageContainer
      title="Trabalho"
      subtitle="MEI, Impostos e Calendário PJ"
    >
      <div className="space-y-6">
        <Tabs
          tabs={[
            { key: 'mei', label: 'MEI' },
            { key: 'impostos', label: 'Impostos' },
            { key: 'pj', label: 'Calendário PJ' },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'mei' && <MeiTabContent />}
        {activeTab === 'impostos' && <MeiTaxCalculator />}
        {activeTab === 'pj' && <WorkCalendarContent />}
      </div>
    </PageContainer>
  );
}
