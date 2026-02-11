import { apiClient } from './client';
import {
  MonthlyReportDto,
  CashFlowForecastDto,
  PeriodComparisonDto,
  DuplicateTransactionGroupDto,
  TransactionDto,
} from '@/types';

export const reportsApi = {
  getMonthlyReport: async (month: number, year: number): Promise<MonthlyReportDto> => {
    const response = await apiClient.get<MonthlyReportDto>(`/Reports/monthly?month=${month}&year=${year}`);
    return response.data;
  },

  getCashFlow: async (months = 3): Promise<CashFlowForecastDto> => {
    const response = await apiClient.get<CashFlowForecastDto>(`/Reports/cashflow?months=${months}`);
    return response.data;
  },

  getComparison: async (month1: number, year1: number, month2: number, year2: number): Promise<PeriodComparisonDto> => {
    const response = await apiClient.get<PeriodComparisonDto>(
      `/Reports/comparison?month1=${month1}&year1=${year1}&month2=${month2}&year2=${year2}`
    );
    return response.data;
  },

  getDuplicates: async (): Promise<DuplicateTransactionGroupDto[]> => {
    const response = await apiClient.get<DuplicateTransactionGroupDto[]>('/Transactions/duplicates');
    return response.data;
  },

  generateRecurring: async (): Promise<TransactionDto[]> => {
    const response = await apiClient.post<TransactionDto[]>('/Transactions/recurring/generate');
    return response.data;
  },
};
