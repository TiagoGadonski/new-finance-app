export interface AdminUserDto {
  id: string;
  name: string;
  username: string;
  familyId: string;
  familyName: string;
  role: 'User' | 'Admin';
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  password: string;
  role: 'User' | 'Admin';
  familyId?: string;
}

export interface UpdateUserRequest {
  name: string;
  username: string;
  role: 'User' | 'Admin';
}

export interface ChangeUserPasswordRequest {
  newPassword: string;
}
