import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Contract, getContractsByLead, createContract, deleteContract } from '@/services/contracts'
import { useRealtime } from '@/hooks/use-realtime'
import { Trash2, Plus, FileText, Calendar, DollarSign } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function LeadTabContratos({ leadId }: { leadId: string }) {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    contract_number: '',
    event_date: '',
    total_value: '',
    notes: '',
  })

  const loadContracts = async () => {
    if (!leadId) return
    try {
      const data = await getContractsByLead(leadId)
      setContracts(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadContracts()
  }, [leadId])

  useRealtime('contracts', () => {
    loadContracts()
  })

  const handleAddContract = async () => {
    if (!formData.contract_number) {
      toast({ title: 'Número do contrato é obrigatório', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      await createContract({
        lead_id: leadId,
        contract_number: formData.contract_number,
        event_date: formData.event_date,
        total_value: formData.total_value ? Number(formData.total_value) : 0,
        notes: formData.notes,
      })
      toast({ title: 'Contrato adicionado com sucesso!' })
      setFormData({ contract_number: '', event_date: '', total_value: '', notes: '' })
      setShowForm(false)
    } catch (e: any) {
      toast({ title: 'Erro ao adicionar contrato', description: e.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteContract(id)
      toast({ title: 'Contrato removido.' })
    } catch (e: any) {
      toast({ title: 'Erro ao remover contrato', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Histórico de contratos deste cliente.</p>
        {!showForm && (
          <Button type="button" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Novo Contrato
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-muted/40 p-4 rounded-lg border space-y-4 mb-6">
          <h4 className="font-semibold text-sm">Novo Contrato</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Número do Contrato <span className="text-red-500">*</span>
              </Label>
              <Input
                value={formData.contract_number}
                onChange={(e) => setFormData({ ...formData, contract_number: e.target.value })}
                placeholder="Ex: CT-2023/001"
              />
            </div>
            <div className="space-y-2">
              <Label>Data do Evento</Label>
              <Input
                type="date"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                value={formData.total_value}
                onChange={(e) => setFormData({ ...formData, total_value: e.target.value })}
                placeholder="0.00"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Observação</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Detalhes, itens inclusos, forma de pagamento..."
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleAddContract}
              disabled={loading || !formData.contract_number}
            >
              {loading ? 'Salvando...' : 'Salvar Contrato'}
            </Button>
          </div>
        </div>
      )}

      {contracts.length === 0 && !showForm ? (
        <div className="text-center py-6 border border-dashed rounded-lg bg-background">
          <p className="text-sm text-muted-foreground">Nenhum contrato registrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contracts.map((contract) => (
            <div
              key={contract.id}
              className="flex flex-col sm:flex-row gap-4 justify-between bg-background p-4 rounded-lg border shadow-sm"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <h5 className="font-semibold text-sm flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-primary" /> {contract.contract_number}
                  </h5>
                  {contract.event_date && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(contract.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {contract.total_value > 0 && (
                    <span className="text-xs font-medium text-emerald-600 flex items-center">
                      <DollarSign className="w-3.5 h-3.5" />
                      {contract.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
                {contract.notes && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {contract.notes}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive self-start"
                onClick={() => handleDelete(contract.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
