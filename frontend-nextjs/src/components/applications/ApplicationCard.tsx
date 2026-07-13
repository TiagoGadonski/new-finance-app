'use client';

import { ExternalLink, Calendar, ChevronDown } from 'lucide-react';
import { JobApplicationDto, ApplicationStatus, ApplicationSource, ApplicationFit } from '@/types';
import { useState } from 'react';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]: 'Aplicado',
  [ApplicationStatus.InProcess]: 'Em Processo',
  [ApplicationStatus.Interview]: 'Entrevista',
  [ApplicationStatus.TechnicalTest]: 'Teste Técnico',
  [ApplicationStatus.Offer]: 'Oferta',
  [ApplicationStatus.Rejected]: 'Rejeitado',
  [ApplicationStatus.NoResponse]: 'Sem Resposta',
};

export const STATUS_COLORS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]:       'bg-slate-100/80 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400',
  [ApplicationStatus.InProcess]:     'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  [ApplicationStatus.Interview]:     'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  [ApplicationStatus.TechnicalTest]: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  [ApplicationStatus.Offer]:         'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  [ApplicationStatus.Rejected]:      'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
  [ApplicationStatus.NoResponse]:    'bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-500',
};

export const STATUS_DOT: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]:       'bg-slate-400',
  [ApplicationStatus.InProcess]:     'bg-sky-500',
  [ApplicationStatus.Interview]:     'bg-violet-500',
  [ApplicationStatus.TechnicalTest]: 'bg-amber-500',
  [ApplicationStatus.Offer]:         'bg-emerald-500',
  [ApplicationStatus.Rejected]:      'bg-rose-500',
  [ApplicationStatus.NoResponse]:    'bg-slate-300',
};

const FIT_BADGE: Record<ApplicationFit, { label: string; cls: string }> = {
  [ApplicationFit.High]:   { label: 'Alto fit',  cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  [ApplicationFit.Medium]: { label: 'Fit médio', cls: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  [ApplicationFit.Low]:    { label: 'Baixo fit', cls: 'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400' },
};

const SOURCE_SHORT: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LI Easy',
  [ApplicationSource.LinkedInExternal]:  'LI Ext.',
  [ApplicationSource.Strider]:           'Strider',
  [ApplicationSource.WeWorkRemotely]:    'WWR',
  [ApplicationSource.WorkingNomads]:     'WN',
  [ApplicationSource.Jobgether]:         'Jobgether',
  [ApplicationSource.CompanyWebsite]:    'Site',
  [ApplicationSource.Other]:            'Outro',
};

interface Props {
  app: JobApplicationDto;
  onStatusChange: (id: string, status: ApplicationStatus) => void;
  onEdit: (app: JobApplicationDto) => void;
  onDelete: (id: string) => void;
}

export function ApplicationCard({ app, onStatusChange, onEdit, onDelete }: Props) {
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = app.nextStepDate && app.nextStepDate < today;
  const isDueSoon = app.nextStepDate && !isOverdue &&
    app.nextStepDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  return (
    <div
      className="group bg-card border border-border/60 rounded-2xl p-4 space-y-3 hover:shadow-md hover:border-border transition-all duration-150 cursor-pointer"
      onClick={() => onEdit(app)}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm leading-snug">
            {app.company || app.jobTitle || <span className="text-muted-foreground font-normal italic text-xs">(sem nome)</span>}
          </p>
          {app.company && app.jobTitle && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{app.jobTitle}</p>
          )}
        </div>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="shrink-0 text-muted-foreground/50 hover:text-emerald-600 transition-colors opacity-0 group-hover:opacity-100"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-1.5" onClick={e => e.stopPropagation()}>
        {/* Status picker */}
        <div className="relative">
          <button
            onClick={() => setShowStatusPicker(v => !v)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[app.status]}`} />
            {STATUS_LABELS[app.status]}
            <ChevronDown className="w-2.5 h-2.5 opacity-60" />
          </button>
          {showStatusPicker && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-popover border border-border rounded-xl shadow-lg py-1 min-w-max">
              {(Object.values(ApplicationStatus).filter(v => typeof v === 'number') as ApplicationStatus[]).map(v => (
                <button
                  key={v}
                  onClick={() => { onStatusChange(app.id, v); setShowStatusPicker(false); }}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted flex items-center gap-2 ${app.status === v ? 'font-semibold' : ''}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[v]}`} />
                  {STATUS_LABELS[v]}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground/60">·</span>
        <span className="text-xs text-muted-foreground">{SOURCE_SHORT[app.source]}</span>

        {app.fit !== null && app.fit !== undefined && (
          <>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${FIT_BADGE[app.fit].cls}`}>
              {FIT_BADGE[app.fit].label}
            </span>
          </>
        )}

        {app.salary && (
          <>
            <span className="text-xs text-muted-foreground/60">·</span>
            <span className="text-xs text-muted-foreground tabular-nums">{app.salary}</span>
          </>
        )}
      </div>

      {/* Next step */}
      {app.nextStep && (
        <div className={`flex items-center gap-2 text-xs rounded-xl px-3 py-2 ${
          isOverdue
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
            : isDueSoon
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
            : 'bg-muted/60 text-muted-foreground'
        }`}>
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate flex-1">{app.nextStep}</span>
          {app.nextStepDate && (
            <span className="shrink-0 tabular-nums font-medium">{app.nextStepDate}</span>
          )}
        </div>
      )}
    </div>
  );
}
