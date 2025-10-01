import { supabase } from './client'

export interface User {
  id: string
  github_username: string
  master_email?: string
  personal_email?: string
  is_verified: boolean
  is_owner: boolean
  is_store_user: boolean
  store_points: number
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  phone?: string
  department?: string
  role?: string
}

export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const createUserProfile = async (userData: Partial<User>) => {
  try {
    if (!userData.id) {
      return { data: null, error: new Error('User ID is required') }
    }
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .maybeSingle()
    if (existingUser) return { data: existingUser, error: null }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        github_username: userData.github_username || 'github-user',
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

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()
    if (!existingUser) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          github_username: 'github-user',
          ...updates,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()
      if (createError) return { data: null, error: createError }
      return { data: newUser, error: null }
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
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

export interface PerformanceGoal {
  id: string
  user_id: string
  month_year: string
  target_hours: number
  target_story_points: number
  completed_hours: number
  completed_story_points: number
  monthly_checklist: any[]
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface PerformanceGoalWithUser extends PerformanceGoal {
  user: {
    id: string
    first_name: string | null
    last_name: string | null
    github_username: string | null
    department: string | null
  }
}

export async function createPerformanceGoal(goalData: {
  user_id: string
  month_year: string
  target_hours: number
  target_story_points: number
  monthly_checklist: any[]
}): Promise<{ data: PerformanceGoal | null; error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { data: null, error: new Error('User not authenticated') }
    }
    const { data, error } = await supabase
      .from('performance_goals')
      .insert({
        user_id: goalData.user_id,
        month_year: goalData.month_year,
        target_hours: goalData.target_hours,
        target_story_points: goalData.target_story_points,
        monthly_checklist: goalData.monthly_checklist,
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

export async function getUserPerformanceGoals(): Promise<{ data: PerformanceGoal[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('performance_goals')
      .select('*')
      .order('month_year', { ascending: false })
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getAllPerformanceGoals(): Promise<{ data: PerformanceGoalWithUser[] | null; error: Error | null }> {
  try {
    const { data: goals, error: goalsError } = await supabase
      .from('performance_goals')
      .select('*')
      .order('month_year', { ascending: false })
    if (goalsError) return { data: null, error: goalsError }
    if (!goals || goals.length === 0) return { data: [], error: null }

    const userIds = Array.from(new Set(goals.map((g: any) => g.user_id).filter(Boolean)))
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, github_username, department')
      .in('id', userIds as string[])
    if (usersError) return { data: null, error: usersError }

    const userById = new Map((users || []).map((u: any) => [u.id, u]))
    const merged: PerformanceGoalWithUser[] = (goals as any[]).map((g) => ({
      ...g,
      user: userById.get(g.user_id) || {
        id: g.user_id,
        first_name: null,
        last_name: null,
        github_username: null,
        department: null,
      },
    }))
    return { data: merged, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function updatePerformanceGoal(
  goalId: string,
  updates: {
    target_hours?: number
    target_story_points?: number
    completed_hours?: number
    completed_story_points?: number
    monthly_checklist?: any[]
  }
): Promise<{ data: PerformanceGoal | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('performance_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deletePerformanceGoal(goalId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('performance_goals')
      .delete()
      .eq('id', goalId)
    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const verifyOwnerAccess = async (): Promise<{ isOwner: boolean; error: Error | null }> => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { isOwner: false, error: new Error('User not authenticated') }
    }
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('is_owner')
      .eq('id', user.id)
      .single()
    if (profileError || !userProfile?.is_owner) {
      return { isOwner: false, error: new Error('Access denied: Owner privileges required') }
    }
    return { isOwner: true, error: null }
  } catch (error) {
    return { isOwner: false, error: error as Error }
  }
}

export function getCurrentMonthYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export function calculatePerformancePercentage(
  completedHours: number,
  targetHours: number,
  completedStoryPoints: number,
  targetStoryPoints: number
): number {
  if (targetHours === 0 && targetStoryPoints === 0) return 0
  if (targetHours === 0) {
    return (completedStoryPoints / targetStoryPoints) * 100
  }
  if (targetStoryPoints === 0) {
    return (completedHours / targetHours) * 100
  }
  return ((completedHours / targetHours) + (completedStoryPoints / targetStoryPoints)) / 2 * 100
}


