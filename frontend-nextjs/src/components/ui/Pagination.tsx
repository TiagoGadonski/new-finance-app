'use client';

import { memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export const Pagination = memo(function Pagination({ currentPage, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </Button>
      <span className="text-sm px-3 py-1 rounded-lg" style={{ backgroundColor: 'var(--background-secondary)', color: 'var(--foreground)' }}>
        {currentPage} / {totalPages}
      </span>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Próximo
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
});
