import { apiClient } from './client';
import {
  InvestmentDto,
  CreateInvestmentRequest,
  UpdateInvestmentRequest,
  InvestmentTransactionDto,
  CreateInvestmentTransactionRequest,
  InvestmentSummaryDto,
} from '@/types';

export const investmentsApi = {
  getAll: async (): Promise<InvestmentDto[]> => {
    const response = await apiClient.get<InvestmentDto[]>('/Investments');
    return response.data;
  },

  create: async (data: CreateInvestmentRequest): Promise<InvestmentDto> => {
    const response = await apiClient.post<InvestmentDto>('/Investments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateInvestmentRequest): Promise<InvestmentDto> => {
    const response = await apiClient.put<InvestmentDto>(`/Investments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Investments/${id}`);
  },

  getTransactions: async (id: string): Promise<InvestmentTransactionDto[]> => {
    const response = await apiClient.get<InvestmentTransactionDto[]>(`/Investments/${id}/transactions`);
    return response.data;
  },

  addTransaction: async (id: string, data: CreateInvestmentTransactionRequest): Promise<InvestmentTransactionDto> => {
    const response = await apiClient.post<InvestmentTransactionDto>(`/Investments/${id}/transactions`, data);
    return response.data;
  },

  getSummary: async (): Promise<InvestmentSummaryDto> => {
    const response = await apiClient.get<InvestmentSummaryDto>('/Investments/summary');
    return response.data;
  },
};
