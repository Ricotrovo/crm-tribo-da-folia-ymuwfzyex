import pb from '@/lib/pocketbase/client'

export type EventRecord = {
  id: string
  title: string
  date: string
  time: string
  salon: string
  client_name: string
  guests: number
  menu: string
  status: string
  profile_id: string | null
  start_time?: string
  salon_selection?: string
  duration?: number
  theme?: string
  cake_flavor?: string
  decoration_supplier_id?: string
  contract_id?: string
  created: string
  updated: string
}

export const eventService = {
  async checkAvailability(date: string, startTime: string, salon: string): Promise<boolean> {
    const existingEvents = await pb.collection('events').getFullList({
      filter: `date ~ '${date}' && status != 'canceled'`,
    })

    const isSameShift = (t1: string, t2: string) => {
      if (!t1 || !t2) return false
      const lunch = ['12:00', '12:30', '14:00']
      const dinner = ['19:00', '19:30', '20:00']
      return (
        (lunch.includes(t1) && lunch.includes(t2)) || (dinner.includes(t1) && dinner.includes(t2))
      )
    }

    for (const e of existingEvents) {
      if (e.start_time && isSameShift(e.start_time as string, startTime)) {
        if (
          e.salon_selection === 'Ambos os Salões' ||
          salon === 'Ambos os Salões' ||
          e.salon_selection === salon
        ) {
          return false // conflict
        }
      }
    }
    return true
  },

  async getEventsByDate(dateStr: string): Promise<EventRecord[]> {
    const records = await pb.collection('events').getFullList({
      filter: `date = '${dateStr}'`,
      sort: 'time',
    })
    return records as unknown as EventRecord[]
  },

  async updateEvent(id: string, updates: Partial<EventRecord>) {
    const record = await pb.collection('events').update(id, updates)
    return record as unknown as EventRecord
  },
}
