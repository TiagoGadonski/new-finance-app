import { apiClient } from './client';
import type {
  WorkCalendarSettingsDto,
  CreateOrUpdateSettingsRequest,
  MonthSummaryDto,
  WorkDayDto,
  HolidayDto,
  CreateHolidayRequest,
  UpdateHolidayRequest,
} from '@/types/workCalendar';

export const workCalendarApi = {
  getSettings: async (): Promise<WorkCalendarSettingsDto> => {
    const response = await apiClient.get<WorkCalendarSettingsDto>('/WorkCalendar/settings');
    return response.data;
  },

  updateSettings: async (data: CreateOrUpdateSettingsRequest): Promise<WorkCalendarSettingsDto> => {
    const response = await apiClient.put<WorkCalendarSettingsDto>('/WorkCalendar/settings', data);
    return response.data;
  },

  getMonthSummary: async (year: number, month: number): Promise<MonthSummaryDto> => {
    const response = await apiClient.get<MonthSummaryDto>(`/WorkCalendar/month?year=${year}&month=${month}`);
    return response.data;
  },

  toggleWorkDay: async (date: string): Promise<WorkDayDto | null> => {
    const response = await apiClient.post<WorkDayDto | null>('/WorkCalendar/toggle', { date });
    return response.data;
  },

  getHolidays: async (): Promise<HolidayDto[]> => {
    const response = await apiClient.get<HolidayDto[]>('/WorkCalendar/holidays');
    return response.data;
  },

  createHoliday: async (data: CreateHolidayRequest): Promise<HolidayDto> => {
    const response = await apiClient.post<HolidayDto>('/WorkCalendar/holidays', data);
    return response.data;
  },

  updateHoliday: async (id: string, data: UpdateHolidayRequest): Promise<HolidayDto> => {
    const response = await apiClient.put<HolidayDto>(`/WorkCalendar/holidays/${id}`, data);
    return response.data;
  },

  deleteHoliday: async (id: string): Promise<void> => {
    await apiClient.delete(`/WorkCalendar/holidays/${id}`);
  },

  resetHolidays: async (): Promise<HolidayDto[]> => {
    const response = await apiClient.post<HolidayDto[]>('/WorkCalendar/holidays/reset');
    return response.data;
  },
};
