import pb from '@/lib/pocketbase/client'

export const createPayment = async (data: any) => {
  const record = await pb.collection('payments').create(data)
  return record
}
