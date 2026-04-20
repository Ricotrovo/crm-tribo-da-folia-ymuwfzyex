import pb from '@/lib/pocketbase/client'

export interface Lead {
  id: string
  name: string
  status: string
  profile_id: string | null
  created: string
  updated: string
}

export const getLeads = async () => {
  const records = await pb.collection('leads').getFullList({ sort: '-created' })
  return records as unknown as Lead[]
}

export const createLead = async (lead: Partial<Lead>) => {
  const record = await pb.collection('leads').create(lead)
  return record as unknown as Lead
}

export const updateLeadStatus = async (id: string, status: string) => {
  const record = await pb.collection('leads').update(id, { status })
  return record as unknown as Lead
}
