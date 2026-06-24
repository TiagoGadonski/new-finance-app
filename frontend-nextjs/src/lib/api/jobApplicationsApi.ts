import { apiClient } from './client';
import {
  JobApplicationDto,
  CreateJobApplicationRequest,
  UpdateJobApplicationRequest,
  JobApplicationStatsDto,
  JobAnalysisResultDto,
  ApplicationStatus,
} from '@/types';

export const jobApplicationsApi = {
  getAll: async (): Promise<JobApplicationDto[]> => {
    const response = await apiClient.get<JobApplicationDto[]>('/JobApplications');
    return response.data;
  },

  getStats: async (): Promise<JobApplicationStatsDto> => {
    const response = await apiClient.get<JobApplicationStatsDto>('/JobApplications/stats');
    return response.data;
  },

  create: async (data: CreateJobApplicationRequest): Promise<JobApplicationDto> => {
    const response = await apiClient.post<JobApplicationDto>('/JobApplications', data);
    return response.data;
  },

  update: async (id: string, data: UpdateJobApplicationRequest): Promise<JobApplicationDto> => {
    const response = await apiClient.put<JobApplicationDto>(`/JobApplications/${id}`, data);
    return response.data;
  },

  patchStatus: async (id: string, status: ApplicationStatus): Promise<JobApplicationDto> => {
    const response = await apiClient.patch<JobApplicationDto>(`/JobApplications/${id}/status`, { status });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/JobApplications/${id}`);
  },

  analyze: async (jobText: string): Promise<JobAnalysisResultDto> => {
    const response = await apiClient.post<JobAnalysisResultDto>('/JobApplications/analyze', { jobText });
    return response.data;
  },
};
