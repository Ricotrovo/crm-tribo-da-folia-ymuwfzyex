import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import pb from '@/lib/pocketbase/client'
import { useRealtime } from '@/hooks/use-realtime'
import { extractFieldErrors } from '@/lib/pocketbase/errors'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'

export default function Contracts() {
  const [contracts, setContracts] = useState<any[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [newTotalValue, setNewTotalValue] = useState('')
  const { toast } = useToast()

  const fetchContracts = async () => {
    setIsLoading(true)
    try {
      const records = await pb.collection('contracts').getFullList({
        sort: '-created',
        expand: 'client_id',
      })
      setContracts(records || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  useRealtime('contracts', fetchContracts)

  const handleCreateContract = async () => {
    try {
      await pb.collection('contracts').create({ total_value: Number(newTotalValue) })
      setIsSheetOpen(false)
      setNewTotalValue('')
      fetchContracts()
      toast({ title: 'Sucesso', description: 'Contrato registrado.' })
    } catch (err) {
      const errors = extractFieldErrors(err)
      if (errors.total_value) {
        toast({ title: 'Erro', description: errors.total_value, variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao criar', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Contratos</h2>
          <p className="text-muted-foreground mt-1">Gerencie contratos e valores.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={() => setIsSheetOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Contrato
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>Todos os Contratos</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : contracts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                    Nenhum contrato encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                contracts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs">{c.id.split('-')[0]}</TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      R$ {c.total_value}
                    </TableCell>
                    <TableCell>{new Date(c.created).toLocaleDateString('pt-BR')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Contrato</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Valor Total"
              value={newTotalValue}
              onChange={(e) => setNewTotalValue(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateContract}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
