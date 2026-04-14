import { supabase } from '@/lib/supabase/client'

export type EventRecord = {
  id: string
  title: string
  date: string
  salon: string
  profile_id: string | null
  created_at: string
  updated_at: string | null
}

export const eventService = {
  async getEventsByDate(dateStr: string): Promise<EventRecord[]> {
    const { data, error } = await supabase.from('event').select('*').eq('date', dateStr)

    if (error) {
      throw error
    }

    return (data as EventRecord[]) || []
  },

  async updateEvent(id: string, updates: Partial<EventRecord>) {
    const { data, error } = await supabase
      .from('event')
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
