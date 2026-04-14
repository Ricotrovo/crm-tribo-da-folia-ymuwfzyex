import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { TrendingUp, PlusCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { format, isPast, isToday } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

export default function Finance() {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isPaymentOpen, setIsPaymentOpen] = useState(false)
  const [newAmount, setNewAmount] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const { toast } = useToast()

  const fetchData = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('payment')
      .select('*')
      .order('due_date', { ascending: true })

    setPayments(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreatePayment = async () => {
    if (!newAmount || !newDueDate) return
    try {
      await supabase.from('payment').insert([{ amount: Number(newAmount), due_date: newDueDate }])
      setIsPaymentOpen(false)
      setNewAmount('')
      setNewDueDate('')
      fetchData()
      toast({ title: 'Sucesso', description: 'Pagamento registrado.' })
    } catch (err) {
      toast({ title: 'Erro ao criar', variant: 'destructive' })
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const totalPayments = payments.reduce((acc, curr) => acc + Number(curr.amount || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">Gestão de pagamentos associados aos contratos.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsPaymentOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" /> Novo Pagamento
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-1">
        <Card className="hover:border-emerald-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Pagamentos Recebidos/Previstos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPayments)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vencimento</TableHead>
              <TableHead>ID Contrato</TableHead>
              <TableHead>Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : payments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                  Nenhum pagamento registrado.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => {
                const isOverdue =
                  payment.due_date &&
                  isPast(new Date(payment.due_date)) &&
                  !isToday(new Date(payment.due_date))
                return (
                  <TableRow key={payment.id}>
                    <TableCell className={isOverdue ? 'text-rose-500 font-medium' : ''}>
                      {payment.due_date ? format(new Date(payment.due_date), 'dd/MM/yyyy') : '-'}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.contract_id?.split('-')[0] || '-'}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      {formatCurrency(payment.amount)}
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="number"
              placeholder="Valor (R$)"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
            />
            <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
          </div>
          <DialogFooter>
            <Button onClick={handleCreatePayment}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
