import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'

export interface Worklog {
  id: string; user_id: string; title: string; description?: string; date: string; hours: number
  project?: string; category?: string; created_at: string; updated_at: string
}
const map = (row: Record<string, any>) => toLegacy<Worklog>(row)!
export const getUserWorklogs = async (userId?: string) => result(async () => {
  const data = await particular<{ worklogs: Record<string, any>[] }>('welcome.worklogs.read',
    `query Worklogs($organizationId: String!, $userId: String) {
      worklogs(organizationId: $organizationId, userId: $userId) { ${ENTITY_FIELDS} }
    }`, { organizationId: getOrganizationId(), userId })
  return data.worklogs.map(map).sort((a, b) => b.date.localeCompare(a.date))
})
export const createWorklog = async (worklog: Omit<Worklog, 'id' | 'created_at' | 'updated_at'>) => result(async () => {
  const data = await particular<{ createWorklog: Record<string, any> }>('welcome.worklogs.write',
    `mutation Create($input: WelcomeEntityInput!) { createWorklog(input: $input) { ${ENTITY_FIELDS} } }`,
    { input: toInput({ ...worklog, organizationId: getOrganizationId() }) })
  return map(data.createWorklog)
})
export const updateWorklog = async (id: string, updates: Partial<Worklog>) => result(async () => {
  const data = await particular<{ updateWorklog: Record<string, any> }>('welcome.worklogs.write',
    `mutation Update($input: WelcomeEntityInput!) { updateWorklog(input: $input) { ${ENTITY_FIELDS} } }`,
    { input: toInput({ id, ...updates }) })
  return map(data.updateWorklog)
})
export const deleteWorklog = async (id: string) => {
  try {
    await particular('welcome.worklogs.write', `mutation Delete($id: String!) { deleteWorklog(id: $id) }`, { id })
    return { error: null }
  } catch (error) { return { error: error as Error } }
}
