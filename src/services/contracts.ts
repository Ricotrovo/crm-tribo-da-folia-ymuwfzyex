import pb from '@/lib/pocketbase/client'

export async function createContract(data: any) {
  const record = await pb.collection('contracts').create({
    client_id: data.client_id,
    total_value: data.total_value,
  })
  return record
}
