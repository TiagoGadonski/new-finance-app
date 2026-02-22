import { apiClient } from './client';
import { ClassificationRuleDto, CreateClassificationRuleRequest, UpdateClassificationRuleRequest, CategorySuggestionDto } from '@/types';

export const classificationRulesApi = {
  getAll: async (): Promise<ClassificationRuleDto[]> => {
    const response = await apiClient.get<ClassificationRuleDto[]>('/classification-rules');
    return response.data;
  },

  create: async (data: CreateClassificationRuleRequest): Promise<ClassificationRuleDto> => {
    const response = await apiClient.post<ClassificationRuleDto>('/classification-rules', data);
    return response.data;
  },

  update: async (id: string, data: UpdateClassificationRuleRequest): Promise<ClassificationRuleDto> => {
    const response = await apiClient.put<ClassificationRuleDto>(`/classification-rules/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/classification-rules/${id}`);
  },

  suggest: async (description: string): Promise<CategorySuggestionDto> => {
    const response = await apiClient.get<CategorySuggestionDto>(`/classification-rules/suggest?description=${encodeURIComponent(description)}`);
    return response.data;
  },
};
