import pb from '@/lib/pocketbase/client'

export async function getInventory() {
  try {
    const stock = await pb.collection('stock').getFullList()
    return stock.map((s: any) => ({
      id: s.id,
      name: s.name,
      quantity: s.quantity,
      locations: [{ location: 'Main', quantity: s.quantity }],
    }))
  } catch (error) {
    return []
  }
}

export async function getMovements() {
  return []
}

export async function getUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  try {
    const data = await pb.collection('events').getFullList({
      filter: `date >= '${today}' && date <= '${nextWeekStr}'`,
      sort: 'date',
    })
    return data
  } catch (error) {
    return []
  }
}

export async function addMovement(payload: any) {
  return { data: null, error: null }
}
