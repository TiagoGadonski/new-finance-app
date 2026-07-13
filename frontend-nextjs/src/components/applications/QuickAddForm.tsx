'use client';

import { useState } from 'react';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { ApplicationSource, ApplicationFit, CreateJobApplicationRequest } from '@/types';

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LinkedIn Easy Apply',
  [ApplicationSource.LinkedInExternal]:  'LinkedIn → Site',
  [ApplicationSource.Strider]:           'Strider',
  [ApplicationSource.WeWorkRemotely]:    'WeWorkRemotely',
  [ApplicationSource.WorkingNomads]:     'WorkingNomads',
  [ApplicationSource.Jobgether]:         'Jobgether',
  [ApplicationSource.CompanyWebsite]:    'Site da Empresa',
  [ApplicationSource.Other]:            'Outro',
};

const FIT_LABELS: Record<ApplicationFit, string> = {
  [ApplicationFit.High]:   'Alto',
  [ApplicationFit.Medium]: 'Médio',
  [ApplicationFit.Low]:    'Baixo',
};

const EMPTY: CreateJobApplicationRequest = {
  company: null, jobUrl: null, source: ApplicationSource.Other,
  jobTitle: null, stack: null, salary: null, fit: null,
  nextStep: null, nextStepDate: null, notes: null,
};

const INPUT = 'px-3 py-2 rounded-xl border border-border/60 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder:text-muted-foreground/50 transition-shadow';

interface Props {
  onAdd: (data: CreateJobApplicationRequest) => Promise<void>;
  loading?: boolean;
}

export function QuickAddForm({ onAdd, loading }: Props) {
  const [form, setForm] = useState<CreateJobApplicationRequest>(EMPTY);
  const [showExtra, setShowExtra] = useState(false);

  const set = (field: keyof CreateJobApplicationRequest, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const hasContent = [form.company, form.jobUrl, form.jobTitle, form.stack, form.notes].some(v => v?.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasContent) return;
    await onAdd(form);
    setForm(EMPTY);
    setShowExtra(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Empresa"
          value={form.company ?? ''}
          onChange={e => set('company', e.target.value || null)}
          className={`flex-1 min-w-0 ${INPUT}`}
        />
        <input
          type="text"
          placeholder="URL da vaga"
          value={form.jobUrl ?? ''}
          onChange={e => set('jobUrl', e.target.value || null)}
          className={`flex-[2] min-w-0 ${INPUT}`}
        />
        <select
          value={form.source}
          onChange={e => set('source', Number(e.target.value) as ApplicationSource)}
          className={`${INPUT} pr-7`}
        >
          {(Object.values(ApplicationSource).filter(v => typeof v === 'number') as ApplicationSource[]).map(v => (
            <option key={v} value={v}>{SOURCE_LABELS[v]}</option>
          ))}
        </select>
        <button
          type="submit"
          disabled={loading || !hasContent}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 flex items-center gap-1.5 whitespace-nowrap transition-opacity focus:outline-none focus:ring-2 focus:ring-emerald-500/60"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      <button
        type="button"
        onClick={() => setShowExtra(v => !v)}
        className="flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors focus:outline-none"
      >
        {showExtra ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        {showExtra ? 'menos detalhes' : '+ mais detalhes'}
      </button>

      {showExtra && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          <input type="text" placeholder="Título da vaga"
            value={form.jobTitle ?? ''} onChange={e => set('jobTitle', e.target.value || null)}
            className={INPUT} />
          <input type="text" placeholder="Stack (ex: .NET, React)"
            value={form.stack ?? ''} onChange={e => set('stack', e.target.value || null)}
            className={INPUT} />
          <input type="text" placeholder="Salário (ex: $5k/mês)"
            value={form.salary ?? ''} onChange={e => set('salary', e.target.value || null)}
            className={INPUT} />
          <select
            value={form.fit ?? ''}
            onChange={e => set('fit', e.target.value === '' ? null : Number(e.target.value) as ApplicationFit)}
            className={`${INPUT} pr-7`}
          >
            <option value="">Fit (opcional)</option>
            {(Object.values(ApplicationFit).filter(v => typeof v === 'number') as ApplicationFit[]).map(v => (
              <option key={v} value={v}>{FIT_LABELS[v]}</option>
            ))}
          </select>
          <input type="text" placeholder="Próximo passo"
            value={form.nextStep ?? ''} onChange={e => set('nextStep', e.target.value || null)}
            className={INPUT} />
          <input type="date"
            value={form.nextStepDate ?? ''} onChange={e => set('nextStepDate', e.target.value || null)}
            className={INPUT} />
          <textarea
            placeholder="Notas"
            value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)}
            rows={2}
            className={`col-span-2 sm:col-span-3 resize-none ${INPUT}`}
          />
        </div>
      )}
    </form>
  );
}
