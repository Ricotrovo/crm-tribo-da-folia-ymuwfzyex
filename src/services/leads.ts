import { supabase } from '@/lib/supabase/client'

export interface Lead {
  id: string
  name: string
  status: string
  profile_id: string | null
  created_at: string
  updated_at: string | null
}

export const getLeads = async () => {
  const { data, error } = await supabase
    .from('lead')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Lead[]
}

export const createLead = async (lead: Partial<Lead>) => {
  const { data, error } = await supabase.from('lead').insert([lead]).select().single()

  if (error) throw error
  if (!data) throw new Error('Falha ao criar lead (sem retorno do banco)')
  return data as Lead
}

export const updateLeadStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('lead')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}
