import pb from '@/lib/pocketbase/client'

export const createFreelancer = async (data: any) => {
  const { role, hourly_rate, ...freelancerData } = data
  const record = await pb.collection('freelancers').create(freelancerData)
  return record
}

export const createAssignment = async (data: any) => {
  return { id: 'dummy' }
}
