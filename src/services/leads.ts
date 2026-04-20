import pb from '@/lib/pocketbase/client'

export interface Lead {
  id: string
  name: string
  status: string
  phone?: string
  origin?: string
  spouse_name?: string
  birthday?: string
  email?: string
  instagram?: string
  rg?: string
  cpf?: string
  marital_status?: string
  address_zip?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  profile_id: string | null
  created: string
  updated: string
}

export interface Child {
  id: string
  lead_id: string
  name: string
  birthday: string
  created: string
  updated: string
}

export interface Interaction {
  id: string
  lead_id: string
  type: string
  notes: string
  feedback: string
  interaction_date: string
  created: string
  updated: string
}

export const getLeads = async () => {
  const records = await pb.collection('leads').getFullList({ sort: '-created' })
  return records as unknown as Lead[]
}

export const getLead = async (id: string) => {
  const record = await pb.collection('leads').getOne(id)
  return record as unknown as Lead
}

export const createLead = async (lead: Partial<Lead>) => {
  const record = await pb.collection('leads').create(lead)
  return record as unknown as Lead
}

export const updateLead = async (id: string, lead: Partial<Lead>) => {
  const record = await pb.collection('leads').update(id, lead)
  return record as unknown as Lead
}

export const updateLeadStatus = async (id: string, status: string) => {
  const record = await pb.collection('leads').update(id, { status })
  return record as unknown as Lead
}

export const deleteLead = async (id: string) => {
  await pb.collection('leads').delete(id)
}

export const getChildren = async (leadId: string) => {
  const records = await pb
    .collection('children')
    .getFullList({ filter: `lead_id = '${leadId}'`, sort: '-created' })
  return records as unknown as Child[]
}

export const createChild = async (child: Partial<Child>) => {
  const record = await pb.collection('children').create(child)
  return record as unknown as Child
}

export const deleteChild = async (id: string) => {
  await pb.collection('children').delete(id)
}

export const getInteractions = async (leadId: string) => {
  const records = await pb
    .collection('interactions')
    .getFullList({ filter: `lead_id = '${leadId}'`, sort: '-interaction_date' })
  return records as unknown as Interaction[]
}

export const createInteraction = async (interaction: Partial<Interaction>) => {
  const record = await pb.collection('interactions').create(interaction)
  return record as unknown as Interaction
}
