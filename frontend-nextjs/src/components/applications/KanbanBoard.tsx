'use client';

import { JobApplicationDto, ApplicationStatus } from '@/types';
import { ApplicationCard, STATUS_COLORS, STATUS_DOT } from './ApplicationCard';

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: ApplicationStatus.Applied,       label: 'Aplicado' },
  { status: ApplicationStatus.InProcess,     label: 'Em Processo' },
  { status: ApplicationStatus.Interview,     label: 'Entrevista' },
  { status: ApplicationStatus.TechnicalTest, label: 'Teste Técnico' },
  { status: ApplicationStatus.Offer,         label: 'Oferta' },
  { status: ApplicationStatus.Rejected,      label: 'Rejeitado' },
  { status: ApplicationStatus.NoResponse,    label: 'Sem Resposta' },
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
    <div className="overflow-x-auto pb-2 -mx-1 px-1">
      <div className="flex gap-3 min-w-max">
        {COLUMNS.map(col => {
          const items = byStatus(col.status);
          return (
            <div key={col.status} className="w-64 shrink-0 flex flex-col gap-2">
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className={`w-2 h-2 rounded-full ${STATUS_DOT[col.status]}`} />
                <span className="text-xs font-semibold text-muted-foreground tracking-wide">{col.label}</span>
                <span className="ml-auto text-xs font-bold tabular-nums text-muted-foreground/60 bg-muted px-1.5 py-0.5 rounded-full">
                  {items.length}
                </span>
              </div>

              {/* Cards */}
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
                  <div className="rounded-2xl border border-dashed border-border/50 p-5 text-xs text-center text-muted-foreground/50">
                    —
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
