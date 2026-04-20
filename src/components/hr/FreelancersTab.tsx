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
import { Plus, Pencil, Trash2, Star } from 'lucide-react'
import {
  Freelancer,
  getFreelancers,
  deleteFreelancer,
  getAllFreelancerEvaluations,
  FreelancerEvaluation,
} from '@/services/freelancers'
import { FreelancerDetailsSheet } from './FreelancerDetailsSheet'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
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
import { maskCPF, maskPhone } from '@/lib/formatters'

export function FreelancersTab() {
  const [freelancers, setFreelancers] = useState<Freelancer[]>([])
  const [evaluations, setEvaluations] = useState<FreelancerEvaluation[]>([])
  const [selectedFree, setSelectedFree] = useState<Freelancer | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { user } = useAuth()
  const isManager = user?.role?.toLowerCase() === 'gerente'

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [fData, evData] = await Promise.all([getFreelancers(), getAllFreelancerEvaluations()])
      setFreelancers(fData)
      setEvaluations(evData)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const calcAverageRating = (id: string) => {
    const fEvals = evaluations.filter((e) => e.freelancer_id === id)
    if (fEvals.length === 0) return '-'
    const totalScore = fEvals.reduce(
      (acc, ev) => acc + (ev.frequency + ev.punctuality + ev.participation + ev.education) / 4,
      0,
    )
    return (totalScore / fEvals.length).toFixed(1)
  }

  const formatCpfDisplay = (cpf?: string) => {
    if (!cpf) return '-'
    const clean = cpf.replace(/\D/g, '')
    if (clean.length !== 11) return cpf
    if (isManager) return maskCPF(clean)
    return `***.${clean.slice(3, 6)}.${clean.slice(6, 9)}-**`
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
                <TableHead className="w-[140px]">ID (CPF)</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Média das Notas</TableHead>
                <TableHead>Bairro</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : freelancers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    Nenhum freelancer encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                freelancers.map((f) => (
                  <TableRow key={f.id} className={f.status !== 'Ativo' ? 'opacity-60' : ''}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {formatCpfDisplay(f.cpf)}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {f.name}
                        {f.status !== 'Ativo' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
                            Inativo
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{f.phone ? maskPhone(f.phone) : '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 font-medium">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        {calcAverageRating(f.id)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {f.address_neighborhood ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold shadow-sm">
                          {f.address_neighborhood}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
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
