import { apiClient } from './client';
import type {
  AdminUserDto,
  CreateUserRequest,
  UpdateUserRequest,
  ChangeUserPasswordRequest
} from '@/types/admin';

export const adminApi = {
  // Get all users
  getAllUsers: async (): Promise<AdminUserDto[]> => {
    const response = await apiClient.get<AdminUserDto[]>('/admin/users');
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<AdminUserDto> => {
    const response = await apiClient.get<AdminUserDto>(`/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<AdminUserDto> => {
    const response = await apiClient.post<AdminUserDto>('/admin/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<AdminUserDto> => {
    const response = await apiClient.put<AdminUserDto>(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`);
  },

  // Change user password
  changeUserPassword: async (id: string, data: ChangeUserPasswordRequest): Promise<void> => {
    await apiClient.post(`/admin/users/${id}/change-password`, data);
  },
};
