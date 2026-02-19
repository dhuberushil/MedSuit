import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { patientsApi } from '@/api/patients'
import type { Patient, MedicalRecord } from '@/types'

export function usePatients(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['patients', params],
    queryFn: () => patientsApi.list(params).then((r) => r.data),
  })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientsApi.get(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Patient>) => patientsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useUpdatePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Patient> }) =>
      patientsApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useDeletePatient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => patientsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients'] }),
  })
}

export function useCreateMedicalRecord(patientId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<MedicalRecord>) =>
      patientsApi.createMedicalRecord(patientId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['patients', patientId] }),
  })
}
