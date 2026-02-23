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
  newFamilyName?: string;    // creates a new family for this user
  existingFamilyId?: string; // adds user to an existing family (takes priority over newFamilyName)
}

export interface FamilyDto {
  id: string;
  name: string;
  isActive: boolean;
  userCount: number;
  createdAt: string;
}

export interface UpdateUserRequest {
  name?: string;
  role?: 'User' | 'Admin';
  isMeiEnabled?: boolean;
}

export interface ChangeUserPasswordRequest {
  newPassword: string;
}
