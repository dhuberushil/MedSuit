import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { useInvoices } from '@/hooks/useBilling'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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

export function InvoiceListPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useInvoices({
    ...(search ? { search } : {}),
    ...(statusFilter ? { status: statusFilter } : {}),
    page: String(page),
  })

  const canCreate = user?.role === 'admin' || user?.role === 'receptionist'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Invoices</h1>
        {canCreate && (
          <Link to="/billing/new">
            <Button><Plus size={16} /> Create Invoice</Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <Input
            placeholder="Search invoices..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <Select className="max-w-xs" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="partially_paid">Partially Paid</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{data?.count ?? 0} invoice{data?.count !== 1 ? 's' : ''}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Invoice #</th>
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium">Total</th>
                    <th className="pb-3 font-medium">Paid</th>
                    <th className="pb-3 font-medium">Balance</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((inv) => (
                    <tr key={inv.id} className="border-b last:border-0">
                      <td className="py-3 font-medium">
                        <Link to={`/billing/${inv.id}`} className="text-primary hover:underline">{inv.invoice_number}</Link>
                      </td>
                      <td className="py-3">{inv.patient_name}</td>
                      <td className="py-3">${inv.total}</td>
                      <td className="py-3">${inv.amount_paid}</td>
                      <td className="py-3">${inv.balance_due}</td>
                      <td className="py-3">
                        <Badge className={statusColors[inv.status]} variant="secondary">
                          {inv.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <Link to={`/billing/${inv.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data?.results?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-muted-foreground">No invoices found</td>
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
