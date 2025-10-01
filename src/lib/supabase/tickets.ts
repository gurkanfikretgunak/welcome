import { supabase } from './client'

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

export async function createTicket(ticketData: {
  title: string
  description: string
  category: Ticket['category']
  priority?: Ticket['priority']
}): Promise<{ data: Ticket | null; error: Error | null }> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
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

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getUserTickets(): Promise<{ data: Ticket[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getAllTickets(): Promise<{ data: Ticket[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
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
    const { data, error } = await supabase
      .from('tickets')
      .update(updates)
      .eq('id', ticketId)
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deleteTicket(ticketId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('tickets')
      .delete()
      .eq('id', ticketId)
    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}


