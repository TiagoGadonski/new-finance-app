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
    <div className="bg-card border border-amber-200 dark:border-amber-900/50 rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Clock className="w-4 h-4 text-amber-500" />
        Próximos passos
      </h3>
      <div className="space-y-2">
        {upcoming.map(app => {
          const overdue = app.nextStepDate! < today;
          return (
            <div key={app.id} className={`flex items-center gap-3 p-2 rounded-lg ${overdue ? 'bg-red-50 dark:bg-red-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
              {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium truncate">{app.company}</p>
                <p className="text-xs text-muted-foreground truncate">{app.nextStep}</p>
              </div>
              <span className={`text-xs font-medium shrink-0 ${overdue ? 'text-red-600' : 'text-amber-700 dark:text-amber-400'}`}>
                {app.nextStepDate}
              </span>
              <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-600">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
