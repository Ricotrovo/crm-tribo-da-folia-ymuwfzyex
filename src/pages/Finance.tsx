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
import { createPayment } from '@/services/finance'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Finance() {
  const [payments, setPayments] = useState<any[]>([])
  const [contracts, setContracts] = useState<any[]>([])
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [amount, setAmount] = useState('')
  const [contractId, setContractId] = useState('')
  const [status, setStatus] = useState('Pendente')
  const { toast } = useToast()

  const fetchPayments = async () => {
    setIsLoading(true)
    try {
      const [paymentsRes, contractsRes] = await Promise.all([
        pb.collection('payments').getFullList({
          sort: '-created',
          expand: 'contract_id',
        }),
        pb.collection('contracts').getFullList({ sort: '-created' }),
      ])
      setPayments(paymentsRes || [])
      setContracts(contractsRes || [])
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  useRealtime('payments', fetchPayments)

  const handleCreatePayment = async () => {
    if (!contractId || !amount) {
      toast({
        title: 'Erro',
        description: 'Preencha o contrato e o valor.',
        variant: 'destructive',
      })
      return
    }
    try {
      await createPayment({
        contract_id: contractId,
        amount: Number(amount),
        status: status,
      })
      setIsSheetOpen(false)
      setAmount('')
      setContractId('')
      setStatus('Pendente')
      fetchPayments()
      toast({ title: 'Sucesso', description: 'Pagamento registrado.' })
    } catch (err) {
      const errors = extractFieldErrors(err)
      if (errors.amount) {
        toast({ title: 'Erro', description: errors.amount, variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao criar', variant: 'destructive' })
      }
    }
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground mt-1">Gerencie pagamentos e recebimentos.</p>
        </div>
        <div className="flex gap-2 items-center">
          <Button onClick={() => setIsSheetOpen(true)} className="shadow-sm">
            <Plus className="mr-2 h-4 w-4" /> Novo Pagamento
          </Button>
        </div>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Todos os Pagamentos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Contrato</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Nenhum pagamento encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">
                      {p.contract_id ? p.contract_id.split('-')[0] : 'N/A'}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">R$ {p.amount}</TableCell>
                    <TableCell>{p.status}</TableCell>
                    <TableCell>{new Date(p.created).toLocaleDateString('pt-BR')}</TableCell>
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
            <DialogTitle>Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contrato</label>
              <Select value={contractId} onValueChange={setContractId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contrato" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id.split('-')[0]} - R$ {c.total_value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Valor</label>
              <Input
                type="number"
                placeholder="Valor"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePayment}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
