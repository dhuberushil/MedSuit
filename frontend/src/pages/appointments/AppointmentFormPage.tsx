import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAppointment, useDoctorAvailability } from '@/hooks/useAppointments'
import { usePatients } from '@/hooks/usePatients'
import { useQuery } from '@tanstack/react-query'
import api from '@/api/axios'
import type { DoctorProfile } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const appointmentSchema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  doctor: z.string().min(1, 'Doctor is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Time slot is required'),
  reason: z.string().optional(),
})

type AppointmentForm = z.infer<typeof appointmentSchema>

export function AppointmentFormPage() {
  const navigate = useNavigate()
  const createMutation = useCreateAppointment()
  const { data: patientsData } = usePatients({ page: '1' })
  const { data: doctors } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => api.get<DoctorProfile[]>('/auth/doctors/').then((r) => r.data),
  })

  const [selectedDoctor, setSelectedDoctor] = useState<number>(0)
  const [selectedDate, setSelectedDate] = useState('')

  const { data: slots } = useDoctorAvailability(selectedDoctor, selectedDate)

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<AppointmentForm>({
    resolver: zodResolver(appointmentSchema),
  })

  const selectedTime = watch('start_time')

  const onSubmit = async (data: AppointmentForm) => {
    await createMutation.mutateAsync({
      patient: Number(data.patient),
      doctor: Number(data.doctor),
      date: data.date,
      start_time: data.start_time,
      reason: data.reason,
    })
    navigate('/appointments')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Book Appointment</h1>

      <Card>
        <CardHeader><CardTitle className="text-base">Appointment Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Patient</Label>
              <Select {...register('patient')}>
                <option value="">Select patient</option>
                {patientsData?.results?.map((p) => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </Select>
              {errors.patient && <p className="text-sm text-destructive">{errors.patient.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Doctor</Label>
              <Select
                {...register('doctor')}
                onChange={(e) => {
                  register('doctor').onChange(e)
                  setSelectedDoctor(Number(e.target.value))
                }}
              >
                <option value="">Select doctor</option>
                {doctors?.map((d) => (
                  <option key={d.id} value={d.user.id}>
                    Dr. {d.user.first_name} {d.user.last_name} - {d.specialization}
                  </option>
                ))}
              </Select>
              {errors.doctor && <p className="text-sm text-destructive">{errors.doctor.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                {...register('date')}
                onChange={(e) => {
                  register('date').onChange(e)
                  setSelectedDate(e.target.value)
                }}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            {slots && (
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => setValue('start_time', slot.time, { shouldValidate: true })}
                      className={cn(
                        'rounded-md border px-3 py-2 text-sm transition-colors',
                        !slot.available && 'cursor-not-allowed bg-muted text-muted-foreground opacity-50',
                        slot.available && selectedTime !== slot.time && 'hover:bg-accent cursor-pointer',
                        selectedTime === slot.time && 'bg-primary text-primary-foreground border-primary'
                      )}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
                {errors.start_time && <p className="text-sm text-destructive">{errors.start_time.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <textarea
                {...register('reason')}
                placeholder="Reason for appointment"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
