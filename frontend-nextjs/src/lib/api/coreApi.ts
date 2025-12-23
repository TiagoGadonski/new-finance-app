import { apiClient } from './client';
import {
  AccountDto,
  CategoryDto,
  TransactionDto,
  CreateTransactionRequest,
  BudgetDto,
  CreateBudgetRequest,
  SubscriptionDto,
  CreateSubscriptionRequest,
  GoalDto,
  CreateGoalRequest,
  ContributeGoalRequest,
  DebtDto,
  CreateDebtRequest,
  DebtSimulationRequest,
  DebtSimulationResult,
} from '@/types';

// Accounts
export const accountsApi = {
  getAll: async (): Promise<AccountDto[]> => {
    const response = await apiClient.get<AccountDto[]>('/Accounts');
    return response.data;
  },
};

// Categories
export const categoriesApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/Categories');
    return response.data;
  },
};

// Transactions
export const transactionsApi = {
  getAll: async (): Promise<TransactionDto[]> => {
    const response = await apiClient.get<TransactionDto[]>('/Transactions');
    return response.data;
  },

  create: async (data: CreateTransactionRequest): Promise<TransactionDto> => {
    const response = await apiClient.post<TransactionDto>('/Transactions', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Transactions/${id}`);
  },
};

// Budgets
export const budgetsApi = {
  getConsolidated: async (month: number, year: number): Promise<BudgetDto[]> => {
    const response = await apiClient.get<BudgetDto[]>(`/Budgets/consolidated/${year}/${month}`);
    return response.data;
  },

  create: async (data: CreateBudgetRequest): Promise<BudgetDto> => {
    const response = await apiClient.post<BudgetDto>('/Budgets', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Budgets/${id}`);
  },
};

// Subscriptions
export const subscriptionsApi = {
  getAll: async (): Promise<SubscriptionDto[]> => {
    const response = await apiClient.get<SubscriptionDto[]>('/Subscriptions');
    return response.data;
  },

  create: async (data: CreateSubscriptionRequest): Promise<SubscriptionDto> => {
    const response = await apiClient.post<SubscriptionDto>('/Subscriptions', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Subscriptions/${id}`);
  },

  toggleActive: async (id: string): Promise<SubscriptionDto> => {
    const response = await apiClient.patch<SubscriptionDto>(`/Subscriptions/${id}/toggle`);
    return response.data;
  },

  processBillings: async (): Promise<{ processedCount: number; message: string }> => {
    const response = await apiClient.post('/Subscriptions/process-billings');
    return response.data;
  },
};

// Goals
export const goalsApi = {
  getAll: async (): Promise<GoalDto[]> => {
    const response = await apiClient.get<GoalDto[]>('/Goals');
    return response.data;
  },

  create: async (data: CreateGoalRequest): Promise<GoalDto> => {
    const response = await apiClient.post<GoalDto>('/Goals', data);
    return response.data;
  },

  contribute: async (id: string, data: ContributeGoalRequest): Promise<GoalDto> => {
    const response = await apiClient.post<GoalDto>(`/Goals/${id}/contribute`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Goals/${id}`);
  },
};

// Debts
export const debtsApi = {
  getAll: async (): Promise<DebtDto[]> => {
    const response = await apiClient.get<DebtDto[]>('/Debts');
    return response.data;
  },

  create: async (data: CreateDebtRequest): Promise<DebtDto> => {
    const response = await apiClient.post<DebtDto>('/Debts', data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Debts/${id}`);
  },

  simulate: async (data: DebtSimulationRequest): Promise<DebtSimulationResult> => {
    const response = await apiClient.post<DebtSimulationResult>('/Debts/simulate', data);
    return response.data;
  },
};
