import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { updateContract } from '@/services/contracts'

export function EditContractSheet({ contract, open, onOpenChange, onSuccess }: any) {
  const [payments, setPayments] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('draft')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (contract?.id && open) {
      pb.collection('payments')
        .getFullList({ filter: `contract_id = '${contract.id}'`, sort: 'due_date' })
        .then(setPayments)
        .catch(() => {})
      setNotes(contract.notes || '')
      setStatus(contract.status || 'draft')
    }
  }, [contract, open])

  const totalValue = contract?.total_value || 0
  const paidValue = payments
    .filter((p) => p.status.toLowerCase() === 'paid')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const saldoDevedor = Math.max(0, totalValue - paidValue)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateContract(contract.id, { notes, status })

      if (status === 'canceled' && contract.status !== 'canceled') {
        const events = await pb
          .collection('events')
          .getFullList({ filter: `contract_id = '${contract.id}'` })
        for (const ev of events) {
          await pb.collection('events').update(ev.id, { status: 'canceled' })
        }
      }

      toast.success('Contrato alterado com sucesso.')
      onSuccess()
    } catch (e: any) {
      toast.error('Falha ao atualizar o contrato.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Alterar Contrato #{contract?.contract_number}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg border text-center">
            <div>
              <span className="block text-xs text-muted-foreground uppercase">Valor Total</span>
              <span className="block text-lg font-bold">
                R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground uppercase">Pago</span>
              <span className="block text-lg font-bold text-emerald-600">
                R$ {paidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="block text-xs text-muted-foreground uppercase">Saldo</span>
              <span className="block text-lg font-bold text-rose-600">
                R$ {saldoDevedor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Status do Contrato</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="finalized">Finalizado</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>
            {status === 'canceled' && contract?.status !== 'canceled' && (
              <p className="text-xs text-rose-500 mt-1 font-medium">
                Atenção: Ao salvar como cancelado, a data do evento será liberada na agenda.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações e detalhes adicionais aqui..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Histórico de Pagamentos</label>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="py-2 h-8">Vencimento</TableHead>
                    <TableHead className="py-2 h-8">Valor</TableHead>
                    <TableHead className="py-2 h-8">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                        Nenhum pagamento registrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="py-2">
                          {new Date(p.due_date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="py-2 font-medium">
                          R$ {p.amount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant={p.status.toLowerCase() === 'paid' ? 'default' : 'secondary'}
                            className={
                              p.status.toLowerCase() === 'paid'
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : ''
                            }
                          >
                            {p.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
