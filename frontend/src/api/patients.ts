import api from './axios'
import type { Patient, MedicalRecord, PaginatedResponse } from '@/types'

export const patientsApi = {
  list: (params?: Record<string, string>) =>
    api.get<PaginatedResponse<Patient>>('/patients/', { params }),

  get: (id: number) => api.get<Patient & { medical_records: MedicalRecord[] }>(`/patients/${id}/`),

  create: (data: Partial<Patient>) => api.post<Patient>('/patients/', data),

  update: (id: number, data: Partial<Patient>) => api.patch<Patient>(`/patients/${id}/`, data),

  delete: (id: number) => api.delete(`/patients/${id}/`),

  getMedicalRecords: (patientId: number) =>
    api.get<MedicalRecord[]>(`/patients/${patientId}/medical_records/`),

  createMedicalRecord: (patientId: number, data: Partial<MedicalRecord>) =>
    api.post<MedicalRecord>(`/patients/${patientId}/medical_records/`, data),
}
