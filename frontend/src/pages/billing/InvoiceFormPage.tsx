import { useNavigate } from 'react-router-dom'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2 } from 'lucide-react'
import { useCreateInvoice } from '@/hooks/useBilling'
import { usePatients } from '@/hooks/usePatients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface InvoiceItemForm {
  description: string
  quantity: number
  unit_price: number
}

interface InvoiceForm {
  patient: string
  tax_rate: number
  discount: number
  notes?: string
  items: InvoiceItemForm[]
}

const invoiceSchema = z.object({
  patient: z.string().min(1, 'Patient is required'),
  tax_rate: z.coerce.number().min(0).default(0),
  discount: z.coerce.number().min(0).default(0),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, 'Required'),
    quantity: z.coerce.number().min(1),
    unit_price: z.coerce.number().min(0),
  })).min(1, 'At least one item is required'),
})

export function InvoiceFormPage() {
  const navigate = useNavigate()
  const createMutation = useCreateInvoice()
  const { data: patientsData } = usePatients({ page: '1' })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, control, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<InvoiceForm>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      tax_rate: 0,
      discount: 0,
      items: [{ description: '', quantity: 1, unit_price: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'items' })
  const watchItems = watch('items')
  const watchTaxRate = watch('tax_rate')
  const watchDiscount = watch('discount')

  const subtotal = watchItems.reduce((sum, item) => sum + (item.quantity || 0) * (item.unit_price || 0), 0)
  const taxAmount = subtotal * (watchTaxRate || 0) / 100
  const total = subtotal + taxAmount - (watchDiscount || 0)

  const onSubmit = async (data: InvoiceForm) => {
    await createMutation.mutateAsync({
      patient: Number(data.patient),
      tax_rate: data.tax_rate,
      discount: data.discount,
      notes: data.notes,
      items: data.items,
    })
    navigate('/billing')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">Create Invoice</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Line Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}>
              <Plus size={16} /> Add Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  {index === 0 && <Label>Description</Label>}
                  <Input {...register(`items.${index}.description`)} placeholder="Description" />
                </div>
                <div className="w-20 space-y-1">
                  {index === 0 && <Label>Qty</Label>}
                  <Input type="number" {...register(`items.${index}.quantity`)} />
                </div>
                <div className="w-28 space-y-1">
                  {index === 0 && <Label>Unit Price</Label>}
                  <Input type="number" step="0.01" {...register(`items.${index}.unit_price`)} />
                </div>
                <div className="w-24 space-y-1">
                  {index === 0 && <Label>Total</Label>}
                  <div className="flex h-10 items-center text-sm font-medium">
                    ${((watchItems[index]?.quantity || 0) * (watchItems[index]?.unit_price || 0)).toFixed(2)}
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" onClick={() => fields.length > 1 && remove(index)} disabled={fields.length <= 1}>
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
            {errors.items && <p className="text-sm text-destructive">{typeof errors.items === 'object' && 'message' in errors.items ? errors.items.message : ''}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Summary</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" step="0.01" {...register('tax_rate')} />
              </div>
              <div className="space-y-2">
                <Label>Discount ($)</Label>
                <Input type="number" step="0.01" {...register('discount')} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <textarea
                {...register('notes')}
                className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="rounded-lg bg-muted p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tax ({watchTaxRate || 0}%)</span><span>${taxAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Discount</span><span>-${(watchDiscount || 0).toFixed(2)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-2"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/billing')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
