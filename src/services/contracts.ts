import { supabase } from '@/lib/supabase/client'

export async function createContract(data: any) {
  const { data: contract, error: contractError } = await supabase
    .from('contract')
    .insert({
      client_id: data.client_id,
      total_value: data.total_value,
    })
    .select()
    .single()

  if (contractError) throw contractError
  return contract
}
