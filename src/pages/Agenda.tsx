import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { eventService, EventRecord } from '@/services/events'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const isPastDate = (d: Date) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const check = new Date(d)
  check.setHours(0, 0, 0, 0)
  return check < today
}

const formatDateForDb = (d: Date) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [isEventSheetOpen, setIsEventSheetOpen] = useState(false)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventSalon, setNewEventSalon] = useState('Premium')
  const { toast } = useToast()

  useEffect(() => {
    if (!date) return
    loadEvents(date)

    const channel = supabase
      .channel('event_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'event' }, () => {
        loadEvents(date)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [date])

  const loadEvents = async (d: Date) => {
    setLoading(true)
    try {
      const data = await eventService.getEventsByDate(formatDateForDb(d))
      setEvents(data)
    } catch (error) {
      toast({ title: 'Erro ao carregar eventos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!date || !newEventTitle) return
    try {
      await supabase.from('event').insert([
        {
          title: newEventTitle,
          salon: newEventSalon,
          date: formatDateForDb(date),
        },
      ])
      setIsEventSheetOpen(false)
      setNewEventTitle('')
      loadEvents(date)
      toast({ title: 'Sucesso', description: 'Evento criado.' })
    } catch (err) {
      toast({ title: 'Erro ao criar evento', variant: 'destructive' })
    }
  }

  const isPast = date ? isPastDate(date) : false

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">Gerencie seus eventos por data.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button className="w-full sm:w-auto" onClick={() => setIsEventSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Novo Evento
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 xl:col-span-3 space-y-6 lg:sticky lg:top-6">
          <Card>
            <CardContent className="pt-6 flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-md bg-card"
              />
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8 xl:col-span-9">
          <Card className="min-h-[600px] shadow-sm border-muted">
            <CardHeader className="border-b bg-muted/20 pb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    Eventos de {date?.toLocaleDateString('pt-BR')}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {loading ? 'Carregando eventos...' : `${events.length} evento(s) agendado(s).`}
                  </CardDescription>
                </div>
                {isPast && (
                  <Badge variant="destructive" className="animate-fade-in text-xs py-1">
                    Data no Passado
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {events.length === 0 && !loading ? (
                <div className="text-center text-muted-foreground py-10">
                  Nenhum evento para esta data.
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <Card
                      key={event.id}
                      className="p-4 flex flex-col gap-2 shadow-sm border-l-4 border-l-primary"
                    >
                      <div className="font-semibold text-lg">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Salão: {event.salon || 'N/A'}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isEventSheetOpen} onOpenChange={setIsEventSheetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Título do evento"
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
            />
            <Select value={newEventSalon} onValueChange={setNewEventSalon}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o salão" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Kids&Teens">Kids&Teens</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateEvent}>Salvar Evento</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
