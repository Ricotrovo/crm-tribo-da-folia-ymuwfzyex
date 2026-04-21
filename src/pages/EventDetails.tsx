import { useParams, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import pb from '@/lib/pocketbase/client'
import { EventItemsSection } from '@/components/events/EventItemsSection'
import { EventDishesSection } from '@/components/events/EventDishesSection'
import { ArrowLeft, Calendar, Users, MapPin } from 'lucide-react'

export default function EventDetails() {
  const { id } = useParams()
  const [event, setEvent] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      pb.collection('events')
        .getOne(id)
        .then(setEvent)
        .catch(console.error)
        .finally(() => setLoading(false))
    }
  }, [id])

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground">Carregando detalhes do evento...</div>
    )
  if (!event) return <div className="p-8 text-center text-red-500">Evento não encontrado.</div>

  return (
    <div className="flex flex-col p-6 max-w-6xl mx-auto space-y-6 animate-in fade-in-up duration-300">
      <Link
        to="/agenda"
        className="flex items-center text-sm text-muted-foreground hover:text-foreground w-fit"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Voltar para Agenda
      </Link>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="text-lg text-muted-foreground mt-1">Cliente: {event.client_name}</p>
          </div>
          <div className="flex flex-col gap-2 bg-muted/50 p-4 rounded-md text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" /> {event.date} às {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Salão: {event.salon}
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" /> {event.guests} Convidados
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 bg-card border p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-4">Itens e Serviços Contratados</h2>
        <EventItemsSection eventId={event.id} />
      </div>

      <div className="space-y-4 bg-card border p-6 rounded-lg shadow-sm mt-6">
        <EventDishesSection eventId={event.id} guestCount={event.guests || 0} />
      </div>
    </div>
  )
}
