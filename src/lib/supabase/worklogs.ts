import { supabase } from './client'

export interface Worklog {
  id: string
  user_id: string
  title: string
  description?: string
  date: string
  hours: number
  project?: string
  category?: string
  created_at: string
  updated_at: string
}

export const createWorklog = async (worklog: Omit<Worklog, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('worklogs')
      .insert({
        ...worklog,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const getUserWorklogs = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('worklogs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const updateWorklog = async (id: string, updates: Partial<Worklog>) => {
  try {
    const { data, error } = await supabase
      .from('worklogs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const deleteWorklog = async (id: string) => {
  try {
    const { error } = await supabase
      .from('worklogs')
      .delete()
      .eq('id', id)
    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}


