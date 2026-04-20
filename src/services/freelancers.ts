import pb from '@/lib/pocketbase/client'

export interface Freelancer {
  id: string
  name: string
  status: string
  birth_date?: string
  address_zip?: string
  address_street?: string
  address_number?: string
  address_complement?: string
  address_neighborhood?: string
  address_city?: string
  address_state?: string
  guardian_name?: string
  guardian_phone?: string
  guardian_name_2?: string
  guardian_phone_2?: string
  overall_rating?: number
  phone?: string
  address?: string
  categories?: string[]
  guardian_authorization?: string
  created: string
}

export interface FreelancerCategory {
  id: string
  name: string
  pay_rate: number
}

export interface FreelancerEvaluation {
  id: string
  freelancer_id: string
  frequency: number
  punctuality: number
  participation: number
  education: number
  notes?: string
  created: string
}

export interface FreelancerRole {
  id: string
  freelancer_id: string
  role_name: string
  pay_rate: number
}

export interface AttendanceLog {
  id: string
  freelancer_id: string
  date: string
  status: 'scheduled' | 'present' | 'no_show'
}

export const getFreelancers = async () => {
  return (await pb
    .collection('freelancers')
    .getFullList({ sort: '-created' })) as unknown as Freelancer[]
}

export const getFreelancerByPhone = async (phone: string) => {
  try {
    const record = await pb.collection('freelancers').getFirstListItem(`phone = '${phone}'`)
    return record as unknown as Freelancer
  } catch {
    return null
  }
}

export const createFreelancer = async (data: Partial<Freelancer> | FormData) => {
  return (await pb.collection('freelancers').create(data)) as unknown as Freelancer
}

export const updateFreelancer = async (id: string, data: Partial<Freelancer> | FormData) => {
  return (await pb.collection('freelancers').update(id, data)) as unknown as Freelancer
}

export const getFreelancerFileUrl = (record: any, filename: string) => {
  return pb.files.getUrl(record, filename)
}

export const deleteFreelancer = async (id: string) => {
  await pb.collection('freelancers').delete(id)
}

export const getFreelancerRoles = async (freelancerId: string) => {
  return (await pb.collection('freelancer_roles').getFullList({
    filter: `freelancer_id = '${freelancerId}'`,
    sort: 'role_name',
  })) as unknown as FreelancerRole[]
}

export const createFreelancerRole = async (data: Partial<FreelancerRole>) => {
  return (await pb.collection('freelancer_roles').create(data)) as unknown as FreelancerRole
}

export const deleteFreelancerRole = async (id: string) => {
  await pb.collection('freelancer_roles').delete(id)
}

export const getFreelancerCategories = async () => {
  return (await pb.collection('freelancer_categories').getFullList({
    sort: 'name',
  })) as unknown as FreelancerCategory[]
}

export const createFreelancerCategory = async (data: Partial<FreelancerCategory>) => {
  return (await pb
    .collection('freelancer_categories')
    .create(data)) as unknown as FreelancerCategory
}

export const updateFreelancerCategory = async (id: string, data: Partial<FreelancerCategory>) => {
  return (await pb
    .collection('freelancer_categories')
    .update(id, data)) as unknown as FreelancerCategory
}

export const deleteFreelancerCategory = async (id: string) => {
  await pb.collection('freelancer_categories').delete(id)
}

export const getFreelancerEvaluations = async (freelancerId: string) => {
  return (await pb.collection('freelancer_evaluations').getFullList({
    filter: `freelancer_id = '${freelancerId}'`,
    sort: '-created',
  })) as unknown as FreelancerEvaluation[]
}

export const createFreelancerEvaluation = async (data: Partial<FreelancerEvaluation>) => {
  return (await pb
    .collection('freelancer_evaluations')
    .create(data)) as unknown as FreelancerEvaluation
}

export const deleteFreelancerEvaluation = async (id: string) => {
  await pb.collection('freelancer_evaluations').delete(id)
}

export const getAttendanceLogs = async (freelancerId?: string) => {
  const filter = freelancerId ? `freelancer_id = '${freelancerId}'` : ''
  return (await pb.collection('attendance_logs').getFullList({
    filter,
    sort: '-date',
  })) as unknown as AttendanceLog[]
}

export const createAttendanceLog = async (data: Partial<AttendanceLog>) => {
  return (await pb.collection('attendance_logs').create(data)) as unknown as AttendanceLog
}

export const updateAttendanceLog = async (id: string, data: Partial<AttendanceLog>) => {
  return (await pb.collection('attendance_logs').update(id, data)) as unknown as AttendanceLog
}

export const deleteAttendanceLog = async (id: string) => {
  await pb.collection('attendance_logs').delete(id)
}
