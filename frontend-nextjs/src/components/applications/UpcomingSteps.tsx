'use client';

import { JobApplicationDto } from '@/types';
import { AlertTriangle, Clock, ExternalLink } from 'lucide-react';

interface Props {
  applications: JobApplicationDto[];
}

export function UpcomingSteps({ applications }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const soon = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  const upcoming = applications
    .filter(a => a.nextStep && a.nextStepDate && a.nextStepDate <= soon)
    .sort((a, b) => (a.nextStepDate ?? '').localeCompare(b.nextStepDate ?? ''));

  if (upcoming.length === 0) return null;

  return (
    <div className="bg-card border border-amber-200/70 dark:border-amber-900/40 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 mb-3">
        <Clock className="w-3.5 h-3.5 text-amber-500" />
        Próximos passos
      </h3>
      <div className="space-y-2">
        {upcoming.map(app => {
          const overdue = app.nextStepDate! < today;
          return (
            <div
              key={app.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                overdue
                  ? 'bg-rose-50/80 dark:bg-rose-900/15'
                  : 'bg-amber-50/80 dark:bg-amber-900/15'
              }`}
            >
              {overdue && <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{app.company || app.jobTitle || '(sem nome)'}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{app.nextStep}</p>
              </div>
              <span className={`text-xs font-medium tabular-nums shrink-0 ${overdue ? 'text-rose-600 dark:text-rose-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {app.nextStepDate}
              </span>
              {app.jobUrl && (
                <a href={app.jobUrl} target="_blank" rel="noopener noreferrer"
                  className="text-muted-foreground/50 hover:text-emerald-600 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
