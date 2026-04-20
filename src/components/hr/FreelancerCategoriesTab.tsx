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
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Pencil } from 'lucide-react'
import {
  FreelancerCategory,
  getFreelancerCategories,
  createFreelancerCategory,
  updateFreelancerCategory,
  deleteFreelancerCategory,
} from '@/services/freelancers'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useAuth } from '@/hooks/use-auth'
import { formatCurrencyInput, parseCurrencyInput } from '@/lib/formatters'
import { useRealtime } from '@/hooks/use-realtime'

export function FreelancerCategoriesTab() {
  const [categories, setCategories] = useState<FreelancerCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<FreelancerCategory | null>(null)
  const [newName, setNewName] = useState('')
  const [newPay, setNewPay] = useState('')
  const [editName, setEditName] = useState('')
  const [editPay, setEditPay] = useState('')

  const { toast } = useToast()
  const { user } = useAuth()
  const isManager = user?.role?.toLowerCase() === 'gerente'

  const loadData = async () => {
    setIsLoading(true)
    try {
      const data = await getFreelancerCategories()
      setCategories(data)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useRealtime('freelancer_categories', () => {
    loadData()
  })

  const handleCreate = async () => {
    if (!newName || !newPay) return
    try {
      await createFreelancerCategory({
        name: newName,
        pay_rate: parseCurrencyInput(newPay),
      })
      toast({ title: 'Categoria criada com sucesso.' })
      setIsCreateOpen(false)
      setNewName('')
      setNewPay('')
    } catch (e: any) {
      toast({ title: 'Erro ao criar', description: e.message, variant: 'destructive' })
    }
  }

  const handleUpdate = async () => {
    if (!editingCategory || !editName || !editPay) return
    try {
      await updateFreelancerCategory(editingCategory.id, {
        name: editName,
        pay_rate: parseCurrencyInput(editPay),
      })
      toast({ title: 'Categoria atualizada com sucesso.' })
      setEditingCategory(null)
    } catch (e: any) {
      toast({ title: 'Erro ao atualizar', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFreelancerCategory(id)
      toast({ title: 'Categoria excluída.' })
    } catch (e: any) {
      toast({ title: 'Erro ao excluir', description: e.message, variant: 'destructive' })
    }
  }

  const openEdit = (c: FreelancerCategory) => {
    setEditingCategory(c)
    setEditName(c.name)
    setEditPay(formatCurrencyInput(c.pay_rate.toFixed(2).replace('.', '')))
  }

  return (
    <>
      {isManager && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => setIsCreateOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Nova Categoria
          </Button>
        </div>
      )}

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Categoria</TableHead>
                <TableHead>Valor por Evento</TableHead>
                {isManager && <TableHead></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={isManager ? 3 : 2}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : categories.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={isManager ? 3 : 2}
                    className="text-center py-6 text-muted-foreground"
                  >
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categories.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(c.pay_rate)}
                    </TableCell>
                    {isManager && (
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(c)}
                          className="text-muted-foreground hover:text-primary"
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
                              <AlertDialogTitle>Excluir categoria?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(c.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Excluir
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: Garçom"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor por Evento (R$)</Label>
              <Input
                value={newPay}
                onChange={(e) => setNewPay(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={!newName || !newPay}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingCategory} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Categoria</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome da Categoria</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Ex: Garçom"
              />
            </div>
            <div className="space-y-2">
              <Label>Valor por Evento (R$)</Label>
              <Input
                value={editPay}
                onChange={(e) => setEditPay(formatCurrencyInput(e.target.value))}
                placeholder="R$ 0,00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCategory(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={!editName || !editPay}>
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
