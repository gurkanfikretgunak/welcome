import { createClient } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
})

// Browser client for auth helpers
export const createSupabaseClient = () => createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// User profile interface
export interface User {
  id: string
  github_username: string
  master_email?: string
  personal_email?: string
  is_verified: boolean
  is_owner: boolean
  created_at: string
  updated_at: string
  first_name?: string
  last_name?: string
  phone?: string
  department?: string
}

// Worklog interface
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

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    console.log('👤 Getting user profile for:', userId)
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ Get profile error:', error)
      return { data: null, error }
    }

    console.log('✅ Profile retrieved:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get profile exception:', error)
    return { data: null, error: error as Error }
  }
}

// Create user profile
export const createUserProfile = async (userData: Partial<User>) => {
  try {
    console.log('🆕 Creating user profile:', userData)
    
    if (!userData.id) {
      console.error('❌ User ID is required')
      return { data: null, error: new Error('User ID is required') }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData.id)
      .maybeSingle()

    if (existingUser) {
      console.log('ℹ️ User already exists:', existingUser)
      return { data: existingUser, error: null }
    }

    // Create new user
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

    if (error) {
      console.error('❌ Create profile error:', error)
      return { data: null, error }
    }

    console.log('✅ Profile created:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Create profile exception:', error)
    return { data: null, error: error as Error }
  }
}

// Update user profile
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    console.log('📝 Updating user profile:', userId, updates)
    
    // First check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (checkError) {
      console.error('❌ Check user error:', checkError)
      return { data: null, error: checkError }
    }

    // If user doesn't exist, create it first
    if (!existingUser) {
      console.log('🆕 User not found, creating new profile...')
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

      if (createError) {
        console.error('❌ Create user error:', createError)
        return { data: null, error: createError }
      }

      console.log('✅ New user created:', newUser)
      return { data: newUser, error: null }
    }

    // Update existing user
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update profile error:', error)
      return { data: null, error }
    }

    console.log('✅ Profile updated:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update profile exception:', error)
    return { data: null, error: error as Error }
  }
}

// Get checklist status
export const getChecklistStatus = async (userId: string) => {
  try {
    console.log('📋 Getting checklist status for user:', userId)
    
    const { data, error } = await supabase
      .from('checklist_status')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('❌ Get checklist error:', error)
      return { data: null, error }
    }

    console.log('✅ Checklist status retrieved:', data?.length || 0, 'items')
    return { data: data || [], error: null }
  } catch (error) {
    console.error('❌ Get checklist exception:', error)
    return { data: null, error: error as Error }
  }
}

// Update checklist step
export const updateChecklistStep = async (userId: string, step: string, completed: boolean) => {
  try {
    console.log('📝 Updating checklist step:', { userId, step, completed })
    
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

    if (error) {
      console.error('❌ Update checklist error:', error)
      return { data: null, error }
    }

    console.log('✅ Checklist step updated:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update checklist exception:', error)
    return { data: null, error: error as Error }
  }
}

// Get all users (owner only)
export const getAllUsers = async () => {
  try {
    console.log('👥 Getting all users...')
    
    // For now, we'll use a different approach since RLS policies cause recursion
    // This will only work for users who have access to their own data
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Get all users error:', error)
      return { data: null, error }
    }

    console.log('✅ Users retrieved:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get all users exception:', error)
    return { data: null, error: error as Error }
  }
}

// Get all checklist statuses (owner only)
export const getAllChecklistStatuses = async () => {
  try {
    console.log('📋 Getting all checklist statuses...')
    
    const { data, error } = await supabase
      .from('checklist_status')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Get all checklist statuses error:', error)
      return { data: null, error }
    }

    console.log('✅ Checklist statuses retrieved:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get all checklist statuses exception:', error)
    return { data: null, error: error as Error }
  }
}

// Worklog functions
export const createWorklog = async (worklog: Omit<Worklog, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    console.log('📝 Creating worklog:', worklog.title)
    
    const { data, error } = await supabase
      .from('worklogs')
      .insert({
        ...worklog,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Create worklog error:', error)
      return { data: null, error }
    }

    console.log('✅ Worklog created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Create worklog exception:', error)
    return { data: null, error: error as Error }
  }
}

export const getUserWorklogs = async (userId: string) => {
  try {
    console.log('📋 Getting worklogs for user:', userId)
    
    const { data, error } = await supabase
      .from('worklogs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) {
      console.error('❌ Get user worklogs error:', error)
      return { data: null, error }
    }

    console.log('✅ User worklogs retrieved:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get user worklogs exception:', error)
    return { data: null, error: error as Error }
  }
}

export const updateWorklog = async (id: string, updates: Partial<Worklog>) => {
  try {
    console.log('✏️ Updating worklog:', id)
    
    const { data, error } = await supabase
      .from('worklogs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('❌ Update worklog error:', error)
      return { data: null, error }
    }

    console.log('✅ Worklog updated successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update worklog exception:', error)
    return { data: null, error: error as Error }
  }
}

export const deleteWorklog = async (id: string) => {
  try {
    console.log('🗑️ Deleting worklog:', id)
    
    const { error } = await supabase
      .from('worklogs')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('❌ Delete worklog error:', error)
      return { error }
    }

    console.log('✅ Worklog deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('❌ Delete worklog exception:', error)
    return { error: error as Error }
  }
}

// Ticket interfaces
export interface Ticket {
  id: string
  user_id: string
  title: string
  description: string
  category: 'technical' | 'onboarding' | 'account' | 'bug' | 'feature' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  assigned_to: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  resolution_notes: string | null
}

// Ticket CRUD functions
export async function createTicket(ticketData: {
  title: string
  description: string
  category: Ticket['category']
  priority?: Ticket['priority']
}): Promise<{ data: Ticket | null; error: Error | null }> {
  try {
    console.log('🎫 Creating ticket:', ticketData.title)
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ No authenticated user found')
      return { data: null, error: new Error('User not authenticated') }
    }
    
    const { data, error } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        title: ticketData.title,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Create ticket error:', error)
      return { data: null, error }
    }

    console.log('✅ Ticket created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Create ticket exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getUserTickets(): Promise<{ data: Ticket[] | null; error: Error | null }> {
  try {
    console.log('🎫 Fetching user tickets')
    
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Get user tickets error:', error)
      return { data: null, error }
    }

    console.log('✅ User tickets fetched successfully:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get user tickets exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getAllTickets(): Promise<{ data: Ticket[] | null; error: Error | null }> {
  try {
    console.log('🎫 Fetching all tickets (owner)')
    
    // First, try to get tickets without the user join to avoid RLS recursion
    const { data: ticketsData, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (ticketsError) {
      console.error('❌ Get all tickets error:', ticketsError)
      return { data: null, error: ticketsError }
    }

    // If we have tickets, try to get user data separately to avoid RLS issues
    if (ticketsData && ticketsData.length > 0) {
      const userIds = [...new Set(ticketsData.map(ticket => ticket.user_id))]
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, github_username, master_email')
        .in('id', userIds)

      if (usersError) {
        console.warn('⚠️ Could not fetch user data for tickets:', usersError)
        // Return tickets without user data rather than failing completely
        console.log('✅ All tickets fetched successfully (without user data):', ticketsData?.length || 0)
        return { data: ticketsData, error: null }
      }

      // Merge user data with tickets
      const ticketsWithUsers = ticketsData.map(ticket => ({
        ...ticket,
        user: usersData?.find(user => user.id === ticket.user_id) || null
      }))

      console.log('✅ All tickets fetched successfully:', ticketsWithUsers?.length || 0)
      return { data: ticketsWithUsers, error: null }
    }

    console.log('✅ All tickets fetched successfully:', ticketsData?.length || 0)
    return { data: ticketsData, error: null }
  } catch (error) {
    console.error('❌ Get all tickets exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function updateTicket(
  ticketId: string, 
  updates: {
    status?: Ticket['status']
    priority?: Ticket['priority']
    assigned_to?: string | null
    resolution_notes?: string | null
  }
): Promise<{ data: Ticket | null; error: Error | null }> {
  try {
    console.log('🎫 Updating ticket:', ticketId, updates)
    
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update ticket error:', error)
      return { data: null, error }
    }

    console.log('✅ Ticket updated successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update ticket exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function deleteTicket(ticketId: string): Promise<{ error: Error | null }> {
  try {
    console.log('🎫 Deleting ticket:', ticketId)
    
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)

    if (error) {
      console.error('❌ Delete ticket error:', error)
      return { error }
    }

    console.log('✅ Ticket deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('❌ Delete ticket exception:', error)
    return { error: error as Error }
  }
}

// Performance Goals interfaces
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

// Performance Goals CRUD functions
export async function createPerformanceGoal(goalData: {
  user_id: string
  month_year: string
  target_hours: number
  target_story_points: number
  monthly_checklist: any[]
}): Promise<{ data: PerformanceGoal | null; error: Error | null }> {
  try {
    console.log('🎯 Creating performance goal for user:', goalData.user_id)
    
    // Get current user (should be owner)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ No authenticated user found')
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

    if (error) {
      console.error('❌ Create performance goal error:', error)
      return { data: null, error }
    }

    console.log('✅ Performance goal created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Create performance goal exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getUserPerformanceGoals(): Promise<{ data: PerformanceGoal[] | null; error: Error | null }> {
  try {
    console.log('🎯 Fetching user performance goals')
    
    const { data, error } = await supabase
      .from('performance_goals')
      .select('*')
      .order('month_year', { ascending: false })

    if (error) {
      console.error('❌ Get user performance goals error:', error)
      return { data: null, error }
    }

    console.log('✅ User performance goals fetched successfully:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get user performance goals exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getAllPerformanceGoals(): Promise<{ data: PerformanceGoalWithUser[] | null; error: Error | null }> {
  try {
    console.log('🎯 Fetching all performance goals (owner)')

    // 1) Fetch goals (no relational join required)
    const { data: goals, error: goalsError } = await supabase
      .from('performance_goals')
      .select('*')
      .order('month_year', { ascending: false })

    if (goalsError) {
      console.error('❌ Get all performance goals error:', goalsError)
      return { data: null, error: goalsError }
    }

    if (!goals || goals.length === 0) {
      return { data: [], error: null }
    }

    // 2) Collect unique user ids and fetch users in one query
    const userIds = Array.from(new Set(goals.map((g: any) => g.user_id).filter(Boolean)))
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, first_name, last_name, github_username, department')
      .in('id', userIds as string[])

    if (usersError) {
      console.error('❌ Get users for performance goals error:', usersError)
      return { data: null, error: usersError }
    }

    const userById = new Map((users || []).map((u: any) => [u.id, u]))

    // 3) Merge
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

    console.log('✅ All performance goals fetched successfully:', merged.length)
    return { data: merged, error: null }
  } catch (error) {
    console.error('❌ Get all performance goals exception:', error)
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
    console.log('🎯 Updating performance goal:', goalId, updates)
    
    const { data, error } = await supabase
      .from('performance_goals')
      .update(updates)
      .eq('id', goalId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update performance goal error:', error)
      return { data: null, error }
    }

    console.log('✅ Performance goal updated successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update performance goal exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function deletePerformanceGoal(goalId: string): Promise<{ error: Error | null }> {
  try {
    console.log('🎯 Deleting performance goal:', goalId)
    
    const { error } = await supabase
      .from('performance_goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      console.error('❌ Delete performance goal error:', error)
      return { error }
    }

    console.log('✅ Performance goal deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('❌ Delete performance goal exception:', error)
    return { error: error as Error }
  }
}

// Helper function to get current month-year
export function getCurrentMonthYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

// Helper function to calculate performance percentage
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

// Dynamic Checklists interfaces
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

// Dynamic Checklists CRUD functions
export async function createDynamicChecklist(checklistData: {
  title: string
  description?: string
  category: string
  is_global?: boolean
}): Promise<{ data: DynamicChecklist | null; error: Error | null }> {
  try {
    console.log('📋 Creating dynamic checklist:', checklistData.title)
    
    // Get current user (should be owner)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ No authenticated user found')
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

    if (error) {
      console.error('❌ Create dynamic checklist error:', error)
      return { data: null, error }
    }

    console.log('✅ Dynamic checklist created successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Create dynamic checklist exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getAllDynamicChecklists(): Promise<{ data: ChecklistWithAssignments[] | null; error: Error | null }> {
  try {
    console.log('📋 Fetching all dynamic checklists')
    
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

    if (error) {
      console.error('❌ Get all dynamic checklists error:', error)
      return { data: null, error }
    }

    console.log('✅ All dynamic checklists fetched successfully:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get all dynamic checklists exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function getUserChecklistAssignments(): Promise<{ data: UserChecklistAssignment[] | null; error: Error | null }> {
  try {
    console.log('📋 Fetching user checklist assignments')
    
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

    if (error) {
      console.error('❌ Get user checklist assignments error:', error)
      return { data: null, error }
    }

    console.log('✅ User checklist assignments fetched successfully:', data?.length || 0)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Get user checklist assignments exception:', error)
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
    console.log('📋 Assigning checklist to user:', assignmentData.user_id)
    
    // Get current user (should be owner)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('❌ No authenticated user found')
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

    if (error) {
      console.error('❌ Assign checklist error:', error)
      return { data: null, error }
    }

    console.log('✅ Checklist assigned successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Assign checklist exception:', error)
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
    console.log('📋 Updating checklist assignment:', assignmentId)
    
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

    if (error) {
      console.error('❌ Update checklist assignment error:', error)
      return { data: null, error }
    }

    console.log('✅ Checklist assignment updated successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update checklist assignment exception:', error)
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
    console.log('📋 Updating dynamic checklist:', checklistId)
    
    const { data, error } = await supabase
      .from('dynamic_checklists')
      .update(updates)
      .eq('id', checklistId)
      .select()
      .single()

    if (error) {
      console.error('❌ Update dynamic checklist error:', error)
      return { data: null, error }
    }

    console.log('✅ Dynamic checklist updated successfully:', data)
    return { data, error: null }
  } catch (error) {
    console.error('❌ Update dynamic checklist exception:', error)
    return { data: null, error: error as Error }
  }
}

export async function deleteDynamicChecklist(checklistId: string): Promise<{ error: Error | null }> {
  try {
    console.log('📋 Deleting dynamic checklist:', checklistId)
    
    const { error } = await supabase
      .from('dynamic_checklists')
      .delete()
      .eq('id', checklistId)

    if (error) {
      console.error('❌ Delete dynamic checklist error:', error)
      return { error }
    }

    console.log('✅ Dynamic checklist deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('❌ Delete dynamic checklist exception:', error)
    return { error: error as Error }
  }
}

export async function deleteChecklistAssignment(assignmentId: string): Promise<{ error: Error | null }> {
  try {
    console.log('📋 Deleting checklist assignment:', assignmentId)
    
    const { error } = await supabase
      .from('user_checklist_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      console.error('❌ Delete checklist assignment error:', error)
      return { error }
    }

    console.log('✅ Checklist assignment deleted successfully')
    return { error: null }
  } catch (error) {
    console.error('❌ Delete checklist assignment exception:', error)
    return { error: error as Error }
  }
}

// OTP Codes functions
export interface OtpCode {
  id: string
  github_username: string | null
  first_name: string | null
  last_name: string | null
  verification_code: string
  verification_email: string
  verification_expires: string
  is_expired?: boolean
  time_remaining?: number
}

export async function getActiveOtpCodes(): Promise<{ data: OtpCode[] | null; error: Error | null }> {
  try {
    console.log('🔑 Getting active OTP codes')
    
    // Get all active OTP codes
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        github_username,
        first_name,
        last_name,
        verification_code,
        verification_email,
        verification_expires
      `)
      .not('verification_code', 'is', null)
      .order('verification_expires', { ascending: false })

    if (error) {
      console.error('❌ Get OTP codes error:', error)
      return { data: null, error }
    }

    // Process OTP codes and mark expired ones
    const now = new Date()
    const processedOtpData = data.map(user => ({
      ...user,
      is_expired: user.verification_expires ? new Date(user.verification_expires) < now : true,
      time_remaining: user.verification_expires ? 
        Math.max(0, Math.floor((new Date(user.verification_expires).getTime() - now.getTime()) / 1000)) : 0
    }))

    console.log('✅ OTP codes retrieved:', processedOtpData.length)
    return { data: processedOtpData, error: null }
  } catch (error) {
    console.error('❌ Get OTP codes exception:', error)
    return { data: null, error: error as Error }
  }
}