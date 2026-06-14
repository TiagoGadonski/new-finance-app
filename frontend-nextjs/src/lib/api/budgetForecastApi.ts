import { apiClient } from './client';
import { BudgetForecastResultDto, RecurringIncomeDto, CreateRecurringIncomeRequest, UpdateRecurringIncomeRequest } from '@/types';

export const budgetForecastApi = {
  getForecast: async (months = 6, initialBalance?: number): Promise<BudgetForecastResultDto> => {
    const params = new URLSearchParams({ months: String(months) });
    if (initialBalance !== undefined) params.set('initialBalance', String(initialBalance));
    const response = await apiClient.get<BudgetForecastResultDto>(`/budget-forecast?${params}`);
    return response.data;
  },

  getIncomes: async (): Promise<RecurringIncomeDto[]> => {
    const response = await apiClient.get<RecurringIncomeDto[]>('/recurring-income');
    return response.data;
  },

  createIncome: async (data: CreateRecurringIncomeRequest): Promise<RecurringIncomeDto> => {
    const response = await apiClient.post<RecurringIncomeDto>('/recurring-income', data);
    return response.data;
  },

  updateIncome: async (id: string, data: UpdateRecurringIncomeRequest): Promise<RecurringIncomeDto> => {
    const response = await apiClient.put<RecurringIncomeDto>(`/recurring-income/${id}`, data);
    return response.data;
  },

  deleteIncome: async (id: string): Promise<void> => {
    await apiClient.delete(`/recurring-income/${id}`);
  },
};
