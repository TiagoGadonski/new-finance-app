import { apiClient } from './client';
import { TodoItemDto, TodoCommentDto, TodoStatsDto, CreateTodoRequest, UpdateTodoRequest, AddTodoCommentRequest } from '@/types';

export const todosApi = {
  getAll: async (params?: { completed?: boolean; category?: number }): Promise<TodoItemDto[]> => {
    const q = new URLSearchParams();
    if (params?.completed !== undefined) q.set('completed', String(params.completed));
    if (params?.category !== undefined) q.set('category', String(params.category));
    const response = await apiClient.get<TodoItemDto[]>(`/todos${q.toString() ? '?' + q : ''}`);
    return response.data;
  },

  getById: async (id: string): Promise<TodoItemDto> => {
    const response = await apiClient.get<TodoItemDto>(`/todos/${id}`);
    return response.data;
  },

  getStats: async (): Promise<TodoStatsDto> => {
    const response = await apiClient.get<TodoStatsDto>('/todos/stats');
    return response.data;
  },

  create: async (data: CreateTodoRequest): Promise<TodoItemDto> => {
    const response = await apiClient.post<TodoItemDto>('/todos', data);
    return response.data;
  },

  update: async (id: string, data: UpdateTodoRequest): Promise<TodoItemDto> => {
    const response = await apiClient.put<TodoItemDto>(`/todos/${id}`, data);
    return response.data;
  },

  markDone: async (id: string): Promise<TodoItemDto> => {
    const response = await apiClient.post<TodoItemDto>(`/todos/${id}/done`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },

  addComment: async (id: string, data: AddTodoCommentRequest): Promise<TodoCommentDto> => {
    const response = await apiClient.post<TodoCommentDto>(`/todos/${id}/comments`, data);
    return response.data;
  },
};
