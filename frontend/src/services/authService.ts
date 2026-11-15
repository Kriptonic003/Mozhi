import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  async register(data: { username: string; email: string; password: string }): Promise<User> {
    const res = await api.post<User>('/auth/register', data);
    return res.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/auth/login', data);
    localStorage.setItem('mozhi_access_token', res.data.access_token);
    localStorage.setItem('mozhi_user', JSON.stringify(res.data.user));
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/auth/me');
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('mozhi_access_token');
    localStorage.removeItem('mozhi_user');
  },

  getStoredUser(): User | null {
    const raw = localStorage.getItem('mozhi_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('mozhi_access_token');
  },
};
