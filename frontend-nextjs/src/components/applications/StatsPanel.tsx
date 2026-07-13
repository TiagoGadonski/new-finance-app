'use client';

import { JobApplicationStatsDto } from '@/types';
import { Target, TrendingUp, Users, Trophy } from 'lucide-react';

interface Props {
  stats: JobApplicationStatsDto;
}

export function StatsPanel({ stats }: Props) {
  const weekPct = Math.min(100, Math.round((stats.appliedThisWeek / stats.weeklyGoal) * 100));
  const goalReached = stats.appliedThisWeek >= stats.weeklyGoal;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Meta semanal */}
      <div className={`rounded-2xl border p-4 ${goalReached ? 'border-emerald-200 dark:border-emerald-800/50' : 'border-border/60'} bg-card shadow-sm`}>
        <div className="flex items-center gap-1.5 mb-3">
          <Target className={`w-3.5 h-3.5 ${goalReached ? 'text-emerald-500' : 'text-muted-foreground/60'}`} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Semana</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {stats.appliedThisWeek}
          <span className="text-sm font-normal text-muted-foreground">/{stats.weeklyGoal}</span>
        </p>
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${goalReached ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-500'}`}
            style={{ width: `${weekPct}%` }}
          />
        </div>
        <p className={`text-xs mt-1.5 ${goalReached ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-muted-foreground/70'}`}>
          {goalReached ? '✓ Meta atingida' : `${stats.weeklyGoal - stats.appliedThisWeek} restantes`}
        </p>
      </div>

      {/* Total ativo */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <TrendingUp className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Total ativo</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">{stats.activeCount}</p>
        <p className="text-xs text-muted-foreground/70 mt-1.5">de {stats.total} total</p>
      </div>

      {/* Em processo */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Users className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Em processo</span>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {stats.inProcessCount + stats.interviewCount + stats.technicalTestCount}
        </p>
        <div className="flex gap-2 mt-1.5 flex-wrap">
          {stats.interviewCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 font-medium">
              {stats.interviewCount} entrev.
            </span>
          )}
          {stats.technicalTestCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
              {stats.technicalTestCount} teste
            </span>
          )}
        </div>
      </div>

      {/* Ofertas */}
      <div className="rounded-2xl border border-border/60 bg-card shadow-sm p-4">
        <div className="flex items-center gap-1.5 mb-3">
          <Trophy className="w-3.5 h-3.5 text-muted-foreground/60" />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Ofertas</span>
        </div>
        <p className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{stats.offerCount}</p>
        <p className="text-xs text-muted-foreground/70 mt-1.5">{stats.rejectedCount} rejeitadas</p>
      </div>
    </div>
  );
}
