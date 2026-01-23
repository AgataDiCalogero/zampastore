export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}
export interface AuthResponse {
  user: AuthUser;
  token?: string;
}
