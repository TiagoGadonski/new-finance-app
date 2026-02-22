import { apiClient } from './client';
import { ReminderDto, CreateReminderRequest, UpdateReminderRequest } from '@/types';

export const remindersApi = {
  getAll: async (): Promise<ReminderDto[]> => {
    const response = await apiClient.get<ReminderDto[]>('/reminders');
    return response.data;
  },

  create: async (data: CreateReminderRequest): Promise<ReminderDto> => {
    const response = await apiClient.post<ReminderDto>('/reminders', data);
    return response.data;
  },

  update: async (id: string, data: UpdateReminderRequest): Promise<ReminderDto> => {
    const response = await apiClient.put<ReminderDto>(`/reminders/${id}`, data);
    return response.data;
  },

  toggle: async (id: string): Promise<ReminderDto> => {
    const response = await apiClient.post<ReminderDto>(`/reminders/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/reminders/${id}`);
  },
};
