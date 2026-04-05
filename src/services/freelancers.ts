import { supabase } from '@/lib/supabase/client'

export const createFreelancer = async (data: any) => {
  const { role, hourly_rate, ...freelancerData } = data
  const { data: freelancer, error } = await supabase
    .from('freelancers')
    .insert([freelancerData])
    .select()
    .single()

  if (error) throw error

  if (role) {
    const { error: roleError } = await supabase
      .from('freelancer_roles')
      .insert([{ freelancer_id: freelancer.id, role, hourly_rate: Number(hourly_rate) }])
    if (roleError) throw roleError
  }
  return freelancer
}

export const createAssignment = async (data: any) => {
  const { data: assignment, error } = await supabase
    .from('event_assignments')
    .insert([data])
    .select()
    .single()
  if (error) throw error
  return assignment
}
