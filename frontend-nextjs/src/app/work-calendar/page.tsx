'use client';

import { PageContainer } from '@/components/layout/PageContainer';
import { WorkCalendarContent } from '@/components/work-calendar/WorkCalendarContent';

export default function WorkCalendarPage() {
  return (
    <PageContainer title="Calendário PJ" description="Controle de dias trabalhados e estimativa de pagamento">
      <WorkCalendarContent />
    </PageContainer>
  );
}
