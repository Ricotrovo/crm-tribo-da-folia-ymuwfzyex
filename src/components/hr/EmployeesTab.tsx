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
import { useRealtime } from '@/hooks/use-realtime'
import { EmployeeDetailsSheet } from './EmployeeDetailsSheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { deleteUser } from '@/services/users'
import { useToast } from '@/hooks/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

export function EmployeesTab() {
  const [employees, setEmployees] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

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

  useRealtime('users', () => {
    loadData()
  })

  const handleDelete = async (id: string) => {
    try {
      await deleteUser(id)
      toast({ title: 'Funcionário excluído.' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase()
    if (!term) return true

    const matchName = emp.name?.toLowerCase().includes(term)
    const matchEmail = emp.email?.toLowerCase().includes(term)
    const matchCpf = emp.cpf?.replace(/\D/g, '').includes(term.replace(/\D/g, ''))

    return matchName || matchEmail || matchCpf
  })

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between mb-4 gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setSelectedUser(null)
            setIsSheetOpen(true)
          }}
          className="shadow-sm sm:w-auto w-full"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Funcionário
        </Button>
      </div>

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
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {searchTerm
                      ? 'Nenhum funcionário encontrado para a busca.'
                      : 'Nenhum funcionário encontrado.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees.map((emp) => (
                  <TableRow key={emp.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {emp.avatar ? (
                          <img
                            src={pb.files.getUrl(emp, emp.avatar, { thumb: '100x100' })}
                            alt={emp.name}
                            className="w-8 h-8 rounded-full object-cover border"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-xs border">
                            {emp.name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                        )}
                        <span>{emp.name || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.role_title || emp.role || '-'}</TableCell>
                    <TableCell>
                      {emp.admission_date
                        ? new Date(emp.admission_date + 'T12:00:00').toLocaleDateString('pt-BR')
                        : '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(emp)
                            setIsSheetOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir funcionário?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Todos os dados serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(emp.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <EmployeeDetailsSheet
        user={selectedUser}
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) setTimeout(() => setSelectedUser(null), 300)
        }}
        onSaved={loadData}
      />
    </>
  )
}
