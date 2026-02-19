import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Download, Printer } from 'lucide-react'
import { useInvoice, useDownloadPdf, useCreatePayment } from '@/hooks/useBilling'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { InvoiceStatus } from '@/types'

const statusColors: Record<InvoiceStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  partially_paid: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-500',
}

interface PaymentForm {
  amount: number
  method: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'insurance'
  transaction_id?: string
}

const paymentSchema = z.object({
  amount: z.coerce.number().min(0.01, 'Amount must be positive'),
  method: z.enum(['cash', 'card', 'upi', 'bank_transfer', 'insurance']),
  transaction_id: z.string().optional(),
})

export function InvoiceDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { data: invoice, isLoading } = useInvoice(Number(id))
  const downloadPdf = useDownloadPdf()
  const createPayment = useCreatePayment(Number(id))
  const [showPaymentForm, setShowPaymentForm] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: { method: 'cash' },
  })

  const canRecordPayment = user?.role === 'admin' || user?.role === 'receptionist'

  if (isLoading) return <div className="text-muted-foreground">Loading...</div>
  if (!invoice) return <div className="text-muted-foreground">Invoice not found</div>

  const onAddPayment = async (data: PaymentForm) => {
    await createPayment.mutateAsync({
      amount: String(data.amount),
      method: data.method,
      transaction_id: data.transaction_id,
    })
    reset()
    setShowPaymentForm(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/billing">
          <Button variant="ghost" size="icon"><ArrowLeft size={20} /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{invoice.invoice_number}</h1>
          <p className="text-muted-foreground">{invoice.patient_name}</p>
        </div>
        <Badge className={statusColors[invoice.status]} variant="secondary">
          {invoice.status.replace('_', ' ')}
        </Badge>
        <Button variant="outline" onClick={() => downloadPdf.mutate(Number(id))}>
          <Download size={16} /> PDF
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer size={16} /> Print
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Items</CardTitle></CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Description</th>
                    <th className="pb-3 font-medium text-right">Qty</th>
                    <th className="pb-3 font-medium text-right">Unit Price</th>
                    <th className="pb-3 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.items?.map((item, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-3">{item.description}</td>
                      <td className="py-3 text-right">{item.quantity}</td>
                      <td className="py-3 text-right">${item.unit_price}</td>
                      <td className="py-3 text-right">${item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 border-t pt-4 space-y-1 text-sm text-right">
                <div className="flex justify-end gap-8"><span className="text-muted-foreground">Subtotal</span><span className="w-24">${invoice.subtotal}</span></div>
                {Number(invoice.tax_amount) > 0 && (
                  <div className="flex justify-end gap-8"><span className="text-muted-foreground">Tax ({invoice.tax_rate}%)</span><span className="w-24">${invoice.tax_amount}</span></div>
                )}
                {Number(invoice.discount) > 0 && (
                  <div className="flex justify-end gap-8"><span className="text-muted-foreground">Discount</span><span className="w-24">-${invoice.discount}</span></div>
                )}
                <div className="flex justify-end gap-8 font-bold text-base border-t pt-2"><span>Total</span><span className="w-24">${invoice.total}</span></div>
                <div className="flex justify-end gap-8 text-green-600"><span>Paid</span><span className="w-24">${invoice.amount_paid}</span></div>
                <div className="flex justify-end gap-8 font-bold"><span>Balance Due</span><span className="w-24">${invoice.balance_due}</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Payment history */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Payments</CardTitle>
              {canRecordPayment && invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <Button size="sm" onClick={() => setShowPaymentForm(!showPaymentForm)}>
                  {showPaymentForm ? 'Cancel' : 'Record Payment'}
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {showPaymentForm && (
                <form onSubmit={handleSubmit(onAddPayment)} className="mb-4 rounded-lg border p-4 space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label>Amount</Label>
                      <Input type="number" step="0.01" {...register('amount')} />
                      {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
                    </div>
                    <div className="space-y-1">
                      <Label>Method</Label>
                      <Select {...register('method')}>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="upi">UPI</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="insurance">Insurance</option>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Transaction ID</Label>
                      <Input {...register('transaction_id')} placeholder="Optional" />
                    </div>
                  </div>
                  <Button type="submit" size="sm" disabled={createPayment.isPending}>
                    {createPayment.isPending ? 'Recording...' : 'Record Payment'}
                  </Button>
                </form>
              )}

              {invoice.payments && invoice.payments.length > 0 ? (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 font-medium">Date</th>
                      <th className="pb-2 font-medium">Method</th>
                      <th className="pb-2 font-medium">Transaction ID</th>
                      <th className="pb-2 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.payments.map((payment) => (
                      <tr key={payment.id} className="border-b last:border-0">
                        <td className="py-2">{new Date(payment.payment_date).toLocaleDateString()}</td>
                        <td className="py-2 capitalize">{payment.method.replace('_', ' ')}</td>
                        <td className="py-2">{payment.transaction_id || '—'}</td>
                        <td className="py-2 text-right">${payment.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p className="text-muted-foreground text-sm">No payments recorded.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Invoice Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Invoice #</span><span>{invoice.invoice_number}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span>{invoice.patient_name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(invoice.created_at).toLocaleDateString()}</span></div>
              {invoice.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground mb-1">Notes</p>
                  <p>{invoice.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
