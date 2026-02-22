import { apiClient } from './client';
import { AlertConfigurationDto, CreateAlertConfigurationRequest, UpdateAlertConfigurationRequest } from '@/types';

export const alertConfigurationsApi = {
  getAll: async (): Promise<AlertConfigurationDto[]> => {
    const response = await apiClient.get<AlertConfigurationDto[]>('/alert-configurations');
    return response.data;
  },

  create: async (data: CreateAlertConfigurationRequest): Promise<AlertConfigurationDto> => {
    const response = await apiClient.post<AlertConfigurationDto>('/alert-configurations', data);
    return response.data;
  },

  update: async (id: string, data: UpdateAlertConfigurationRequest): Promise<AlertConfigurationDto> => {
    const response = await apiClient.put<AlertConfigurationDto>(`/alert-configurations/${id}`, data);
    return response.data;
  },

  toggle: async (id: string): Promise<AlertConfigurationDto> => {
    const response = await apiClient.post<AlertConfigurationDto>(`/alert-configurations/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/alert-configurations/${id}`);
  },
};
