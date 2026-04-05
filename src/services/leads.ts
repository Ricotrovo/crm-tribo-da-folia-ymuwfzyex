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
  const { data, error } = await supabase.from('leads').insert([lead]).select()

  if (error) throw error
  return data[0] as Lead
}

export const updateLeadStatus = async (id: string, status: string) => {
  const { data, error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0] as Lead
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
  sender: 'seller' | 'client' = 'seller',
) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert([{ lead_id: leadId, message, sender }])
    .select()

  if (error) throw error
  return data[0] as Conversation
}

export const getAIResponse = async (leadId: string, message: string) => {
  let aiMessage = 'Desculpe, não consegui processar no momento.'
  try {
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body: { lead_id: leadId, message },
    })
    if (!error && data?.reply) {
      aiMessage = data.reply
    } else {
      aiMessage = `Entendi sua pergunta: "${message}". No momento temos pacotes promocionais para festas no salão Premium e Kids&Teens. Gostaria de agendar uma visita ou que eu envie uma proposta detalhada?`
    }
  } catch (err) {
    aiMessage = `Entendi sua pergunta: "${message}". No momento temos pacotes promocionais para festas no salão Premium e Kids&Teens. Gostaria de agendar uma visita ou que eu envie uma proposta detalhada?`
  }

  const { data: convData, error: convError } = await supabase
    .from('conversations')
    .insert([{ lead_id: leadId, message: aiMessage, sender: 'ai' }])
    .select()

  if (convError) throw convError
  return convData[0] as Conversation
}
