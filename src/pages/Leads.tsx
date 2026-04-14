import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getLeads, updateLeadStatus, createLead, Lead } from '@/services/leads'
import { supabase } from '@/lib/supabase/client'

const STAGES = ['Novo', 'Contato Inicial', 'Proposta', 'Visita', 'Fechado'] as const

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [newLeadName, setNewLeadName] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    loadLeads()

    const channel = supabase
      .channel('lead_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead' }, () => {
        loadLeads()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadLeads = async () => {
    try {
      const data = await getLeads()
      if (data) setLeads(data)
    } catch (err: any) {
      console.error(err)
      toast({
        title: 'Erro',
        description: err.message || 'Falha ao carregar leads.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLead = async () => {
    if (!newLeadName.trim()) return
    try {
      await createLead({ name: newLeadName, status: 'Novo' })
      setIsNewLeadOpen(false)
      setNewLeadName('')
      loadLeads()
      toast({ title: 'Sucesso', description: 'Lead criado com sucesso!' })
    } catch (err) {
      toast({ title: 'Erro', description: 'Falha ao criar lead.', variant: 'destructive' })
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id)
    setDraggingId(id)
  }

  const handleDragEnd = () => setDraggingId(null)

  const handleDragOver = (e: React.DragEvent) => e.preventDefault()

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    setDraggingId(null)
    const leadId = e.dataTransfer.getData('leadId')

    if (leadId) {
      const lead = leads.find((l) => l.id === leadId)
      if (!lead || lead.status === newStatus) return

      setLeads((current) => current.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)))

      try {
        await updateLeadStatus(leadId, newStatus)
        toast({ title: 'Sucesso', description: `${lead.name} movido para ${newStatus}` })
      } catch (err) {
        toast({ title: 'Erro', description: 'Falha ao mover lead.', variant: 'destructive' })
        setLeads((current) =>
          current.map((l) => (l.id === leadId ? { ...l, status: lead.status } : l)),
        )
      }
    }
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Funil de Vendas</h2>
          <p className="text-muted-foreground">
            Gerencie seus leads utilizando os dados em tempo real.
          </p>
        </div>
        <Button onClick={() => setIsNewLeadOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Lead
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
        {STAGES.map((stage) => {
          const columnLeads = leads.filter((l) => l && l.status === stage)
          return (
            <div
              key={stage}
              className={cn(
                'flex flex-col bg-muted/40 rounded-xl p-3 min-w-[260px] border transition-colors h-full max-h-[calc(100vh-12rem)]',
                draggingId ? 'border-primary/20 bg-muted/60' : 'border-transparent',
              )}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage)}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-foreground uppercase tracking-wider">
                  {stage}
                </h3>
                <Badge variant="secondary" className="rounded-full">
                  {columnLeads.length}
                </Badge>
              </div>

              <div className="flex flex-col gap-2 overflow-y-auto pr-1 pb-2">
                {loading ? (
                  <>
                    <Skeleton className="h-24 w-full rounded-lg" />
                    <Skeleton className="h-24 w-full rounded-lg" />
                  </>
                ) : (
                  columnLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        'cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm',
                        draggingId === lead.id ? 'opacity-50' : 'opacity-100',
                      )}
                    >
                      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between">
                        <CardTitle className="text-sm font-medium leading-tight">
                          {lead.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground">
                          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
                {!loading && columnLeads.length === 0 && (
                  <div className="text-center p-4 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground">
                    Arraste leads para cá
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <Dialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Lead</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Input
              placeholder="Nome do lead"
              value={newLeadName}
              onChange={(e) => setNewLeadName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleCreateLead}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
