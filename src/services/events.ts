import { supabase } from '@/lib/supabase/client'
import { mockEvents } from '@/lib/mock-data'

export type EventRecord = {
  id: string
  title: string
  date: string
  time: string
  salon: 'Premium' | 'Kids&Teens'
  client_name: string
  guests: number
  menu: string
  status: string
}

export const eventService = {
  async getEventsByDate(dateStr: string): Promise<EventRecord[]> {
    const { data, error } = await supabase.from('events').select('*').eq('date', dateStr)

    if (error || !data || data.length === 0) {
      // Fallback para mock local se a tabela estiver vazia ou offline
      return mockEvents
        .filter((e) => e.date === dateStr)
        .map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          time: e.time,
          salon: e.salon as 'Premium' | 'Kids&Teens',
          client_name: e.client,
          guests: 50,
          menu: 'Standard',
          status: e.status,
        }))
    }

    return data as EventRecord[]
  },

  async updateEvent(id: string, updates: Partial<EventRecord>) {
    // Se o ID for de um evento mockado (curto), simula a atualização
    if (id.length < 10) {
      return { id, ...updates }
    }

    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw error
    }
    return data
  },
}
