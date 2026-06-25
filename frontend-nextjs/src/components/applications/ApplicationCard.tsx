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
  [ApplicationStatus.Applied]: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  [ApplicationStatus.InProcess]: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  [ApplicationStatus.Interview]: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  [ApplicationStatus.TechnicalTest]: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  [ApplicationStatus.Offer]: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  [ApplicationStatus.Rejected]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  [ApplicationStatus.NoResponse]: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const FIT_COLORS: Record<ApplicationFit, string> = {
  [ApplicationFit.High]: 'text-emerald-600',
  [ApplicationFit.Medium]: 'text-amber-500',
  [ApplicationFit.Low]: 'text-red-500',
};

const FIT_LABELS: Record<ApplicationFit, string> = {
  [ApplicationFit.High]: '▲ Alto',
  [ApplicationFit.Medium]: '◆ Médio',
  [ApplicationFit.Low]: '▼ Baixo',
};

const SOURCE_SHORT: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LI Easy',
  [ApplicationSource.LinkedInExternal]: 'LI Ext.',
  [ApplicationSource.Strider]: 'Strider',
  [ApplicationSource.WeWorkRemotely]: 'WWR',
  [ApplicationSource.WorkingNomads]: 'WN',
  [ApplicationSource.Jobgether]: 'Jobgether',
  [ApplicationSource.CompanyWebsite]: 'Site',
  [ApplicationSource.Other]: 'Outro',
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
  const isDueSoon = app.nextStepDate && !isOverdue && app.nextStepDate <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);

  return (
    <div
      className="bg-card border border-border rounded-xl p-3 space-y-2 hover:border-emerald-500/50 transition-colors cursor-pointer"
      onClick={() => onEdit(app)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm truncate">
            {app.company || app.jobTitle || <span className="text-muted-foreground font-normal italic">(sem nome)</span>}
          </p>
          {app.company && app.jobTitle && <p className="text-xs text-muted-foreground truncate">{app.jobTitle}</p>}
        </div>
        {app.jobUrl && (
          <a
            href={app.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="shrink-0 text-muted-foreground hover:text-emerald-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5 items-center">
        <div className="relative" onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setShowStatusPicker(v => !v)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}
          >
            {STATUS_LABELS[app.status]}
            <ChevronDown className="w-3 h-3" />
          </button>
          {showStatusPicker && (
            <div className="absolute left-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-max">
              {Object.values(ApplicationStatus)
                .filter(v => typeof v === 'number')
                .map(v => (
                  <button
                    key={v}
                    onClick={() => { onStatusChange(app.id, v as ApplicationStatus); setShowStatusPicker(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-muted ${app.status === v ? 'font-semibold' : ''}`}
                  >
                    {STATUS_LABELS[v as ApplicationStatus]}
                  </button>
                ))}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground">{SOURCE_SHORT[app.source]}</span>

        {app.fit !== null && app.fit !== undefined && (
          <span className={`text-xs font-medium ${FIT_COLORS[app.fit]}`}>
            {FIT_LABELS[app.fit]}
          </span>
        )}

        {app.salary && <span className="text-xs text-muted-foreground">{app.salary}</span>}
      </div>

      {app.nextStep && (
        <div className={`flex items-center gap-1 text-xs rounded-lg px-2 py-1 ${
          isOverdue ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
          isDueSoon ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20' :
          'bg-muted text-muted-foreground'
        }`}>
          <Calendar className="w-3 h-3 shrink-0" />
          <span className="truncate">{app.nextStep}</span>
          {app.nextStepDate && <span className="shrink-0 ml-auto">{app.nextStepDate}</span>}
        </div>
      )}
    </div>
  );
}
