import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  Freelancer,
  getFreelancers,
  getAttendanceLogs,
  AttendanceLog,
  deleteFreelancer,
} from '@/services/freelancers'
import { FreelancerDetailsSheet } from './FreelancerDetailsSheet'
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

export function FreelancersTab() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [selectedFree, setSelectedFree] = useState<Freelancer | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [fData, lData] = await Promise.all([getFreelancers(), getAttendanceLogs()])
      setFreelancers(fData)
      setLogs(lData)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const calcIndex = (id: string) => {
    const fLogs = logs.filter((l) => l.freelancer_id === id)
    if (fLogs.length === 0) return '-'
    const present = fLogs.filter((l) => l.status === 'present').length
    const noShow = fLogs.filter((l) => l.status === 'no_show').length
    const total = present + noShow
    if (total === 0) return '-'
    return `${Math.round((present / total) * 100)}%`
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFreelancer(id)
      toast({ title: 'Freelancer excluído.' })
      loadData()
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setSelectedFree(null)
            setIsSheetOpen(true)
          }}
          className="shadow-sm"
        >
          <Plus className="mr-2 h-4 w-4" /> Novo Freelancer
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Índice de Confiabilidade</TableHead>
                <TableHead>Nota Geral</TableHead>
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
              ) : freelancers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    Nenhum freelancer encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                freelancers.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${f.status === 'Ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-muted text-muted-foreground'}`}
                      >
                        {f.status}
                      </span>
                    </TableCell>
                    <TableCell>{calcIndex(f.id)}</TableCell>
                    <TableCell>{f.overall_rating ? `${f.overall_rating} / 10` : '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedFree(f)
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
                              <AlertDialogTitle>Excluir freelancer?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Todos os dados serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(f.id)}
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

      <FreelancerDetailsSheet
        freelancer={selectedFree}
        open={isSheetOpen}
        onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) setTimeout(() => setSelectedFree(null), 300)
        }}
        onSaved={loadData}
      />
    </>
  )
}
