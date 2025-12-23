export interface AdminUserDto {
  id: string;
  name: string;
  email: string;
  role: 'User' | 'Admin';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'User' | 'Admin';
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  role: 'User' | 'Admin';
}

export interface ChangeUserPasswordRequest {
  newPassword: string;
}
