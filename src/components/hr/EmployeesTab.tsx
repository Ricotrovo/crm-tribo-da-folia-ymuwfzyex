import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getUsers, User } from '@/services/users'
import { EmployeeDetailsSheet } from './EmployeeDetailsSheet'
import { Button } from '@/components/ui/button'

export function EmployeesTab() {
  const [employees, setEmployees] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getUsers()
      setEmployees(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <>
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Cargo (Role)</TableHead>
                <TableHead>Admissão</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum funcionário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">{emp.name || '-'}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.role_title || emp.role || '-'}</TableCell>
                    <TableCell>
                      {emp.admission_date
                        ? new Date(emp.admission_date + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(emp)
                          setIsSheetOpen(true)
                        }}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedUser && (
        <EmployeeDetailsSheet
          user={selectedUser}
          open={isSheetOpen}
          onOpenChange={(open) => {
            setIsSheetOpen(open)
            if (!open) setTimeout(() => setSelectedUser(null), 300)
          }}
          onSaved={loadData}
        />
      )}
    </>
  )
}
