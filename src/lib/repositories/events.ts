import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'
export interface Event {
  id: string; title: string; description?: string; event_date: string; location?: string
  max_participants?: number; is_upcoming?: boolean; is_published: boolean; is_active: boolean
  created_by?: string; created_at: string; updated_at: string
}
const map = <T = Event>(row: Record<string, any>) => toLegacy<T>(row)!
const listEvents = async (accessToken?: string | null) => result(async () => {
  const data = await particular<{ publishedEvents: Record<string, any>[] }>('welcome.events.read',
    `query Events($organizationId: String!) { publishedEvents(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
    { organizationId: getOrganizationId() }, accessToken)
  return data.publishedEvents.map(map)
})
export const getPublishedEvents = listEvents
export const getOwnerEvents = listEvents
export const getEventById = async (eventId: string) => result(async () => {
  const data = await particular<{ event: Record<string, any>|null }>('welcome.events.read',
    `query Event($eventId: String!) { event(eventId: $eventId) { ${ENTITY_FIELDS} } }`, { eventId })
  return map(data.event!)
})
const mutateEvent = async (name: string, input: Record<string, unknown>) => result(async () => {
  const data = await particular<Record<string, Record<string, any>>>('welcome.events.write',
    `mutation Save($input: WelcomeEntityInput!) { ${name}(input: $input) { ${ENTITY_FIELDS} } }`,
    { input: toInput(input) })
  return map(data[name])
})
export const createEvent = async (input: any) => mutateEvent('createEvent', { ...input, organizationId: getOrganizationId() })
export const updateEvent = async (id: string, input: any) => mutateEvent('updateEvent', { id, ...input })
export const deleteEvent = async (id: string) => {
  try { await particular('welcome.events.write', `mutation Delete($id: String!) { deleteEvent(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}
export const getEventParticipants = async (eventId: string) => result(async () => {
  const data = await particular<{ eventParticipants: Record<string, any>[] }>('welcome.events.read',
    `query Participants($eventId: String!) { eventParticipants(eventId: $eventId) { ${ENTITY_FIELDS} } }`, { eventId })
  return data.eventParticipants.map((row) => map<any>(row))
})
export const registerForEvent = async (input: any) => result(async () => {
  const data = await particular<{ registerForEvent: Record<string, any> }>('welcome.events.write',
    `mutation Register($input: WelcomeEntityInput!) { registerForEvent(input: $input) { ${ENTITY_FIELDS} } }`,
    { input: toInput({ organizationId: getOrganizationId(), eventId: input.event_id, fullName: input.full_name,
      email: input.email, referenceCode: `WEL-${Date.now().toString(36).toUpperCase()}`, title: input.title,
      itemsJson: JSON.stringify(input) }) })
  return map<any>(data.registerForEvent)
})
export const getParticipantByReference = async (referenceCode: string) => result(async () => {
  const data = await particular<{ participantsByReference: Record<string, any>|null }>('welcome.events.read',
    `query Participant($referenceCode: String!) { participantsByReference(referenceCode: $referenceCode) { ${ENTITY_FIELDS} } }`, { referenceCode })
  if (!data.participantsByReference) throw new Error('Participant not found')
  return map<any>(data.participantsByReference)
})
export const getParticipantsByEmail = async (email: string) => result(async () => {
  const data = await particular<{ participantsByEmail: Record<string, any>[] }>('welcome.events.read',
    `query Participants($email: String!) { participantsByEmail(email: $email) { ${ENTITY_FIELDS} } }`, { email })
  return data.participantsByEmail.map((row) => map<any>(row))
})
