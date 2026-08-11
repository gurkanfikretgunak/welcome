import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'
export interface Ticket {
  id: string; user_id: string; title: string; description: string
  category: 'technical'|'onboarding'|'account'|'bug'|'feature'|'other'
  priority: 'low'|'medium'|'high'|'urgent'; status: 'open'|'in_progress'|'resolved'|'closed'
  assigned_to: string|null; created_at: string; updated_at: string; resolved_at: string|null
  resolution_notes: string|null
}
const map = (row: Record<string, any>) => toLegacy<Ticket>(row)!
export async function createTicket(input: { title: string; description: string; category: Ticket['category']; priority?: Ticket['priority'] }) {
  return result(async () => {
    const data = await particular<{ createTicket: Record<string, any> }>('welcome.tickets.write',
      `mutation Create($input: WelcomeEntityInput!) { createTicket(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ ...input, priority: input.priority ?? 'medium', organizationId: getOrganizationId() }) })
    return map(data.createTicket)
  })
}
async function list() {
  return result(async () => {
    const data = await particular<{ tickets: Record<string, any>[] }>('welcome.tickets.read',
      `query Tickets($organizationId: String!) { tickets(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
      { organizationId: getOrganizationId() })
    return data.tickets.map(map)
  })
}
export const getUserTickets = list
export const getAllTickets = list
export async function updateTicket(id: string, updates: Partial<Ticket>) {
  return result(async () => {
    const data = await particular<{ updateTicket: Record<string, any> }>('welcome.tickets.write',
      `mutation Update($input: WelcomeEntityInput!) { updateTicket(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ id, ...updates }) })
    return map(data.updateTicket)
  })
}
export async function deleteTicket(id: string) {
  try { await particular('welcome.tickets.write', `mutation Delete($id: String!) { deleteTicket(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}


