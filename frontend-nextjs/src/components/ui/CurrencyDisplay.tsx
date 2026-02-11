'use client';

import { memo } from 'react';

interface CurrencyDisplayProps {
  amount: number;
  currency?: string;
  convertedAmount?: number;
  baseCurrency?: string;
  showConversion?: boolean;
  className?: string;
}

const currencySymbols: Record<string, string> = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
};

export const formatCurrency = (amount: number, currency = 'BRL'): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const CurrencyDisplay = memo(function CurrencyDisplay({
  amount,
  currency = 'BRL',
  convertedAmount,
  baseCurrency = 'BRL',
  showConversion = true,
  className,
}: CurrencyDisplayProps) {
  const symbol = currencySymbols[currency] || currency;

  return (
    <span className={className}>
      <span>{formatCurrency(amount, currency)}</span>
      {showConversion && currency !== baseCurrency && convertedAmount !== undefined && (
        <span className="text-xs opacity-60 ml-1">
          ({formatCurrency(convertedAmount, baseCurrency)})
        </span>
      )}
    </span>
  );
});
