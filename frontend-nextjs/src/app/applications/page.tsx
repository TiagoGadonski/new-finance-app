'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageContainer } from '@/components/layout/PageContainer';
import { jobApplicationsApi } from '@/lib/api';
import { JobApplicationDto, ApplicationStatus, UpdateJobApplicationRequest, CreateJobApplicationRequest } from '@/types';
import { QuickAddForm } from '@/components/applications/QuickAddForm';
import { StatsPanel } from '@/components/applications/StatsPanel';
import { ConversionPanel } from '@/components/applications/ConversionPanel';
import { KanbanBoard } from '@/components/applications/KanbanBoard';
import { UpcomingSteps } from '@/components/applications/UpcomingSteps';
import { ChecklistPanel } from '@/components/applications/ChecklistPanel';
import { ApplicationDetailModal } from '@/components/applications/ApplicationDetailModal';
import JobAnalysisModal from '@/components/applications/JobAnalysisModal';
import { Briefcase, Sparkles } from 'lucide-react';

export default function ApplicationsPage() {
  const qc = useQueryClient();
  const [editApp, setEditApp] = useState<JobApplicationDto | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['jobApplications'],
    queryFn: jobApplicationsApi.getAll,
  });

  const { data: stats } = useQuery({
    queryKey: ['jobApplicationsStats'],
    queryFn: jobApplicationsApi.getStats,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['jobApplications'] });
    qc.invalidateQueries({ queryKey: ['jobApplicationsStats'] });
  };

  const createMutation = useMutation({
    mutationFn: (data: CreateJobApplicationRequest) => jobApplicationsApi.create(data),
    onSuccess: invalidate,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJobApplicationRequest }) =>
      jobApplicationsApi.update(id, data),
    onSuccess: invalidate,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      jobApplicationsApi.patchStatus(id, status),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobApplicationsApi.delete(id),
    onSuccess: invalidate,
  });

  const handleStatusChange = (id: string, status: ApplicationStatus) => {
    statusMutation.mutate({ id, status });
  };

  const handleUpdate = async (id: string, data: UpdateJobApplicationRequest) => {
    await updateMutation.mutateAsync({ id, data });
  };

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
  };

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Candidaturas</h1>
            <p className="text-sm text-muted-foreground">Acompanhe suas vagas internacionais</p>
          </div>
        </div>
        <button
          onClick={() => setShowAnalysis(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:from-emerald-700 hover:to-teal-700 transition-all shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          Analisar com IA
        </button>
      </div>

      <div className="space-y-4">
        {/* Quick add — sempre visível */}
        <QuickAddForm
          onAdd={async data => { await createMutation.mutateAsync(data); }}
          loading={createMutation.isPending}
        />

        {/* Stats */}
        {stats && <StatsPanel stats={stats} />}

        {/* Layout de duas colunas: conteúdo principal + lateral */}
        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            {/* Próximos passos urgentes */}
            <UpcomingSteps applications={applications} />

            {/* Conversão por fonte */}
            {stats && stats.conversionBySource.length > 0 && (
              <ConversionPanel data={stats.conversionBySource} />
            )}

            {/* Kanban */}
            {isLoading ? (
              <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                Carregando candidaturas...
              </div>
            ) : applications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Briefcase className="w-10 h-10 mb-3 opacity-30" />
                <p className="font-medium">Nenhuma candidatura ainda</p>
                <p className="text-sm mt-1">Adicione sua primeira vaga acima — leva 5 segundos.</p>
              </div>
            ) : (
              <KanbanBoard
                applications={applications}
                onStatusChange={handleStatusChange}
                onEdit={app => setEditApp(app)}
                onDelete={handleDelete}
              />
            )}
          </div>

          {/* Coluna lateral — checklist fixo */}
          <div className="w-56 shrink-0 hidden lg:block">
            <ChecklistPanel />
          </div>
        </div>
      </div>

      {/* Modal de análise com IA */}
      {showAnalysis && (
        <JobAnalysisModal
          onClose={() => setShowAnalysis(false)}
          onSave={async data => { await createMutation.mutateAsync(data); }}
        />
      )}

      {/* Modal de edição */}
      {editApp && (
        <ApplicationDetailModal
          app={editApp}
          onClose={() => setEditApp(null)}
          onSave={handleUpdate}
          onDelete={handleDelete}
          loading={updateMutation.isPending || deleteMutation.isPending}
        />
      )}
    </PageContainer>
  );
}
