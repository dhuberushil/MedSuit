import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar as CalendarIcon } from 'lucide-react'
import { useAppointments } from '@/hooks/useAppointments'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
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

export function AppointmentListPage() {
  const { user } = useAuth()
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useAppointments({
    ...(statusFilter ? { status: statusFilter } : {}),
    page: String(page),
  })

  const canCreate = user?.role !== 'patient'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <div className="flex gap-2">
          <Link to="/appointments/calendar">
            <Button variant="outline"><CalendarIcon size={16} /> Calendar</Button>
          </Link>
          {canCreate && (
            <Link to="/appointments/new">
              <Button><Plus size={16} /> Book Appointment</Button>
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-xs">
        <Select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="confirmed">Confirmed</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No Show</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{data?.count ?? 0} appointment{data?.count !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium">Doctor</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Time</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((appt) => (
                    <tr key={appt.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">{appt.patient_name}</td>
                      <td className="py-3">{appt.doctor_name}</td>
                      <td className="py-3">{appt.date}</td>
                      <td className="py-3">{appt.start_time?.slice(0, 5)}</td>
                      <td className="py-3">
                        <Badge className={statusColors[appt.status]} variant="secondary">
                          {appt.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Link to={`/appointments/${appt.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data?.results?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        No appointments found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.count > 20 && (
              <div className="mt-4 flex items-center justify-between">
                <Button variant="outline" size="sm" disabled={!data.previous} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button variant="outline" size="sm" disabled={!data.next} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
