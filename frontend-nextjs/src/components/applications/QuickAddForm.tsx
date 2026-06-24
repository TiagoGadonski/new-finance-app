'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { ApplicationSource, ApplicationFit, CreateJobApplicationRequest } from '@/types';

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LinkedIn Easy Apply',
  [ApplicationSource.LinkedInExternal]: 'LinkedIn → Site',
  [ApplicationSource.Strider]: 'Strider',
  [ApplicationSource.WeWorkRemotely]: 'WeWorkRemotely',
  [ApplicationSource.WorkingNomads]: 'WorkingNomads',
  [ApplicationSource.Jobgether]: 'Jobgether',
  [ApplicationSource.CompanyWebsite]: 'Site da Empresa',
  [ApplicationSource.Other]: 'Outro',
};

const FIT_LABELS: Record<ApplicationFit, string> = {
  [ApplicationFit.High]: 'Alto',
  [ApplicationFit.Medium]: 'Médio',
  [ApplicationFit.Low]: 'Baixo',
};

interface Props {
  onAdd: (data: CreateJobApplicationRequest) => Promise<void>;
  loading?: boolean;
}

const EMPTY: CreateJobApplicationRequest = {
  company: '',
  jobUrl: '',
  source: ApplicationSource.Other,
  jobTitle: null,
  stack: null,
  salary: null,
  fit: null,
  nextStep: null,
  nextStepDate: null,
  notes: null,
};

export function QuickAddForm({ onAdd, loading }: Props) {
  const [form, setForm] = useState<CreateJobApplicationRequest>(EMPTY);
  const [showExtra, setShowExtra] = useState(false);

  const set = (field: keyof CreateJobApplicationRequest, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.company.trim() || !form.jobUrl.trim()) return;
    await onAdd(form);
    setForm(EMPTY);
    setShowExtra(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Empresa *"
          value={form.company}
          onChange={e => set('company', e.target.value)}
          required
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <input
          type="url"
          placeholder="URL da vaga *"
          value={form.jobUrl}
          onChange={e => set('jobUrl', e.target.value)}
          required
          className="flex-[2] min-w-0 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={form.source}
          onChange={e => set('source', Number(e.target.value) as ApplicationSource)}
          className="px-2 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {Object.values(ApplicationSource)
            .filter(v => typeof v === 'number')
            .map(v => (
              <option key={v} value={v}>{SOURCE_LABELS[v as ApplicationSource]}</option>
            ))}
        </select>
        <button
          type="submit"
          disabled={loading || !form.company.trim() || !form.jobUrl.trim()}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowExtra(v => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {showExtra ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showExtra ? 'menos detalhes' : '+ mais detalhes'}
      </button>

      {showExtra && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <input
            type="text"
            placeholder="Título da vaga"
            value={form.jobTitle ?? ''}
            onChange={e => set('jobTitle', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Stack (ex: .NET, React)"
            value={form.stack ?? ''}
            onChange={e => set('stack', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="text"
            placeholder="Salário (ex: $5k/mês)"
            value={form.salary ?? ''}
            onChange={e => set('salary', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <select
            value={form.fit ?? ''}
            onChange={e => set('fit', e.target.value === '' ? null : Number(e.target.value) as ApplicationFit)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Fit (opcional)</option>
            {Object.values(ApplicationFit)
              .filter(v => typeof v === 'number')
              .map(v => (
                <option key={v} value={v}>{FIT_LABELS[v as ApplicationFit]}</option>
              ))}
          </select>
          <input
            type="text"
            placeholder="Próximo passo"
            value={form.nextStep ?? ''}
            onChange={e => set('nextStep', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input
            type="date"
            placeholder="Data próximo passo"
            value={form.nextStepDate ?? ''}
            onChange={e => set('nextStepDate', e.target.value || null)}
            className="px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <textarea
            placeholder="Notas"
            value={form.notes ?? ''}
            onChange={e => set('notes', e.target.value || null)}
            rows={2}
            className="col-span-2 sm:col-span-3 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>
      )}
    </form>
  );
}
