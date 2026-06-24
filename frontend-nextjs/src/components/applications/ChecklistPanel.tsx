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
    <div className="bg-card border border-border rounded-xl p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
        <CheckSquare className="w-4 h-4" />
        Vale aplicar?
      </h3>
      <ul className="space-y-2">
        {ITEMS.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 w-4 h-4 rounded border border-border shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
