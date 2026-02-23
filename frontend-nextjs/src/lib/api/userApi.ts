import { apiClient } from './client';

export const userApi = {
  getTelegramChatId: async (): Promise<{ telegramChatId: string | null }> => {
    const response = await apiClient.get<{ telegramChatId: string | null }>('/user/me/telegram');
    return response.data;
  },

  setTelegramChatId: async (telegramChatId: string | null): Promise<void> => {
    await apiClient.put('/user/me/telegram', { telegramChatId });
  },
};
