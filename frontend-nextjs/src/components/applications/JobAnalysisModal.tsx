'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { jobApplicationsApi } from '@/lib/api';
import { JobAnalysisResultDto, CreateJobApplicationRequest, ApplicationSource, ApplicationFit } from '@/types';
import { X, Sparkles, Loader2, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSave: (data: CreateJobApplicationRequest) => Promise<void>;
}

const FIT_CONFIG = {
  High: { label: 'Alto fit', class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  Medium: { label: 'Fit médio', class: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  Low: { label: 'Baixo fit', class: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
};

const FIT_TO_ENUM: Record<string, ApplicationFit> = {
  High: ApplicationFit.High,
  Medium: ApplicationFit.Medium,
  Low: ApplicationFit.Low,
};

export default function JobAnalysisModal({ onClose, onSave }: Props) {
  const [jobText, setJobText] = useState('');
  const [analysis, setAnalysis] = useState<JobAnalysisResultDto | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Editable fields after analysis
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobUrl, setJobUrl] = useState('');
  const [stack, setStack] = useState('');
  const [salary, setSalary] = useState('');
  const [source, setSource] = useState<ApplicationSource>(ApplicationSource.LinkedInExternal);
  const [notes, setNotes] = useState('');

  const analyzeMutation = useMutation({
    mutationFn: (text: string) => jobApplicationsApi.analyze(text),
    onSuccess: (result) => {
      setAnalysis(result);
      setCompany(result.company ?? '');
      setJobTitle(result.jobTitle ?? '');
      setStack(result.stack ?? '');
      setSalary(result.salary ?? '');
    },
  });

  const saveMutation = useMutation({
    mutationFn: (data: CreateJobApplicationRequest) => onSave(data),
    onSuccess: () => onClose(),
  });

  const handleSave = () => {
    if (!company.trim() || !jobUrl.trim()) return;
    saveMutation.mutate({
      company: company.trim(),
      jobUrl: jobUrl.trim(),
      source,
      jobTitle: jobTitle.trim() || undefined,
      stack: stack.trim() || undefined,
      salary: salary.trim() || undefined,
      fit: analysis ? FIT_TO_ENUM[analysis.suggestedFit] : undefined,
      notes: notes.trim() || undefined,
    } as CreateJobApplicationRequest);
  };

  const fitConfig = analysis ? FIT_CONFIG[analysis.suggestedFit] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analisar vaga com IA</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Step 1: paste job text */}
          {!analysis && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cole o texto completo da vaga
              </label>
              <textarea
                value={jobText}
                onChange={e => setJobText(e.target.value)}
                rows={12}
                placeholder="Cole aqui o texto da vaga (descrição, requisitos, benefícios...)&#10;&#10;Quanto mais completo, melhor o parecer."
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
              {analyzeMutation.isError && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Não consegui analisar a vaga. Tente novamente ou cadastre manualmente.
                </p>
              )}
              <button
                onClick={() => analyzeMutation.mutate(jobText)}
                disabled={!jobText.trim() || analyzeMutation.isPending}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {analyzeMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analisando...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Analisar</>
                )}
              </button>
            </div>
          )}

          {/* Step 2: analysis result + editable form */}
          {analysis && (
            <div className="space-y-5">
              {/* Verdict card */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Parecer da IA</span>
                  {fitConfig && (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${fitConfig.class}`}>
                      {fitConfig.label}
                    </span>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{analysis.verdict}</p>
                  <button
                    onClick={() => setShowDetails(v => !v)}
                    className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium"
                  >
                    {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    {showDetails ? 'Ocultar' : 'Ver'} pros e contras
                  </button>
                  {showDetails && (
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">A favor</p>
                        {analysis.pros.length > 0 ? analysis.pros.map((p, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                            {p}
                          </div>
                        )) : <p className="text-xs text-gray-400">Nenhum identificado</p>}
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Riscos</p>
                        {analysis.cons.length > 0 ? analysis.cons.map((c, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <XCircle className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                            {c}
                          </div>
                        )) : <p className="text-xs text-gray-400">Nenhum identificado</p>}
                      </div>
                    </div>
                  )}
                  {analysis.acceptsLatam !== null && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 pt-1">
                      {analysis.acceptsLatam
                        ? '✅ Vaga menciona aceitar LATAM/global'
                        : '⚠️ Vaga não menciona aceitar LATAM'}
                      {analysis.workModel && ` · ${analysis.workModel}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Editable fields */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Revise e confirme os dados</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Empresa *</label>
                    <input value={company} onChange={e => setCompany(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Cargo</label>
                    <input value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">URL da vaga *</label>
                  <input value={jobUrl} onChange={e => setJobUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Stack</label>
                    <input value={stack} onChange={e => setStack(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Salário</label>
                    <input value={salary} onChange={e => setSalary(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Fonte</label>
                  <select value={source} onChange={e => setSource(Number(e.target.value) as ApplicationSource)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    <option value={ApplicationSource.LinkedInEasyApply}>LinkedIn Easy Apply</option>
                    <option value={ApplicationSource.LinkedInExternal}>LinkedIn Externo</option>
                    <option value={ApplicationSource.Strider}>Strider</option>
                    <option value={ApplicationSource.WeWorkRemotely}>We Work Remotely</option>
                    <option value={ApplicationSource.WorkingNomads}>Working Nomads</option>
                    <option value={ApplicationSource.Jobgether}>Jobgether</option>
                    <option value={ApplicationSource.CompanyWebsite}>Site da empresa</option>
                    <option value={ApplicationSource.Other}>Outro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Notas</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => { setAnalysis(null); setJobText(''); }}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Analisar outra
                </button>
                <button
                  onClick={handleSave}
                  disabled={!company.trim() || !jobUrl.trim() || saveMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveMutation.isPending ? 'Salvando...' : 'Salvar candidatura'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
