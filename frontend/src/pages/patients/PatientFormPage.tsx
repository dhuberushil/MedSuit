import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams } from 'react-router-dom'
import { usePatient, useCreatePatient, useUpdatePatient } from '@/hooks/usePatients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect } from 'react'

const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['male', 'female', 'other']),
  blood_group: z.string().optional(),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  allergies: z.string().optional(),
  chronic_conditions: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
})

type PatientForm = z.infer<typeof patientSchema>

export function PatientFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const { data: patient } = usePatient(Number(id))
  const createMutation = useCreatePatient()
  const updateMutation = useUpdatePatient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PatientForm>({
    resolver: zodResolver(patientSchema),
    defaultValues: { gender: 'male' },
  })

  useEffect(() => {
    if (patient && isEdit) {
      reset({
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group,
        phone: patient.phone,
        email: patient.email,
        address: patient.address,
        allergies: patient.allergies,
        chronic_conditions: patient.chronic_conditions,
        emergency_contact_name: patient.emergency_contact_name,
        emergency_contact_phone: patient.emergency_contact_phone,
      })
    }
  }, [patient, isEdit, reset])

  const onSubmit = async (data: PatientForm) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: Number(id), data })
    } else {
      await createMutation.mutateAsync(data)
    }
    navigate('/patients')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">{isEdit ? 'Edit Patient' : 'Add New Patient'}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Patient Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input {...register('first_name')} />
                {errors.first_name && <p className="text-sm text-destructive">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input {...register('last_name')} />
                {errors.last_name && <p className="text-sm text-destructive">{errors.last_name.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <Input type="date" {...register('date_of_birth')} />
                {errors.date_of_birth && <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select {...register('gender')}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Blood Group</Label>
                <Select {...register('blood_group')}>
                  <option value="">Select</option>
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input {...register('phone')} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" {...register('email')} />
            </div>

            <div className="space-y-2">
              <Label>Address</Label>
              <textarea
                {...register('address')}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Allergies</Label>
                <textarea
                  {...register('allergies')}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <div className="space-y-2">
                <Label>Chronic Conditions</Label>
                <textarea
                  {...register('chronic_conditions')}
                  className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Emergency Contact Name</Label>
                <Input {...register('emergency_contact_name')} />
              </div>
              <div className="space-y-2">
                <Label>Emergency Contact Phone</Label>
                <Input {...register('emergency_contact_phone')} />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : isEdit ? 'Update Patient' : 'Create Patient'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
