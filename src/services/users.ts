import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  avatar: string
}

export const getUsers = async () => {
  const records = await pb.collection('users').getFullList({ sort: 'name' })
  return records as unknown as User[]
}
