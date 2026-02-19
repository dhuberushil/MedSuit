import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Edit, ArrowLeft } from 'lucide-react'
import { usePatient, useDeletePatient, useCreateMedicalRecord } from '@/hooks/usePatients'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const recordSchema = z.object({
  diagnosis: z.string().min(1, 'Diagnosis is required'),
  prescription: z.string().optional(),
  notes: z.string().optional(),
  visit_date: z.string().min(1, 'Visit date is required'),
})

type RecordForm = z.infer<typeof recordSchema>

export function PatientDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: patient, isLoading } = usePatient(Number(id))
  const deleteMutation = useDeletePatient()
  const createRecord = useCreateMedicalRecord(Number(id))
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'records'>('overview')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecordForm>({
    resolver: zodResolver(recordSchema),
    defaultValues: { visit_date: new Date().toISOString().split('T')[0] },
  })

  const canEdit = user?.role === 'admin' || user?.role === 'receptionist'
  const canAddRecord = user?.role === 'doctor' || user?.role === 'admin'

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>
  if (!patient) return <div className="text-muted-foreground">Patient not found</div>

  const onAddRecord = async (data: RecordForm) => {
    await createRecord.mutateAsync(data)
    reset()
    setShowRecordForm(false)
  }

  const onDelete = async () => {
    if (confirm('Are you sure you want to delete this patient?')) {
      await deleteMutation.mutateAsync(Number(id))
      navigate('/patients')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/patients">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h1>
          <p className="text-muted-foreground capitalize">{patient.gender} {patient.blood_group && `| ${patient.blood_group}`}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link to={`/patients/${id}/edit`}>
              <Button variant="outline"><Edit size={16} /> Edit</Button>
            </Link>
            <Button variant="destructive" onClick={onDelete}>Delete</Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 border-b">
        {(['overview', 'records'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'records' ? 'Medical Records' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Date of Birth</span><span>{patient.date_of_birth}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{patient.phone}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{patient.email || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="text-right max-w-[200px]">{patient.address || '—'}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Medical Information</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Blood Group</span><span>{patient.blood_group ? <Badge variant="secondary">{patient.blood_group}</Badge> : '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Allergies</span><span className="text-right max-w-[200px]">{patient.allergies || 'None'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Chronic Conditions</span><span className="text-right max-w-[200px]">{patient.chronic_conditions || 'None'}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Emergency Contact</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{patient.emergency_contact_name || '—'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{patient.emergency_contact_phone || '—'}</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'records' && (
        <div className="space-y-4">
          {canAddRecord && (
            <Button onClick={() => setShowRecordForm(!showRecordForm)}>
              {showRecordForm ? 'Cancel' : 'Add Medical Record'}
            </Button>
          )}

          {showRecordForm && (
            <Card>
              <CardHeader><CardTitle className="text-base">New Medical Record</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onAddRecord)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visit Date</Label>
                    <Input type="date" {...register('visit_date')} />
                    {errors.visit_date && <p className="text-sm text-destructive">{errors.visit_date.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Diagnosis</Label>
                    <textarea {...register('diagnosis')} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                    {errors.diagnosis && <p className="text-sm text-destructive">{errors.diagnosis.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Prescription</Label>
                    <textarea {...register('prescription')} className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <textarea {...register('notes')} className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  </div>
                  <Button type="submit" disabled={createRecord.isPending}>
                    {createRecord.isPending ? 'Saving...' : 'Save Record'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {'medical_records' in patient && patient.medical_records?.length > 0 ? (
            <div className="space-y-3">
              {patient.medical_records.map((record) => (
                <Card key={record.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{record.diagnosis}</p>
                        <p className="text-sm text-muted-foreground">Dr. {record.doctor_name} &middot; {record.visit_date}</p>
                      </div>
                    </div>
                    {record.prescription && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Prescription</p>
                        <p className="text-sm mt-1">{record.prescription}</p>
                      </div>
                    )}
                    {record.notes && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted-foreground uppercase">Notes</p>
                        <p className="text-sm mt-1">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No medical records found.</p>
          )}
        </div>
      )}
    </div>
  )
}
