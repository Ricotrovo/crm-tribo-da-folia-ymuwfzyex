import pb from '@/lib/pocketbase/client'

export const getPaymentsByContract = async (contractId: string) => {
  return await pb.collection('payments').getFullList({
    filter: `contract_id = '${contractId}'`,
    sort: 'due_date',
  })
}

export const createPayment = async (data: any) => {
  const record = await pb.collection('payments').create(data)
  return record
}

export const updatePayment = async (id: string, data: any) => {
  const record = await pb.collection('payments').update(id, data)
  return record
}
