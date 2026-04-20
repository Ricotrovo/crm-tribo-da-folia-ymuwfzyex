import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Lead, Child, getChildren, createChild, deleteChild } from '@/services/leads'
import { useRealtime } from '@/hooks/use-realtime'
import { Trash2, Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Props {
  lead: Partial<Lead>
  onChange: (lead: Partial<Lead>) => void
  leadId: string
}

export function LeadTabFamilia({ lead, onChange, leadId }: Props) {
  const [children, setChildren] = useState<Child[]>([])
  const [newChildName, setNewChildName] = useState('')
  const [newChildBirth, setNewChildBirth] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const loadChildren = async () => {
    if (!leadId) return
    try {
      const data = await getChildren(leadId)
      setChildren(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    loadChildren()
  }, [leadId])

  useRealtime('children', loadChildren)

  const handleAddChild = async () => {
    if (!newChildName) return
    setLoading(true)
    try {
      await createChild({
        lead_id: leadId,
        name: newChildName,
        birthday: newChildBirth || undefined,
      })
      setNewChildName('')
      setNewChildBirth('')
      toast({ title: 'Filho adicionado com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro ao adicionar filho.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChild = async (id: string) => {
    try {
      await deleteChild(id)
      toast({ title: 'Filho removido com sucesso.' })
    } catch (e) {
      toast({ title: 'Erro ao remover filho.', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 mb-6 pb-6 border-b">
        <h4 className="font-semibold text-sm">Dados do Evento</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Data do Evento</Label>
            <Input
              type="date"
              value={lead.event_date || ''}
              onChange={(e) => onChange({ ...lead, event_date: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label>Convidados (Qtd)</Label>
            <Input
              type="number"
              value={lead.guest_count || ''}
              onChange={(e) =>
                onChange({
                  ...lead,
                  guest_count: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              placeholder="Ex: 50"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Nome do Cônjuge</Label>
          <Input
            value={lead.spouse_name || ''}
            onChange={(e) => onChange({ ...lead, spouse_name: e.target.value })}
            placeholder="Nome completo"
          />
        </div>
        <div className="grid gap-2">
          <Label>Data de Nascimento do Lead</Label>
          <Input
            type="date"
            value={lead.birthday || ''}
            onChange={(e) => onChange({ ...lead, birthday: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-sm border-b pb-2">Filhos</h4>

        <div className="space-y-2">
          {children.map((child) => (
            <div
              key={child.id}
              className="flex items-center gap-3 bg-muted/50 p-2.5 rounded-lg border"
            >
              <div className="flex-1 text-sm font-medium">{child.name}</div>
              <div className="text-xs text-muted-foreground w-28 whitespace-nowrap">
                {child.birthday
                  ? new Date(child.birthday + 'T12:00:00').toLocaleDateString('pt-BR')
                  : '-'}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteChild(child.id)}
                className="h-8 w-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          {children.length === 0 && (
            <p className="text-sm text-muted-foreground py-2">Nenhum filho cadastrado.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-end gap-3 pt-2">
          <div className="grid gap-2 flex-1 w-full">
            <Label>Nome do Filho</Label>
            <Input
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              placeholder="Ex: João Silva"
            />
          </div>
          <div className="grid gap-2 w-full sm:w-40">
            <Label>Data de Nasc.</Label>
            <Input
              type="date"
              value={newChildBirth}
              onChange={(e) => setNewChildBirth(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={handleAddChild}
            disabled={!newChildName || loading}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" /> Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
