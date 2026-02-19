import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '@/api/appointments'
import type { Appointment } from '@/types'

export function useAppointments(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentsApi.list(params).then((r) => r.data),
  })
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsApi.get(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCalendarAppointments(start?: string, end?: string) {
  return useQuery({
    queryKey: ['appointments', 'calendar', start, end],
    queryFn: () => appointmentsApi.calendar({ start, end }).then((r) => r.data),
    enabled: !!start && !!end,
  })
}

export function useDoctorAvailability(doctorId: number, date: string) {
  return useQuery({
    queryKey: ['availability', doctorId, date],
    queryFn: () => appointmentsApi.doctorAvailability(doctorId, date).then((r) => r.data),
    enabled: !!doctorId && !!date,
  })
}

export function useCreateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Appointment>) => appointmentsApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}

export function useUpdateAppointment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Appointment> }) =>
      appointmentsApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
  })
}
