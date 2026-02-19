import { useState, useMemo, useCallback } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns'
import { enUS } from 'date-fns/locale/en-US'
import { Link } from 'react-router-dom'
import { useCalendarAppointments } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { AppointmentStatus } from '@/types'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS },
})

const statusColorMap: Record<AppointmentStatus, string> = {
  scheduled: '#3b82f6',
  confirmed: '#22c55e',
  in_progress: '#eab308',
  completed: '#6b7280',
  cancelled: '#ef4444',
  no_show: '#f97316',
}

export function AppointmentCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<View>('month')

  const start = format(startOfMonth(subMonths(currentDate, 1)), 'yyyy-MM-dd')
  const end = format(endOfMonth(addMonths(currentDate, 1)), 'yyyy-MM-dd')

  const { data: appointments } = useCalendarAppointments(start, end)

  const events = useMemo(() => {
    if (!appointments) return []
    return appointments.map((appt) => ({
      id: appt.id,
      title: `${appt.patient_name} - Dr. ${appt.doctor_name}`,
      start: new Date(`${appt.date}T${appt.start_time}`),
      end: new Date(`${appt.date}T${appt.end_time}`),
      resource: appt,
    }))
  }, [appointments])

  const eventStyleGetter = useCallback((event: (typeof events)[0]) => ({
    style: {
      backgroundColor: statusColorMap[event.resource.status as AppointmentStatus] || '#3b82f6',
      borderRadius: '4px',
      opacity: 0.9,
      color: 'white',
      border: '0',
      fontSize: '12px',
    },
  }), [])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/appointments">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <h1 className="text-2xl font-bold">Appointment Calendar</h1>
      </div>

      <div className="rounded-xl border bg-card p-4" style={{ height: 700 }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          date={currentDate}
          view={view}
          onNavigate={setCurrentDate}
          onView={setView}
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          min={new Date(0, 0, 0, 8, 0)}
          max={new Date(0, 0, 0, 18, 0)}
        />
      </div>
    </div>
  )
}
