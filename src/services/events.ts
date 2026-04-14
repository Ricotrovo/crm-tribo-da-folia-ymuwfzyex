import { supabase } from '@/lib/supabase/client'

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

    if (error) {
      throw error
    }

    return (data as EventRecord[]) || []
  },

  async updateEvent(id: string, updates: Partial<EventRecord>) {
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
