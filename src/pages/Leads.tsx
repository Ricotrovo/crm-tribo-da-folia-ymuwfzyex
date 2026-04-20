import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Calendar as CalendarIcon, Users as UsersIcon, MessageCircle } from 'lucide-react'
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
import { getLeads, updateLeadStatus, Lead } from '@/services/leads'
import { useRealtime } from '@/hooks/use-realtime'
import { LeadDetails } from '@/components/leads/LeadDetails'
import { NewLeadDialog } from '@/components/leads/NewLeadDialog'
import { getUsers, User } from '@/services/users'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const STAGES = ['Novo', 'Contato Inicial', 'Proposta', 'Visita', 'Fechado'] as const

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])

  // Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [filterTemp, setFilterTemp] = useState<string>('all')
  const [filterSeller, setFilterSeller] = useState<string>('all')
  const [filterDateStart, setFilterDateStart] = useState<Date | undefined>()
  const [filterDateEnd, setFilterDateEnd] = useState<Date | undefined>()

  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [isNewLeadOpen, setIsNewLeadOpen] = useState(false)
  const [newLeadName, setNewLeadName] = useState('')
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const { toast } = useToast()

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

  useEffect(() => {
    loadLeads()
    getUsers().then(setUsers).catch(console.error)
  }, [])

  const filteredLeads = leads.filter((l) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchName = l.name.toLowerCase().includes(searchLower)
      const matchPhone =
        l.phone?.includes(searchTerm.replace(/\D/g, '')) || l.phone?.includes(searchTerm)
      if (!matchName && !matchPhone) return false
    }
    if (filterTemp !== 'all' && l.temperature !== filterTemp) return false
    if (filterSeller !== 'all' && l.profile_id !== filterSeller) return false
    if (filterDateStart || filterDateEnd) {
      if (!l.event_date) return false
      const eventDate = new Date(l.event_date + 'T12:00:00')
      if (filterDateStart && eventDate < filterDateStart) return false
      if (filterDateEnd && eventDate > filterDateEnd) return false
    }
    return true
  })

  useRealtime('leads', () => loadLeads())

  const getTemperatureColor = (temp?: string) => {
    if (temp === 'Quente') return 'border-l-8 border-l-red-500'
    if (temp === 'Morno') return 'border-l-8 border-l-yellow-500'
    if (temp === 'Frio') return 'border-l-8 border-l-blue-500'
    return 'border-l-8 border-l-transparent'
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

      <div className="flex flex-wrap gap-3 items-center bg-muted/30 p-3 rounded-lg border border-border/50">
        <Input
          placeholder="Buscar por nome ou telefone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-[250px] bg-background"
        />

        <Select value={filterTemp} onValueChange={setFilterTemp}>
          <SelectTrigger className="w-[160px] bg-background">
            <SelectValue placeholder="Temperatura" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="Quente">Quente 🔴</SelectItem>
            <SelectItem value="Morno">Morno 🟠</SelectItem>
            <SelectItem value="Frio">Frio 🔵</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterSeller} onValueChange={setFilterSeller}>
          <SelectTrigger className="w-[180px] bg-background">
            <SelectValue placeholder="Vendedor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Vendedores</SelectItem>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.name || u.email}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[140px] justify-start text-left font-normal bg-background',
                  !filterDateStart && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDateStart
                  ? format(filterDateStart, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data Inicial'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDateStart}
                onSelect={setFilterDateStart}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <span className="text-muted-foreground text-sm">até</span>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-[140px] justify-start text-left font-normal bg-background',
                  !filterDateEnd && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filterDateEnd
                  ? format(filterDateEnd, 'dd/MM/yyyy', { locale: ptBR })
                  : 'Data Final'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filterDateEnd}
                onSelect={setFilterDateEnd}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {(filterDateStart ||
            filterDateEnd ||
            searchTerm ||
            filterTemp !== 'all' ||
            filterSeller !== 'all') && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearchTerm('')
                setFilterTemp('all')
                setFilterSeller('all')
                setFilterDateStart(undefined)
                setFilterDateEnd(undefined)
              }}
              className="text-xs h-8 px-2"
            >
              Limpar
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4 items-start">
        {STAGES.map((stage) => {
          const columnLeads = filteredLeads.filter((l) => l && l.status === stage)
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
                      onClick={() => setSelectedLeadId(lead.id)}
                      className={cn(
                        'cursor-pointer active:cursor-grabbing hover:border-primary/50 transition-colors shadow-sm overflow-hidden',
                        draggingId === lead.id ? 'opacity-50' : 'opacity-100',
                        getTemperatureColor(lead.temperature),
                      )}
                    >
                      <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between">
                        <CardTitle className="text-sm font-bold leading-tight">
                          {lead.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0 flex flex-col gap-2">
                        {lead.phone && (
                          <div
                            className="flex items-center text-xs gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <a
                              href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 hover:underline text-[#25D366] font-medium transition-colors hover:text-[#128C7E]"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              {lead.phone}
                            </a>
                          </div>
                        )}
                        {lead.event_date && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                            <CalendarIcon className="w-3 h-3" />
                            <span>
                              Data do Evento:{' '}
                              {new Date(lead.event_date + 'T12:00:00').toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        )}
                        {lead.guest_count !== undefined && lead.guest_count !== null && (
                          <div className="flex items-center text-xs text-muted-foreground gap-1.5">
                            <UsersIcon className="w-3 h-3" />
                            <span>{lead.guest_count} Convidados</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          <div className="text-[10px] text-muted-foreground">
                            Criado: {new Date(lead.created).toLocaleDateString('pt-BR')}
                          </div>
                          {lead.expand?.profile_id && (
                            <div className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                              {lead.expand.profile_id.name || 'Vendedor'}
                            </div>
                          )}
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

      {selectedLeadId && (
        <LeadDetails
          leadId={selectedLeadId}
          open={!!selectedLeadId}
          onOpenChange={(open) => {
            if (!open) setSelectedLeadId(null)
          }}
        />
      )}

      {isNewLeadOpen && (
        <NewLeadDialog open={isNewLeadOpen} onOpenChange={setIsNewLeadOpen} onSuccess={loadLeads} />
      )}
    </div>
  )
}
