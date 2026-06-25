'use client';

import { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { ApplicationSource, SourceConversionDto } from '@/types';

const SITES = [
  { name: 'Strider', url: 'https://www.onstrider.com', source: ApplicationSource.Strider },
  { name: 'We Work Remotely', url: 'https://weworkremotely.com', source: ApplicationSource.WeWorkRemotely },
  { name: 'Working Nomads', url: 'https://www.workingnomads.com/remote-dotnet-jobs', source: ApplicationSource.WorkingNomads },
  { name: 'Jobgether (LATAM)', url: 'https://jobgether.com/remote-jobs/latam/net-developer', source: ApplicationSource.Jobgether },
  { name: 'Arc.dev', url: 'https://arc.dev/remote-jobs/dot-net', source: null },
  { name: 'Remotive', url: 'https://remotive.com/remote-net-jobs', source: null },
  { name: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs', source: ApplicationSource.LinkedInExternal },
  { name: 'RemoteOK', url: 'https://remoteok.com/remote-dot-net-jobs', source: null },
  { name: 'Wellfound', url: 'https://wellfound.com', source: null },
] as const;

interface Props {
  conversionData?: SourceConversionDto[];
}

export function JobSitesPanel({ conversionData = [] }: Props) {
  const [open, setOpen] = useState(false);

  const countFor = (source: ApplicationSource | null) => {
    if (source === null) return null;
    const entry = conversionData.find(d => d.source === source);
    return entry?.total ?? 0;
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>Onde buscar vagas</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border divide-y divide-border/60">
          {SITES.map(site => {
            const count = countFor(site.source);
            return (
              <a
                key={site.name}
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors group"
              >
                <span className="text-sm text-foreground group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {site.name}
                </span>
                <div className="flex items-center gap-2">
                  {count !== null && count > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                  <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 transition-colors" />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
