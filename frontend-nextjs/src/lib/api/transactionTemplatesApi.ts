import { apiClient } from './client';
import {
  TransactionTemplateDto,
  CreateTransactionTemplateRequest,
  UpdateTransactionTemplateRequest,
  TransactionDto,
} from '@/types';

export const transactionTemplatesApi = {
  getAll: async (): Promise<TransactionTemplateDto[]> => {
    const response = await apiClient.get<TransactionTemplateDto[]>('/transaction-templates');
    return response.data;
  },

  create: async (data: CreateTransactionTemplateRequest): Promise<TransactionTemplateDto> => {
    const response = await apiClient.post<TransactionTemplateDto>('/transaction-templates', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTransactionTemplateRequest): Promise<TransactionTemplateDto> => {
    const response = await apiClient.put<TransactionTemplateDto>(`/transaction-templates/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/transaction-templates/${id}`);
  },

  apply: async (id: string): Promise<TransactionDto> => {
    const response = await apiClient.post<TransactionDto>(`/transaction-templates/${id}/apply`);
    return response.data;
  },
};
