import { supabase } from './client'

export const getChecklistStatus = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('checklist_status')
      .select('*')
      .eq('user_id', userId)

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const updateChecklistStep = async (userId: string, step: string, completed: boolean) => {
  try {
    const { data, error } = await supabase
      .from('checklist_status')
      .upsert({
        user_id: userId,
        step_name: step,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
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

export const getAllChecklistStatuses = async () => {
  try {
    const { data, error } = await supabase
      .from('checklist_status')
      .select('*')

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const getAllUsers = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()

    if (profileError || !userProfile?.is_owner) {
      return { data: null, error: new Error('Access denied: Owner privileges required') }
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export interface DynamicChecklist {
  id: string
  title: string
  description: string | null
  category: string
  is_global: boolean
  is_active: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface UserChecklistAssignment {
  id: string
  user_id: string
  checklist_id: string
  assigned_by: string | null
  assigned_at: string
  is_required: boolean
  due_date: string | null
  completed_at: string | null
  notes: string | null
  checklist: DynamicChecklist
}

export interface ChecklistWithAssignments extends DynamicChecklist {
  assignments: UserChecklistAssignment[]
  user_assignment?: UserChecklistAssignment
}

export async function createDynamicChecklist(checklistData: {
  title: string
  description?: string
  category: string
  is_global?: boolean
}): Promise<{ data: DynamicChecklist | null; error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('dynamic_checklists')
      .insert({
        title: checklistData.title,
        description: checklistData.description || null,
        category: checklistData.category,
        is_global: checklistData.is_global || false,
        created_by: user.id
      })
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getAllDynamicChecklists(): Promise<{ data: ChecklistWithAssignments[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('dynamic_checklists')
      .select(`
        *,
        assignments:user_checklist_assignments(
          id,
          user_id,
          assigned_at,
          is_required,
          due_date,
          completed_at,
          notes
        )
      `)
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getUserChecklistAssignments(): Promise<{ data: UserChecklistAssignment[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_checklist_assignments')
      .select(`
        *,
        checklist:dynamic_checklists(
          id,
          title,
          description,
          category,
          is_global,
          is_active
        )
      `)
      .order('assigned_at', { ascending: false })

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function assignChecklistToUser(assignmentData: {
  user_id: string
  checklist_id: string
  is_required?: boolean
  due_date?: string
  notes?: string
}): Promise<{ data: UserChecklistAssignment | null; error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }

    const { data, error } = await supabase
      .from('user_checklist_assignments')
      .insert({
        user_id: assignmentData.user_id,
        checklist_id: assignmentData.checklist_id,
        assigned_by: user.id,
        is_required: assignmentData.is_required || false,
        due_date: assignmentData.due_date || null,
        notes: assignmentData.notes || null
      })
      .select(`
        *,
        checklist:dynamic_checklists(
          id,
          title,
          description,
          category,
          is_global,
          is_active
        )
      `)
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function updateChecklistAssignment(
  assignmentId: string,
  updates: {
    completed_at?: string | null
    notes?: string | null
  }
): Promise<{ data: UserChecklistAssignment | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_checklist_assignments')
      .update(updates)
      .eq('id', assignmentId)
      .select(`
        *,
        checklist:dynamic_checklists(
          id,
          title,
          description,
          category,
          is_global,
          is_active
        )
      `)
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function updateDynamicChecklist(
  checklistId: string,
  updates: {
    title?: string
    description?: string
    category?: string
    is_global?: boolean
    is_active?: boolean
  }
): Promise<{ data: DynamicChecklist | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('dynamic_checklists')
      .update(updates)
      .eq('id', checklistId)
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deleteDynamicChecklist(checklistId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('dynamic_checklists')
      .delete()
      .eq('id', checklistId)

    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function deleteChecklistAssignment(assignmentId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_checklist_assignments')
      .delete()
      .eq('id', assignmentId)

    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}


