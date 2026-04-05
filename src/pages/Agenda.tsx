import { useState, useEffect, Fragment } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin, Plus, Users, Utensils, CalendarSync } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { eventService, EventRecord } from '@/services/events'
import { supabase } from '@/lib/supabase/client'

const TIME_SLOTS = ['12:00', '12:30', '13:00', '19:00', '19:30', '20:00']
const SALONS = ['Premium', 'Kids&Teens'] as const

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

const EventCard = ({
  event,
  onDragStart,
}: {
  event: EventRecord
  onDragStart: (e: React.DragEvent) => void
}) => {
  const isPremium = event.salon === 'Premium'
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            draggable
            onDragStart={onDragStart}
            className={cn(
              'cursor-grab active:cursor-grabbing p-3 rounded-md shadow-sm border-l-4 h-full flex flex-col justify-center',
              isPremium
                ? 'bg-blue-50 border-blue-500 hover:bg-blue-100'
                : 'bg-emerald-50 border-emerald-500 hover:bg-emerald-100',
            )}
          >
            <div className="font-semibold text-sm line-clamp-2 leading-tight">{event.title}</div>
            <div className="text-xs text-muted-foreground mt-1 truncate">{event.client_name}</div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="space-y-2 p-3 min-w-[200px] z-50 shadow-xl">
          <p className="font-semibold text-base">{event.title}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" /> {event.time}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground" /> {event.salon}
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-muted-foreground" /> {event.guests}
            </div>
            <div className="flex items-center gap-1">
              <Utensils className="w-3.5 h-3.5 text-muted-foreground" /> {event.menu}
            </div>
          </div>
          <div className="pt-2">
            <Badge variant={event.status === 'Confirmed' ? 'default' : 'secondary'}>
              {event.status}
            </Badge>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export default function Agenda() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState<EventRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [dragOverCell, setDragOverCell] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (!date) return
    loadEvents(date)

    const channel = supabase
      .channel('events_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
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

  const handleDragStart = (e: React.DragEvent, event: EventRecord) => {
    if (date && isPastDate(date)) {
      e.preventDefault()
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível alterar eventos no passado.',
        variant: 'destructive',
      })
      return
    }
    e.dataTransfer.setData('eventId', event.id)
  }

  const validateMove = (eventId: string, targetTime: string, targetSalon: string) => {
    const targetIsLunch = ['12:00', '12:30', '13:00'].includes(targetTime)

    const existingEvent = events.find(
      (e) => e.time === targetTime && e.salon === targetSalon && e.id !== eventId,
    )
    if (existingEvent) return 'Salão indisponível neste horário.'

    const salonEvents = events.filter((e) => e.salon === targetSalon && e.id !== eventId)
    const hasLunch = salonEvents.find((e) => ['12:00', '12:30', '13:00'].includes(e.time))
    const hasDinner = salonEvents.find((e) => ['19:00', '19:30', '20:00'].includes(e.time))

    if (targetIsLunch && hasLunch) return 'Este salão já possui um evento de almoço neste dia.'
    if (!targetIsLunch && hasDinner) return 'Este salão já possui um evento de jantar neste dia.'

    if (targetIsLunch && targetTime === '13:00' && hasDinner && hasDinner.time !== '20:00') {
      return 'Restrição: Almoço às 13h exige que o jantar seja às 20h. Já há um jantar em outro horário.'
    }
    if (!targetIsLunch && targetTime !== '20:00' && hasLunch && hasLunch.time === '13:00') {
      return 'Restrição: Almoço às 13h exige que o jantar seja às 20h.'
    }
    return null
  }

  const handleDrop = async (
    e: React.DragEvent,
    targetTime: string,
    targetSalon: 'Premium' | 'Kids&Teens',
  ) => {
    e.preventDefault()
    setDragOverCell(null)

    if (date && isPastDate(date)) {
      toast({
        title: 'Ação não permitida',
        description: 'Não é possível alterar eventos no passado.',
        variant: 'destructive',
      })
      return
    }

    const eventId = e.dataTransfer.getData('eventId')
    if (!eventId) return

    const event = events.find((ev) => ev.id === eventId)
    if (!event) return
    if (event.time === targetTime && event.salon === targetSalon) return

    const errorMsg = validateMove(eventId, targetTime, targetSalon)
    if (errorMsg) {
      toast({ title: 'Conflito de Agenda', description: errorMsg, variant: 'destructive' })
      return
    }

    // Optimistic update
    setEvents((prev) =>
      prev.map((ev) => (ev.id === eventId ? { ...ev, time: targetTime, salon: targetSalon } : ev)),
    )

    try {
      await eventService.updateEvent(eventId, { time: targetTime, salon: targetSalon })
      toast({ title: 'Sucesso', description: 'O horário do evento foi alterado.' })
    } catch (err) {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível salvar a alteração.',
        variant: 'destructive',
      })
      if (date) loadEvents(date) // Revert
    }
  }

  const isPast = date ? isPastDate(date) : false

  return (
    <div className="space-y-6 fade-in-up pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda Inteligente</h2>
          <p className="text-muted-foreground">Gerencie eventos com proteção anti-overbooking.</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() =>
              toast({
                title: 'Sincronização iniciada',
                description: 'Buscando eventos do Google Calendar...',
              })
            }
          >
            <CalendarSync className="mr-2 h-4 w-4" /> Sync Google
          </Button>
          <Button className="w-full sm:w-auto">
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Legenda dos Salões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3 bg-blue-50/50 p-2 rounded-md border border-blue-100">
                <div className="w-4 h-4 rounded bg-blue-500 shadow-sm"></div>
                <span className="font-medium text-blue-900">Premium</span>
              </div>
              <div className="flex items-center gap-3 bg-emerald-50/50 p-2 rounded-md border border-emerald-100">
                <div className="w-4 h-4 rounded bg-emerald-500 shadow-sm"></div>
                <span className="font-medium text-emerald-900">Kids & Teens</span>
              </div>
              <p className="text-xs text-muted-foreground pt-2 text-center">
                Arraste os eventos para alterar o horário
              </p>
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
                    Data no Passado (Somente Leitura)
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <div className="min-w-[650px] p-6">
                <div className="grid grid-cols-[80px_1fr_1fr] gap-4 mb-4">
                  <div className="font-bold text-center text-muted-foreground self-center text-sm">
                    Horário
                  </div>
                  <div className="font-bold text-center text-blue-700 bg-blue-50 py-2 rounded-md border border-blue-100">
                    Salão Premium
                  </div>
                  <div className="font-bold text-center text-emerald-700 bg-emerald-50 py-2 rounded-md border border-emerald-100">
                    Salão Kids&Teens
                  </div>
                </div>

                <div className="grid grid-cols-[80px_1fr_1fr] gap-4">
                  {TIME_SLOTS.map((time) => (
                    <Fragment key={time}>
                      <div className="flex items-center justify-center font-medium bg-muted/30 rounded-md border border-muted-foreground/10 text-muted-foreground h-[110px] text-sm">
                        {time}
                      </div>

                      {SALONS.map((salon) => {
                        const evt = events.find((e) => e.time === time && e.salon === salon)
                        const cellId = `${time}-${salon}`
                        const isOver = dragOverCell === cellId

                        return (
                          <div
                            key={cellId}
                            className={cn(
                              'border-2 rounded-xl p-2 h-[110px] transition-all relative',
                              isOver
                                ? 'border-primary bg-primary/5 border-dashed scale-[1.02]'
                                : 'border-dashed border-border/60 bg-transparent',
                              !evt && !isOver && !isPast && 'hover:bg-muted/20 hover:border-border',
                              isPast && !evt && 'bg-muted/5 border-transparent',
                            )}
                            onDragOver={(e) => {
                              e.preventDefault()
                              if (!isPast && dragOverCell !== cellId) setDragOverCell(cellId)
                            }}
                            onDrop={(e) => handleDrop(e, time, salon)}
                            onDragLeave={() => setDragOverCell(null)}
                          >
                            {!evt && (
                              <span className="absolute inset-0 flex items-center justify-center text-muted-foreground/40 text-xs font-medium opacity-0 hover:opacity-100 transition-opacity">
                                Soltar aqui
                              </span>
                            )}
                            {evt && (
                              <EventCard event={evt} onDragStart={(e) => handleDragStart(e, evt)} />
                            )}
                          </div>
                        )
                      })}
                    </Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
