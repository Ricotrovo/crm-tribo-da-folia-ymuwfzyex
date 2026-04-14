import { supabase } from '@/lib/supabase/client'

export const createPayment = async (data: any) => {
  const { data: payment, error } = await supabase.from('payment').insert([data]).select().single()
  if (error) throw error
  return payment
}
