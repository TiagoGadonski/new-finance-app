import { apiClient } from './client';
import { TodoItemDto, CreateTodoRequest, UpdateTodoRequest } from '@/types';

export const todosApi = {
  getAll: async (completed?: boolean): Promise<TodoItemDto[]> => {
    const params = completed !== undefined ? `?completed=${completed}` : '';
    const response = await apiClient.get<TodoItemDto[]>(`/todos${params}`);
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

  toggle: async (id: string): Promise<TodoItemDto> => {
    const response = await apiClient.post<TodoItemDto>(`/todos/${id}/toggle`);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}`);
  },
};
