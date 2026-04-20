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
  rg?: string
  cpf?: string
  work_permit_number?: string
  work_permit_series?: string
  pix_key?: string
  cnh_category?: string
  address_street?: string
  address_number?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  address_zip?: string
  phone?: string
  instagram?: string
  tiktok?: string
  emergency_contact?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
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

export const createUser = async (data: any) => {
  const record = await pb.collection('users').create(data)
  return record as unknown as User
}

export const updateUser = async (id: string, data: any) => {
  const record = await pb.collection('users').update(id, data)
  return record as unknown as User
}

export const deleteUser = async (id: string) => {
  await pb.collection('users').delete(id)
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
