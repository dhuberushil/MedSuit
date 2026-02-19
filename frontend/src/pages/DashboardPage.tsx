import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Link } from 'react-router-dom'

const COLORS = ['#2563eb', '#16a34a', '#eab308', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']

export function DashboardPage() {
  const { user } = useAuth()

  const { data: dashboard, isLoading: dashLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportsApi.dashboard().then((r) => r.data),
  })

  const { data: patientStats } = useQuery({
    queryKey: ['patient-stats'],
    queryFn: () => reportsApi.patientStats().then((r) => r.data),
    enabled: user?.role === 'admin' || user?.role === 'receptionist',
  })

  const { data: appointmentStats } = useQuery({
    queryKey: ['appointment-stats'],
    queryFn: () => reportsApi.appointmentStats().then((r) => r.data),
  })

  const { data: revenueStats } = useQuery({
    queryKey: ['revenue-stats'],
    queryFn: () => reportsApi.revenueStats().then((r) => r.data),
    enabled: user?.role === 'admin',
  })

  if (dashLoading) return <div className="text-muted-foreground">Loading dashboard...</div>

  const stats = [
    { label: 'Total Patients', value: dashboard?.total_patients ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Doctors', value: dashboard?.total_doctors ?? 0, icon: Stethoscope, color: 'text-green-600', bg: 'bg-green-50' },
    { label: "Today's Appointments", value: dashboard?.total_appointments_today ?? 0, icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { label: 'Total Revenue', value: `$${(dashboard?.total_revenue ?? 0).toLocaleString()}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.first_name}</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`rounded-lg ${stat.bg} p-3`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        {revenueStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueStats.monthly_revenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Appointments Chart */}
        {appointmentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={appointmentStats.monthly_appointments}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Patient Demographics */}
        {patientStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={patientStats.gender_distribution}
                    dataKey="count"
                    nameKey="gender"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {patientStats.gender_distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Appointment Status Distribution */}
        {appointmentStats && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appointment Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={appointmentStats.status_distribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {appointmentStats.status_distribution.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Patients</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recent_patients && dashboard.recent_patients.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent_patients.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <Link to={`/patients/${p.id}`} className="font-medium text-primary hover:underline">
                      {p.first_name} {p.last_name}
                    </Link>
                    <span className="text-muted-foreground">{p.phone}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent patients</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboard?.recent_appointments && dashboard.recent_appointments.length > 0 ? (
              <div className="space-y-3">
                {dashboard.recent_appointments.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div>
                      <Link to={`/appointments/${a.id}`} className="font-medium text-primary hover:underline">
                        {a.patient_name}
                      </Link>
                      <span className="text-muted-foreground"> with {a.doctor_name}</span>
                    </div>
                    <span className="text-muted-foreground">{a.date}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No recent appointments</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
