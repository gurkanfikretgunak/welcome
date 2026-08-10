import { getOrganizationId } from '@/lib/mf/config'
import { getAllUsers } from './users'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'
export interface DynamicChecklist {
  id: string; title: string; description: string|null; category: string; is_global: boolean
  is_active: boolean; created_by: string|null; created_at: string; updated_at: string
}
export interface UserChecklistAssignment {
  id: string; user_id: string; checklist_id: string; assigned_by: string|null; assigned_at: string
  is_required: boolean; due_date: string|null; completed_at: string|null; notes: string|null
  checklist: DynamicChecklist
}
export interface ChecklistWithAssignments extends DynamicChecklist { assignments: UserChecklistAssignment[]; user_assignment?: UserChecklistAssignment }
const map = <T = any>(row: Record<string, any>) => {
  const value = toLegacy<any>(row)!
  let extras: any = {}; try { extras = row.itemsJson ? JSON.parse(row.itemsJson) : {} } catch {}
  return { ...value, ...extras } as T
}
async function list(field: 'dynamicChecklists'|'userChecklistAssignments'|'checklistStatuses') {
  return result(async () => {
    const data = await particular<Record<string, Record<string, any>[]>>('welcome.checklists.read',
      `query List($organizationId: String!) { ${field}(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
      { organizationId: getOrganizationId() })
    return data[field].map((row) => map(row))
  })
}
export const getChecklistStatus = async (_userId?: string) => list('checklistStatuses')
export const getAllChecklistStatuses = async () => list('checklistStatuses')
export const getAllUsersForChecklist = getAllUsers
export const getAllDynamicChecklists = async () => list('dynamicChecklists') as any
export const getUserChecklistAssignments = async () => list('userChecklistAssignments') as any
async function mutate(name: string, input: any) {
  return result(async () => {
    const data = await particular<Record<string, Record<string, any>>>('welcome.checklists.write',
      `mutation Save($input: WelcomeEntityInput!) { ${name}(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ ...input, itemsJson: JSON.stringify(input) }) })
    return map(data[name])
  })
}
export const updateChecklistStep = async (userId: string, step: string, completed: boolean) =>
  mutate('upsertChecklistStatus', { organizationId: getOrganizationId(), userId, itemKey: step, completed,
    completedAt: completed ? new Date().toISOString() : null })
export const createDynamicChecklist = async (input: any) => mutate('createDynamicChecklist', { ...input, organizationId: getOrganizationId() })
export const updateDynamicChecklist = async (id: string, input: any) => mutate('updateDynamicChecklist', { id, ...input })
export const assignChecklistToUser = async (input: any) => mutate('assignChecklist', {
  ...input,
  organizationId: getOrganizationId(),
  assignedAt: input.assigned_at ?? new Date().toISOString(),
})
export const updateChecklistAssignment = async (_id: string, _input: any) => ({
  data: null,
  error: new Error('Updating checklist assignments is not supported by particular-welcome'),
})
async function remove(name: string, id: string) {
  try { await particular('welcome.checklists.write', `mutation Delete($id: String!) { ${name}(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}
export const deleteDynamicChecklist = (id: string) => remove('deleteDynamicChecklist', id)
// The current Particular schema has no assignment delete mutation.
export const deleteChecklistAssignment = async (_id: string) => ({ error: new Error('Deleting checklist assignments is not supported by particular-welcome') })


