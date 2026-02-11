import { apiClient } from './client';
import { NotificationDto } from '@/types';

export const notificationsApi = {
  getAll: async (page = 1, pageSize = 20): Promise<NotificationDto[]> => {
    const response = await apiClient.get<NotificationDto[]>(`/Notifications?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<number>('/Notifications/unread-count');
    return response.data;
  },

  markAsRead: async (id: string): Promise<void> => {
    await apiClient.patch(`/Notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.patch('/Notifications/read-all');
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/Notifications/${id}`);
  },
};
