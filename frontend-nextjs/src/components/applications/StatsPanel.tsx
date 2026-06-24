'use client';

import { JobApplicationStatsDto, ApplicationStatus } from '@/types';
import { Target, TrendingUp, MessageSquare, Trophy } from 'lucide-react';

interface Props {
  stats: JobApplicationStatsDto;
}

export function StatsPanel({ stats }: Props) {
  const weekPct = Math.min(100, Math.round((stats.appliedThisWeek / stats.weeklyGoal) * 100));
  const goalReached = stats.appliedThisWeek >= stats.weeklyGoal;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className={`rounded-xl border p-4 ${goalReached ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-border bg-card'}`}>
        <div className="flex items-center gap-2 mb-2">
          <Target className={`w-4 h-4 ${goalReached ? 'text-emerald-600' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground font-medium">Esta semana</span>
        </div>
        <p className={`text-2xl font-bold ${goalReached ? 'text-emerald-600' : ''}`}>
          {stats.appliedThisWeek}<span className="text-sm font-normal text-muted-foreground">/{stats.weeklyGoal}</span>
        </p>
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${goalReached ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-600 to-teal-600'}`}
            style={{ width: `${weekPct}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">{goalReached ? '✓ Meta atingida!' : `${stats.weeklyGoal - stats.appliedThisWeek} restantes`}</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Total ativo</span>
        </div>
        <p className="text-2xl font-bold">{stats.activeCount}</p>
        <p className="text-xs text-muted-foreground mt-1">de {stats.total} total</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Em processo</span>
        </div>
        <p className="text-2xl font-bold">{stats.inProcessCount + stats.interviewCount + stats.technicalTestCount}</p>
        <div className="flex gap-2 mt-1 flex-wrap">
          {stats.interviewCount > 0 && <span className="text-xs text-purple-600">{stats.interviewCount} entrev.</span>}
          {stats.technicalTestCount > 0 && <span className="text-xs text-orange-600">{stats.technicalTestCount} teste</span>}
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-medium">Ofertas</span>
        </div>
        <p className="text-2xl font-bold text-emerald-600">{stats.offerCount}</p>
        <p className="text-xs text-muted-foreground mt-1">{stats.rejectedCount} rejeitadas</p>
      </div>
    </div>
  );
}
