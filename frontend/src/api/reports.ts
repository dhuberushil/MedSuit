import api from './axios'
import type { DashboardStats } from '@/types'

export const reportsApi = {
  dashboard: () => api.get<DashboardStats>('/reports/dashboard/'),

  patientStats: () => api.get<{
    gender_distribution: { gender: string; count: number }[]
    blood_group_distribution: { blood_group: string; count: number }[]
    monthly_registrations: { month: string; count: number }[]
  }>('/reports/patient-stats/'),

  appointmentStats: () => api.get<{
    status_distribution: { status: string; count: number }[]
    monthly_appointments: { month: string; count: number }[]
  }>('/reports/appointment-stats/'),

  revenueStats: () => api.get<{
    monthly_revenue: { month: string; revenue: number }[]
    by_status: { status: string; count: number; total: number }[]
  }>('/reports/revenue-stats/'),
}
