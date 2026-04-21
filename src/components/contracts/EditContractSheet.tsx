import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import pb from '@/lib/pocketbase/client'
import { toast } from 'sonner'
import { updateContract } from '@/services/contracts'

export function EditContractSheet({ contract, open, onOpenChange, onSuccess }: any) {
  const [payments, setPayments] = useState<any[]>([])
  const [notes, setNotes] = useState(contract?.notes || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (contract?.id) {
      pb.collection('payments')
        .getFullList({ filter: `contract_id = '${contract.id}'` })
        .then(setPayments)
        .catch(() => {})
      setNotes(contract.notes || '')
    }
  }, [contract])

  const totalValue = contract?.total_value || 0
  const paidValue = payments
    .filter((p) => p.status === 'Paid')
    .reduce((acc, curr) => acc + curr.amount, 0)
  const saldoDevedor = Math.max(0, totalValue - paidValue)

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      await updateContract(contract.id, { notes })
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
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Alterar Contrato #{contract?.contract_number}</SheetTitle>
        </SheetHeader>
        <div className="space-y-6 mt-6">
          <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg border">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Total</span>
              <span className="font-bold">R$ {totalValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Valor Pago</span>
              <span className="font-bold text-emerald-600">R$ {paidValue.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-sm text-muted-foreground">Saldo Devedor</span>
              <span className="font-bold text-rose-600">R$ {saldoDevedor.toLocaleString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Observações</label>
            <Textarea
              rows={8}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observações e detalhes adicionais aqui..."
            />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
