import pb from '@/lib/pocketbase/client'

export interface User {
  id: string
  name: string
  email: string
  role: string
  role_title?: string
  salary?: number
  admission_date?: string
  vacation_info?: string
  crm_access_level?: string
  avatar: string
  created: string
}

export interface EmployeeDocument {
  id: string
  user_id: string
  file: string
  doc_type: string
  description: string
  created: string
}

export const getUsers = async () => {
  const records = await pb.collection('users').getFullList({ sort: 'name' })
  return records as unknown as User[]
}

export const updateUser = async (id: string, data: Partial<User>) => {
  const record = await pb.collection('users').update(id, data)
  return record as unknown as User
}

export const getEmployeeDocuments = async (userId: string) => {
  const records = await pb.collection('employee_documents').getFullList({
    filter: `user_id = '${userId}'`,
    sort: '-created',
  })
  return records as unknown as EmployeeDocument[]
}

export const deleteEmployeeDocument = async (id: string) => {
  await pb.collection('employee_documents').delete(id)
}

export const getFileUrl = (record: any, filename: string) => {
  return pb.files.getUrl(record, filename)
}
