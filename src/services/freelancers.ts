import pb from '@/lib/pocketbase/client'

export interface Freelancer {
  id: string
  name: string
  status: string
  guardian_name?: string
  guardian_phone?: string
  overall_rating?: number
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

export const createFreelancer = async (data: Partial<Freelancer>) => {
  return (await pb.collection('freelancers').create(data)) as unknown as Freelancer
}

export const updateFreelancer = async (id: string, data: Partial<Freelancer>) => {
  return (await pb.collection('freelancers').update(id, data)) as unknown as Freelancer
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
