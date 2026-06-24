'use client';

import { useState } from 'react';
import { X, ExternalLink, Trash2 } from 'lucide-react';
import { JobApplicationDto, UpdateJobApplicationRequest, ApplicationStatus, ApplicationSource, ApplicationFit } from '@/types';

const STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.Applied]: 'Aplicado',
  [ApplicationStatus.InProcess]: 'Em Processo',
  [ApplicationStatus.Interview]: 'Entrevista',
  [ApplicationStatus.TechnicalTest]: 'Teste Técnico',
  [ApplicationStatus.Offer]: 'Oferta',
  [ApplicationStatus.Rejected]: 'Rejeitado',
  [ApplicationStatus.NoResponse]: 'Sem Resposta',
};

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
  app: JobApplicationDto;
  onClose: () => void;
  onSave: (id: string, data: UpdateJobApplicationRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  loading?: boolean;
}

export function ApplicationDetailModal({ app, onClose, onSave, onDelete, loading }: Props) {
  const [form, setForm] = useState<UpdateJobApplicationRequest>({
    company: app.company,
    jobUrl: app.jobUrl,
    source: app.source,
    jobTitle: app.jobTitle,
    stack: app.stack,
    salary: app.salary,
    fit: app.fit,
    status: app.status,
    nextStep: app.nextStep,
    nextStepDate: app.nextStepDate,
    notes: app.notes,
    appliedDate: app.appliedDate,
  });
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (field: keyof UpdateJobApplicationRequest, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async () => {
    await onSave(app.id, form);
    onClose();
  };

  const handleDelete = async () => {
    await onDelete(app.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card border border-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-semibold">Editar candidatura</h2>
          <div className="flex items-center gap-2">
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-emerald-600">
              <ExternalLink className="w-4 h-4" />
            </a>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Empresa *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">URL da vaga *</label>
              <input type="url" value={form.jobUrl} onChange={e => set('jobUrl', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select value={form.status} onChange={e => set('status', Number(e.target.value) as ApplicationStatus)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {Object.values(ApplicationStatus).filter(v => typeof v === 'number').map(v => (
                  <option key={v} value={v}>{STATUS_LABELS[v as ApplicationStatus]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fonte</label>
              <select value={form.source} onChange={e => set('source', Number(e.target.value) as ApplicationSource)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                {Object.values(ApplicationSource).filter(v => typeof v === 'number').map(v => (
                  <option key={v} value={v}>{SOURCE_LABELS[v as ApplicationSource]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Título</label>
              <input value={form.jobTitle ?? ''} onChange={e => set('jobTitle', e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Stack</label>
              <input value={form.stack ?? ''} onChange={e => set('stack', e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Salário</label>
              <input value={form.salary ?? ''} onChange={e => set('salary', e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Fit</label>
              <select value={form.fit ?? ''} onChange={e => set('fit', e.target.value === '' ? null : Number(e.target.value) as ApplicationFit)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Nenhum</option>
                {Object.values(ApplicationFit).filter(v => typeof v === 'number').map(v => (
                  <option key={v} value={v}>{FIT_LABELS[v as ApplicationFit]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Próximo passo</label>
              <input value={form.nextStep ?? ''} onChange={e => set('nextStep', e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data do passo</label>
              <input type="date" value={form.nextStepDate ?? ''} onChange={e => set('nextStepDate', e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Data aplicação</label>
              <input type="date" value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-muted-foreground">Notas</label>
              <textarea value={form.notes ?? ''} onChange={e => set('notes', e.target.value || null)} rows={3} className="mt-1 w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-600">Confirmar exclusão?</span>
                <button onClick={handleDelete} disabled={loading} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50">Excluir</button>
                <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 rounded-lg border border-border text-xs">Cancelar</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700">
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            )}
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted">Cancelar</button>
              <button onClick={handleSave} disabled={loading || !form.company.trim() || !form.jobUrl.trim()} className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
