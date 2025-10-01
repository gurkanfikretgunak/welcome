import { supabase } from './client'

export interface Event {
  id: string
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
  is_upcoming?: boolean
  is_published: boolean
  is_active: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export async function getPublishedEvents(): Promise<{ data: Event[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_published', true)
      .eq('is_active', true)
      .eq('is_upcoming', true)
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getEventById(eventId: string): Promise<{ data: Event | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .eq('is_published', true)
      .eq('is_active', true)
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function createEvent(eventData: {
  title: string
  description?: string
  event_date: string
  location?: string
  max_participants?: number
  is_upcoming?: boolean
}): Promise<{ data: Event | null; error: Error | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: new Error('Not authenticated') }
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
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

export async function updateEvent(
  eventId: string,
  updates: Partial<{
    title: string
    description: string
    event_date: string
    location: string
    max_participants: number
    is_upcoming: boolean
    is_published: boolean
    is_active: boolean
  }>
): Promise<{ data: Event | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single()

    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function deleteEvent(eventId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}

export async function getOwnerEvents(): Promise<{ data: Event[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getEventParticipants(eventId: string): Promise<{ data: any[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .order('registration_date', { ascending: false })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function registerForEvent(registrationData: {
  event_id: string
  full_name: string
  email: string
  title?: string
  company?: string
  gdpr_consent: boolean
}): Promise<{ data: any | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('register_for_event', {
      p_event_id: registrationData.event_id,
      p_full_name: registrationData.full_name,
      p_email: registrationData.email,
      p_title: registrationData.title || null,
      p_company: registrationData.company || null,
      p_gdpr_consent: registrationData.gdpr_consent
    })

    if (error) return { data: null, error }
    const result = Array.isArray(data) ? data[0] : data
    return { data: result || null, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getParticipantByReference(referenceNumber: string): Promise<{ data: any | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_participant_by_reference', {
      p_reference_number: referenceNumber
    })

    if (error) return { data: null, error }
    const result = Array.isArray(data) ? data[0] : data
    if (!result) return { data: null, error: new Error('Participant not found') }
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export async function getParticipantsByEmail(email: string): Promise<{ data: any[] | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.rpc('get_participants_by_email', {
      p_email: email
    })

    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}


