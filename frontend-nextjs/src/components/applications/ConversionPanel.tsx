'use client';

import { SourceConversionDto, ApplicationSource } from '@/types';

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LI Easy Apply',
  [ApplicationSource.LinkedInExternal]:  'LinkedIn → Site',
  [ApplicationSource.Strider]:           'Strider',
  [ApplicationSource.WeWorkRemotely]:    'WWR',
  [ApplicationSource.WorkingNomads]:     'WN',
  [ApplicationSource.Jobgether]:         'Jobgether',
  [ApplicationSource.CompanyWebsite]:    'Site Empresa',
  [ApplicationSource.Other]:            'Outro',
};

interface Props {
  data: SourceConversionDto[];
}

export function ConversionPanel({ data }: Props) {
  const relevant = data.filter(d => d.total > 0);
  if (relevant.length === 0) return null;

  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
        Conversão por fonte
      </h3>
      <div className="space-y-3">
        {relevant.map(item => {
          const pct = item.total > 0 ? Math.round((item.gotResponse / item.total) * 100) : 0;
          return (
            <div key={item.source} className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground w-28 shrink-0">{SOURCE_LABELS[item.source]}</span>
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground/70 tabular-nums shrink-0 w-20 text-right">
                {item.gotResponse}/{item.total} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
      {relevant.length < 3 && (
        <p className="text-xs text-muted-foreground/50 mt-4 italic">Dados mais úteis com mais candidaturas.</p>
      )}
    </div>
  );
}
