'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui';

interface YearSelectorProps {
  selectedYear: number;
  onYearChange: (year: number) => void;
}

export function YearSelector({ selectedYear, onYearChange }: YearSelectorProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="flex items-center justify-between bg-white rounded-lg shadow-md p-4 border border-gray-200">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onYearChange(selectedYear - 1)}
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <h2 className="text-2xl font-bold text-gray-900">{selectedYear}</h2>

      <Button
        variant="ghost"
        size="sm"
        onClick={() => onYearChange(selectedYear + 1)}
        disabled={selectedYear >= currentYear}
      >
        <ChevronRight className="w-5 h-5" />
      </Button>
    </div>
  );
}
