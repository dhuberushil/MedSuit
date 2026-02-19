import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAppointment, useUpdateAppointment } from '@/hooks/useAppointments'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AppointmentStatus } from '@/types'

const statusColors: Record<AppointmentStatus, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
}

const transitions: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' }[]> = {
  scheduled: [
    { label: 'confirmed', variant: 'default' },
    { label: 'cancelled', variant: 'destructive' },
  ],
  confirmed: [
    { label: 'in_progress', variant: 'default' },
    { label: 'cancelled', variant: 'destructive' },
    { label: 'no_show', variant: 'outline' },
  ],
  in_progress: [
    { label: 'completed', variant: 'default' },
  ],
  cancelled: [
    { label: 'scheduled', variant: 'outline' },
  ],
}

export function AppointmentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: appointment, isLoading } = useAppointment(Number(id))
  const updateMutation = useUpdateAppointment()

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>
  if (!appointment) return <div className="text-muted-foreground">Appointment not found</div>

  const canChangeStatus = user?.role !== 'patient'
  const availableTransitions = transitions[appointment.status] ?? []

  const handleStatusChange = async (newStatus: string) => {
    await updateMutation.mutateAsync({ id: Number(id), data: { status: newStatus as AppointmentStatus } })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/appointments">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Appointment #{appointment.id}</h1>
          <p className="text-muted-foreground">{appointment.date} at {appointment.start_time?.slice(0, 5)}</p>
        </div>
        <Badge className={statusColors[appointment.status]} variant="secondary">
          {appointment.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span>{appointment.patient_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span>{appointment.doctor_name}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{appointment.date}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Time</span><span>{appointment.start_time?.slice(0, 5)} - {appointment.end_time?.slice(0, 5)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Reason</span><span className="text-right max-w-[200px]">{appointment.reason || '—'}</span></div>
          </CardContent>
        </Card>

        {canChangeStatus && availableTransitions.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">Change appointment status:</p>
              <div className="flex flex-wrap gap-2">
                {availableTransitions.map((t) => (
                  <Button
                    key={t.label}
                    variant={t.variant}
                    size="sm"
                    onClick={() => handleStatusChange(t.label)}
                    disabled={updateMutation.isPending}
                    className="capitalize"
                  >
                    {t.label.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
