import api from './axios'
import type { Appointment, PaginatedResponse } from '@/types'

export interface TimeSlot {
  time: string
  available: boolean
}

export const appointmentsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Appointment>>('/appointments/', { params }),

  get: (id: number) => api.get<Appointment>(`/appointments/${id}/`),

  create: (data: Partial<Appointment>) => api.post<Appointment>('/appointments/', data),

  update: (id: number, data: Partial<Appointment>) =>
    api.patch<Appointment>(`/appointments/${id}/`, data),

  delete: (id: number) => api.delete(`/appointments/${id}/`),

  calendar: (params?: { start?: string; end?: string }) =>
    api.get<Appointment[]>('/appointments/calendar/', { params }),

  doctorAvailability: (doctorId: number, date: string) =>
    api.get<TimeSlot[]>(`/appointments/doctors/${doctorId}/availability/`, { params: { date } }),
}
