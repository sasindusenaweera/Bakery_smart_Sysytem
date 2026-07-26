export type UserRole = 'OWNER' | 'CASHIER' | 'BAKER' | 'STOREKEEPER';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  role: string;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

export interface ValidationError {
  status: number;
  message: string;
  errors: Record<string, string>;
  timestamp: string;
}
