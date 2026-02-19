import api from './axios'
import type { Invoice, Payment, PaginatedResponse } from '@/types'

export const billingApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Invoice>>('/billing/invoices/', { params }),

  get: (id: number) => api.get<Invoice>(`/billing/invoices/${id}/`),

  create: (data: Record<string, unknown>) => api.post<Invoice>('/billing/invoices/', data),

  update: (id: number, data: Record<string, unknown>) => api.patch<Invoice>(`/billing/invoices/${id}/`, data),

  delete: (id: number) => api.delete(`/billing/invoices/${id}/`),

  getPdf: (id: number) =>
    api.get(`/billing/invoices/${id}/pdf/`, { responseType: 'blob' }),

  getPayments: (invoiceId: number) =>
    api.get<Payment[]>(`/billing/invoices/${invoiceId}/payments/`),

  createPayment: (invoiceId: number, data: Partial<Payment>) =>
    api.post<Payment>(`/billing/invoices/${invoiceId}/payments/`, data),
}
