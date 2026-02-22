import { apiClient } from './client';
import {
  AccountDto,
  CategoryDto,
  TransactionDto,
  CreateTransactionRequest,
  UpdateTransactionRequest,
  CreateAccountRequest,
  UpdateAccountRequest,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  BudgetDto,
  BudgetConsolidatedDto,
  CreateBudgetRequest,
  UpdateBudgetRequest,
  SubscriptionDto,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  GoalDto,
  CreateGoalRequest,
  UpdateGoalRequest,
  ContributeGoalRequest,
  DebtDto,
  CreateDebtRequest,
  UpdateDebtRequest,
  DebtSimulationRequest,
  DebtSimulationResult,
} from '@/types';

// Accounts
export const accountsApi = {
  getAll: async (): Promise<AccountDto[]> => {
    const response = await apiClient.get<AccountDto[]>('/Accounts');
    return response.data;
  },

  create: async (data: CreateAccountRequest): Promise<AccountDto> => {
    const response = await apiClient.post<AccountDto>('/Accounts', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAccountRequest): Promise<AccountDto> => {
    const response = await apiClient.put<AccountDto>(`/Accounts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Accounts/${id}`);
  },
};

// Categories
export const categoriesApi = {
  getAll: async (): Promise<CategoryDto[]> => {
    const response = await apiClient.get<CategoryDto[]>('/Categories');
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<CategoryDto> => {
    const response = await apiClient.post<CategoryDto>('/Categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<CategoryDto> => {
    const response = await apiClient.put<CategoryDto>(`/Categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Categories/${id}`);
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

  update: async (id: string, data: UpdateTransactionRequest): Promise<TransactionDto> => {
    const response = await apiClient.put<TransactionDto>(`/Transactions/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Transactions/${id}`);
  },
};

// Budgets
export const budgetsApi = {
  getAll: async (): Promise<BudgetDto[]> => {
    const response = await apiClient.get<BudgetDto[]>('/Budgets');
    return response.data;
  },

  getConsolidated: async (month: number, year: number): Promise<BudgetConsolidatedDto> => {
    const response = await apiClient.get<BudgetConsolidatedDto>(`/Budgets/consolidated/${year}/${month}`);
    return response.data;
  },

  create: async (data: CreateBudgetRequest): Promise<BudgetDto> => {
    const response = await apiClient.post<BudgetDto>('/Budgets', data);
    return response.data;
  },

  update: async (id: string, data: UpdateBudgetRequest): Promise<BudgetDto> => {
    const response = await apiClient.put<BudgetDto>(`/Budgets/${id}`, data);
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

  update: async (id: string, data: UpdateSubscriptionRequest): Promise<SubscriptionDto> => {
    const response = await apiClient.put<SubscriptionDto>(`/Subscriptions/${id}`, data);
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

  markPaid: async (id: string): Promise<SubscriptionDto> => {
    const response = await apiClient.patch<SubscriptionDto>(`/Subscriptions/${id}/mark-paid`);
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

  update: async (id: string, data: UpdateGoalRequest): Promise<GoalDto> => {
    const response = await apiClient.put<GoalDto>(`/Goals/${id}`, data);
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

  update: async (id: string, data: UpdateDebtRequest): Promise<DebtDto> => {
    const response = await apiClient.put<DebtDto>(`/Debts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Debts/${id}`);
  },

  simulate: async (data: DebtSimulationRequest): Promise<DebtSimulationResult> => {
    const response = await apiClient.post<DebtSimulationResult>('/Debts/simulate', data);
    return response.data;
  },

  markPaid: async (id: string): Promise<DebtDto> => {
    const response = await apiClient.patch<DebtDto>(`/Debts/${id}/mark-paid`);
    return response.data;
  },
};
