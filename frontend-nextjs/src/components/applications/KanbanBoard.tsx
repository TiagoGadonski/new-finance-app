'use client';

import { JobApplicationDto, ApplicationStatus } from '@/types';
import { ApplicationCard, STATUS_COLORS } from './ApplicationCard';

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: ApplicationStatus.Applied, label: 'Aplicado' },
  { status: ApplicationStatus.InProcess, label: 'Em Processo' },
  { status: ApplicationStatus.Interview, label: 'Entrevista' },
  { status: ApplicationStatus.TechnicalTest, label: 'Teste Técnico' },
  { status: ApplicationStatus.Offer, label: 'Oferta' },
  { status: ApplicationStatus.Rejected, label: 'Rejeitado' },
  { status: ApplicationStatus.NoResponse, label: 'Sem Resposta' },
];

interface Props {
  applications: JobApplicationDto[];
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onEdit: (app: JobApplicationDto) => void;
  onDelete: (id: string) => void;
}

export function KanbanBoard({ applications, onStatusChange, onEdit, onDelete }: Props) {
  const byStatus = (status: ApplicationStatus) => applications.filter(a => a.status === status);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {COLUMNS.map(col => {
          const items = byStatus(col.status);
          return (
            <div key={col.status} className="w-64 shrink-0">
              <div className={`flex items-center gap-2 mb-2 px-2 py-1.5 rounded-lg ${STATUS_COLORS[col.status]}`}>
                <span className="text-xs font-semibold">{col.label}</span>
                <span className="ml-auto text-xs font-bold">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map(app => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    onStatusChange={onStatusChange}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
                {items.length === 0 && (
                  <div className="rounded-xl border border-dashed border-border p-4 text-xs text-center text-muted-foreground">
                    Nenhuma
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
