import { apiClient } from './client';
import {
  MeiDashboardDto,
  MeiAlertDto,
  CreateMeiSettingsRequest,
  MeiSettingsDto,
} from '@/types';

export const meiApi = {
  getDashboard: async (year?: number): Promise<MeiDashboardDto> => {
    const url = year ? `/Mei/dashboard/${year}` : '/Mei/dashboard';
    const response = await apiClient.get<MeiDashboardDto>(url);
    return response.data;
  },

  getAlerts: async (year: number): Promise<MeiAlertDto[]> => {
    const response = await apiClient.get<MeiAlertDto[]>(`/Mei/alerts/${year}`);
    return response.data;
  },

  configure: async (data: CreateMeiSettingsRequest): Promise<MeiSettingsDto> => {
    const response = await apiClient.post<MeiSettingsDto>('/Mei/configure', data);
    return response.data;
  },
};
