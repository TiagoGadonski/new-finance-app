'use client';

import { useState } from 'react';
import { PageContainer } from '@/components/layout/PageContainer';
import { Tabs } from '@/components/ui';
import { MonthlyReport } from '@/components/reports/MonthlyReport';
import { CashFlowChart } from '@/components/reports/CashFlowChart';
import { PeriodComparison } from '@/components/reports/PeriodComparison';

const tabs = [
  { key: 'monthly', label: 'Mensal' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'comparison', label: 'Comparação' },
];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('monthly');

  return (
    <PageContainer title="Relatórios" subtitle="Análise financeira detalhada">
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
      <div className="mt-6">
        {activeTab === 'monthly' && <MonthlyReport />}
        {activeTab === 'cashflow' && <CashFlowChart />}
        {activeTab === 'comparison' && <PeriodComparison />}
      </div>
    </PageContainer>
  );
}
