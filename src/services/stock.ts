import { supabase } from '@/lib/supabase/client'

export async function getInventory() {
  const { data: products } = await supabase.from('products' as any).select('*')
  const { data: stock } = await supabase.from('stock' as any).select('*')

  return (
    products?.map((p: any) => {
      const pStock = stock?.filter((s: any) => s.product_id === p.id) || []
      const totalQty = pStock.reduce((acc: number, s: any) => acc + Number(s.quantity), 0)
      const locations = pStock.map((s: any) => ({
        location: s.location,
        quantity: Number(s.quantity),
      }))
      return { ...p, quantity: totalQty, locations }
    }) || []
  )
}

export async function getMovements() {
  const { data } = await supabase
    .from('stock_movements' as any)
    .select('*, product:products(*), event:events(*)')
    .order('created_at', { ascending: false })
  return data || []
}

export async function getUpcomingEvents() {
  const today = new Date().toISOString().split('T')[0]
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)
  const nextWeekStr = nextWeek.toISOString().split('T')[0]

  const { data } = await supabase
    .from('events')
    .select('*')
    .gte('date', today)
    .lte('date', nextWeekStr)
    .order('date', { ascending: true })
  return data || []
}

export async function addMovement(payload: any) {
  const { data, error } = await supabase.from('stock_movements' as any).insert([payload])
  return { data, error }
}
