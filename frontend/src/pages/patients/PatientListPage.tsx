import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { usePatients } from '@/hooks/usePatients'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/context/AuthContext'

export function PatientListPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = usePatients({
    ...(search ? { search } : {}),
    page: String(page),
  })

  const canCreate = user?.role === 'admin' || user?.role === 'receptionist'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Patients</h1>
        {canCreate && (
          <Link to="/patients/new">
            <Button><Plus size={16} /> Add Patient</Button>
          </Link>
        )}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
        <Input
          placeholder="Search patients..."
          className="pl-9"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
        />
      </div>

      {isLoading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {data?.count ?? 0} patient{data?.count !== 1 ? 's' : ''} found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Gender</th>
                    <th className="pb-3 font-medium">Blood Group</th>
                    <th className="pb-3 font-medium">Phone</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.results?.map((patient) => (
                    <tr key={patient.id} className="border-b last:border-0">
                      <td className="py-3">
                        <Link to={`/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                          {patient.first_name} {patient.last_name}
                        </Link>
                      </td>
                      <td className="py-3 capitalize">{patient.gender}</td>
                      <td className="py-3">
                        {patient.blood_group && <Badge variant="secondary">{patient.blood_group}</Badge>}
                      </td>
                      <td className="py-3">{patient.phone}</td>
                      <td className="py-3">
                        <Link to={`/patients/${patient.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {data?.results?.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-muted-foreground">
                        No patients found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {data && data.count > 20 && (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.previous}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">Page {page}</span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!data.next}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
