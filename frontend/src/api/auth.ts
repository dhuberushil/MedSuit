import api from './axios'
import type { User } from '@/types'

export const authApi = {
  login: (username: string, password: string) =>
    api.post<{ access: string; refresh: string }>('/auth/token/', { username, password }),

  register: (data: {
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    role?: string
  }) => api.post('/auth/register/', data),

  refresh: (refresh: string) =>
    api.post<{ access: string; refresh?: string }>('/auth/token/refresh/', { refresh }),

  me: () => api.get<User>('/auth/me/'),

  updateProfile: (data: Partial<User>) => api.patch<User>('/auth/me/', data),

  changePassword: (old_password: string, new_password: string) =>
    api.post('/auth/change-password/', { old_password, new_password }),

  logout: () => api.post('/auth/logout/'),
}
