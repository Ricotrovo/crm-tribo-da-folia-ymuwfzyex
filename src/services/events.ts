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
  created: string
  updated: string
}

export const eventService = {
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
