export type Role = 'admin' | 'doctor' | 'receptionist' | 'patient'

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  role: Role
  phone: string
}

export interface DoctorProfile {
  id: number
  user: User
  specialization: string
  license_number: string
  consultation_fee: string
  is_available: boolean
}

export interface Patient {
  id: number
  user: number | null
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  blood_group: string
  phone: string
  email: string
  address: string
  allergies: string
  chronic_conditions: string
  emergency_contact_name: string
  emergency_contact_phone: string
  created_at: string
  updated_at: string
}

export interface MedicalRecord {
  id: number
  patient: number
  doctor: number
  doctor_name: string
  diagnosis: string
  prescription: string
  notes: string
  visit_date: string
  created_at: string
}

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'

export interface Appointment {
  id: number
  patient: number
  patient_name: string
  doctor: number
  doctor_name: string
  date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  reason: string
  notes: string
  created_at: string
}

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceItem {
  id?: number
  description: string
  quantity: number
  unit_price: string
  total: string
}

export interface Payment {
  id: number
  invoice: number
  amount: string
  method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance'
  transaction_id: string
  payment_date: string
  created_at: string
}

export interface Invoice {
  id: number
  invoice_number: string
  patient: number
  patient_name: string
  appointment: number | null
  status: InvoiceStatus
  items: InvoiceItem[]
  payments: Payment[]
  subtotal: string
  tax_rate: string
  tax_amount: string
  discount: string
  total: string
  amount_paid: string
  balance_due: string
  notes: string
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface DashboardStats {
  total_patients: number
  total_doctors: number
  total_appointments_today: number
  total_revenue: number
  pending_appointments: number
  recent_patients: Patient[]
  recent_appointments: Appointment[]
}
