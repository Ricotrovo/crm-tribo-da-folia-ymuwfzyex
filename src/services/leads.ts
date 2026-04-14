import { supabase } from '@/lib/supabase/client'

export interface Lead {
  id: string
  name: string
  phone: string | null
  origin: string
  status: string
  created_at: string
  updated_at?: string
}

export interface Conversation {
  id: string
  lead_id: string
  sender: 'client' | 'ai' | 'seller'
  message: string
  created_at: string
}

export const getLeads = async () => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Lead[]
}

export const createLead = async (lead: Partial<Lead>) => {
  const { data, error } = await supabase.from('leads').insert([lead]).select().single()

  if (error) throw error
  if (!data) throw new Error('Falha ao criar lead (sem retorno do banco)')
  return data as Lead
}

export const updateLeadStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Lead
}

export const getConversations = async (leadId: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Conversation[]
}

export const sendMessage = async (
  leadId: string,
  message: string,
  sender: 'seller' | 'client' | 'ai' = 'seller',
) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ lead_id: leadId, message, sender }])
    .select()
    .single()

  if (error) throw error
  if (!data) throw new Error('Falha ao enviar mensagem (sem retorno)')
  return data as Conversation
}

export const getAIResponse = async (leadId: string, message: string) => {
  let aiMessage = ''
  try {
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body: { lead_id: leadId, message },
    })
    if (!error && data?.reply) {
      aiMessage = data.reply
    } else {
      aiMessage = `O serviço de IA está temporariamente indisponível. Por favor, aguarde o atendimento humano.`
    }
  } catch (err) {
    aiMessage = `O serviço de IA está temporariamente indisponível. Por favor, aguarde o atendimento humano.`
  }

  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .insert([{ lead_id: leadId, message: aiMessage, sender: 'ai' }])
    .select()
    .single()

  if (convError) throw convError
  return convData as Conversation
}
