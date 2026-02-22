import { apiClient } from './client';
import { ExpenseSplitDto, CreateExpenseSplitRequest } from '@/types';

export const expenseSplitsApi = {
  getAll: async (): Promise<ExpenseSplitDto[]> => {
    const response = await apiClient.get<ExpenseSplitDto[]>('/expense-splits');
    return response.data;
  },

  create: async (data: CreateExpenseSplitRequest): Promise<ExpenseSplitDto> => {
    const response = await apiClient.post<ExpenseSplitDto>('/expense-splits', data);
    return response.data;
  },

  markPaid: async (splitId: string, itemId: string): Promise<ExpenseSplitDto> => {
    const response = await apiClient.post<ExpenseSplitDto>(`/expense-splits/${splitId}/items/${itemId}/mark-paid`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/expense-splits/${id}`);
  },
};
