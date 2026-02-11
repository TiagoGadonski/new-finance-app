import { apiClient } from './client';
import { CurrencyConversionResult } from '@/types';

export const currencyApi = {
  getRates: async (baseCurrency = 'BRL'): Promise<Record<string, number>> => {
    const response = await apiClient.get<Record<string, number>>(`/Currency/rates?base=${baseCurrency}`);
    return response.data;
  },

  convert: async (from: string, to: string, amount: number): Promise<CurrencyConversionResult> => {
    const response = await apiClient.get<CurrencyConversionResult>(
      `/Currency/convert?from=${from}&to=${to}&amount=${amount}`
    );
    return response.data;
  },

  refresh: async (baseCurrency = 'BRL'): Promise<void> => {
    await apiClient.post(`/Currency/refresh?base=${baseCurrency}`);
  },
};
