import { supabase } from '@/lib/supabase/client'

export const createExpense = async (data: any) => {
  const { data: expense, error } = await supabase.from('expenses').insert([data]).select().single()
  if (error) throw error
  return expense
}
