'use client';

import { CheckSquare } from 'lucide-react';

const ITEMS = [
  'É remoto e aceita LATAM/Brasil?',
  'Nível compatível (mid / mid-senior)?',
  'Stack bate (.NET / C# / full-stack)?',
  'Paga em dólar/euro ou acima do atual?',
  'Empresa parece legítima?',
];

export function ChecklistPanel() {
  return (
    <div className="bg-card border border-border/60 rounded-2xl p-4 shadow-sm">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2 mb-3">
        <CheckSquare className="w-3.5 h-3.5" />
        Vale aplicar?
      </h3>
      <ul className="space-y-2.5">
        {ITEMS.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground">
            <span className="mt-0.5 w-3.5 h-3.5 rounded border border-border/60 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
