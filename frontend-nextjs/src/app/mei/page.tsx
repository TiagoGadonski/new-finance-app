'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { ListSkeleton, Alert } from '@/components/ui';
import { meiApi } from '@/lib/api';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setDashboard, setSelectedYear } from '@/store/slices/meiSlice';
import { MeiDashboard } from '@/components/mei/MeiDashboard';
import { MeiAlerts } from '@/components/mei/MeiAlerts';
import { YearSelector } from '@/components/mei/YearSelector';

export default function MeiPage() {
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
      <PageContainer title="MEI Revenue Tracking" description="Acompanhe seu faturamento e limites do MEI">
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
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Alert variant="danger" title="Erro ao carregar dados">
          Não foi possível carregar os dados do MEI. Tente novamente mais tarde.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title="MEI Revenue Tracking"
      description="Acompanhe seu faturamento e limites do MEI"
    >
      <div className="space-y-6">
        <YearSelector
          selectedYear={selectedYear}
          onYearChange={(year) => dispatch(setSelectedYear(year))}
        />

        {alerts && alerts.length > 0 && <MeiAlerts alerts={alerts} />}

        {dashboard && <MeiDashboard dashboard={dashboard} />}
      </div>
    </PageContainer>
  );
}
