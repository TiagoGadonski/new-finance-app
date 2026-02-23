export interface AdminUserDto {
  id: string;
  name: string;
  username: string;
  familyId: string;
  familyName: string;
  role: 'User' | 'Admin';
  isMeiEnabled: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateUserRequest {
  name: string;
  username: string;
  password: string;
  role: 'User' | 'Admin';
  newFamilyName?: string; // if provided, creates a new family for this user
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'User' | 'Admin';
  isMeiEnabled?: boolean;
}

export interface ChangeUserPasswordRequest {
  newPassword: string;
}
