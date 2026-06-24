'use client';

import { SourceConversionDto, ApplicationSource } from '@/types';

const SOURCE_LABELS: Record<ApplicationSource, string> = {
  [ApplicationSource.LinkedInEasyApply]: 'LI Easy Apply',
  [ApplicationSource.LinkedInExternal]: 'LI → Site',
  [ApplicationSource.Strider]: 'Strider',
  [ApplicationSource.WeWorkRemotely]: 'WWR',
  [ApplicationSource.WorkingNomads]: 'WN',
  [ApplicationSource.Jobgether]: 'Jobgether',
  [ApplicationSource.CompanyWebsite]: 'Site Empresa',
  [ApplicationSource.Other]: 'Outro',
};

interface Props {
  data: SourceConversionDto[];
}

export function ConversionPanel({ data }: Props) {
  const relevant = data.filter(d => d.total > 0);
  if (relevant.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Conversão por fonte</h3>
      <div className="space-y-2">
        {relevant.map(item => {
          const pct = item.total > 0 ? Math.round((item.gotResponse / item.total) * 100) : 0;
          return (
            <div key={item.source} className="flex items-center gap-3">
              <span className="text-xs font-medium w-28 shrink-0">{SOURCE_LABELS[item.source]}</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0 w-20 text-right">
                {item.gotResponse}/{item.total} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
      {relevant.length < 3 && (
        <p className="text-xs text-muted-foreground mt-3 italic">Dados mais úteis com mais candidaturas.</p>
      )}
    </div>
  );
}
