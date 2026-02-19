import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { PatientListPage } from '@/pages/patients/PatientListPage'
import { PatientFormPage } from '@/pages/patients/PatientFormPage'
import { PatientDetailPage } from '@/pages/patients/PatientDetailPage'
import { AppointmentListPage } from '@/pages/appointments/AppointmentListPage'
import { AppointmentFormPage } from '@/pages/appointments/AppointmentFormPage'
import { AppointmentDetailPage } from '@/pages/appointments/AppointmentDetailPage'
import { AppointmentCalendarPage } from '@/pages/appointments/AppointmentCalendarPage'
import { InvoiceListPage } from '@/pages/billing/InvoiceListPage'
import { InvoiceFormPage } from '@/pages/billing/InvoiceFormPage'
import { InvoiceDetailPage } from '@/pages/billing/InvoiceDetailPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'patients', element: <PatientListPage /> },
      { path: 'patients/new', element: <PatientFormPage /> },
      { path: 'patients/:id', element: <PatientDetailPage /> },
      { path: 'patients/:id/edit', element: <PatientFormPage /> },
      { path: 'appointments', element: <AppointmentListPage /> },
      { path: 'appointments/new', element: <AppointmentFormPage /> },
      { path: 'appointments/calendar', element: <AppointmentCalendarPage /> },
      { path: 'appointments/:id', element: <AppointmentDetailPage /> },
      { path: 'billing', element: <InvoiceListPage /> },
      { path: 'billing/new', element: <InvoiceFormPage /> },
      { path: 'billing/:id', element: <InvoiceDetailPage /> },
    ],
  },
])
