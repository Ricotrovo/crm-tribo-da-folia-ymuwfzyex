import pb from '@/lib/pocketbase/client'

export interface Contract {
  id: string
  lead_id: string
  client_id?: string
  total_value: number
  contract_number: string
  event_date: string
  notes: string
  created: string
  updated: string
}

export const getContractsByLead = async (leadId: string) => {
  const records = await pb
    .collection('contracts')
    .getFullList({ filter: `lead_id = '${leadId}'`, sort: '-created' })
  return records as unknown as Contract[]
}

export const createContract = async (contract: Partial<Contract>) => {
  const record = await pb.collection('contracts').create(contract)
  return record as unknown as Contract
}

export const updateContract = async (id: string, contract: Partial<Contract>) => {
  const record = await pb.collection('contracts').update(id, contract)
  return record as unknown as Contract
}

export const deleteContract = async (id: string) => {
  await pb.collection('contracts').delete(id)
}
