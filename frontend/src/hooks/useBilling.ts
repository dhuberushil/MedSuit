import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { billingApi } from '@/api/billing'
import type { Payment } from '@/types'

export function useInvoices(params?: Record<string, string>) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => billingApi.list(params).then((r) => r.data),
  })
}

export function useInvoice(id: number) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => billingApi.get(id).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => billingApi.create(data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useUpdateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) =>
      billingApi.update(id, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useCreatePayment(invoiceId: number) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Payment>) =>
      billingApi.createPayment(invoiceId, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices', invoiceId] }),
  })
}

export function useDownloadPdf() {
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await billingApi.getPdf(id)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `invoice-${id}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
