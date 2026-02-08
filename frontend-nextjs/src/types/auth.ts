export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  name: string;
  username: string;
  password: string;
  familyName?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserDto;
}

export interface UserDto {
  id: string;
  name: string;
  username: string;
  familyId: string;
  familyName: string;
  role: 'User' | 'Admin';
}
