import { getOrganizationId } from '@/lib/mf/config'
import { readSession } from '@/lib/mf/session'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'

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

export interface PerformanceGoal {
  id: string; user_id: string; month_year: string; target_hours: number
  target_story_points: number; completed_hours: number; completed_story_points: number
  monthly_checklist: any[]; created_at: string; updated_at: string; created_by: string | null
}
export interface PerformanceGoalWithUser extends PerformanceGoal { user: Partial<User> }

const profileQuery = `query MyProfile($organizationId: String!) {
  myWelcomeProfile(organizationId: $organizationId) { ${ENTITY_FIELDS} }
}`

export const getUserProfile = async (userId?: string) => result(async () => {
  if (userId) {
    const data = await particular<{ welcomeProfile: Record<string, any> | null }>(
      'welcome.profiles.read',
      `query Profile($organizationId:String!,$userId:String!){welcomeProfile(organizationId:$organizationId,userId:$userId){${ENTITY_FIELDS}}}`,
      { organizationId: getOrganizationId(), userId })
    return toLegacy<User>(data.welcomeProfile)
  }
  const data = await particular<{ myWelcomeProfile: Record<string, any> | null }>(
    'welcome.profiles.read', profileQuery, { organizationId: getOrganizationId() })
  return toLegacy<User>(data.myWelcomeProfile)
})

export const createUserProfile = async (userData: Partial<User>) => {
  const { id, ...updates } = userData
  return upsertProfile(updates, id)
}
export const updateUserProfile = async (userId: string, updates: Partial<User>) => upsertProfile(updates, userId)

async function upsertProfile(updates: Partial<User>, userId?: string) {
  return result(async () => {
    const data = await particular<{ upsertWelcomeProfile: Record<string, any> }>(
      'welcome.profiles.write',
      `mutation Upsert($input: WelcomeEntityInput!) { upsertWelcomeProfile(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ ...updates, userId, organizationId: getOrganizationId() }) })
    return toLegacy<User>(data.upsertWelcomeProfile)
  })
}

export const getAllUsers = async () => {
  const one = await getUserProfile()
  return { data: one.data ? [one.data] : [], error: one.error }
}

export const verifyOwnerAccess = async () => {
  const role = readSession()?.user.role.toLowerCase()
  const isOwner = role === 'owner' || role === 'admin'
  return { isOwner, error: isOwner ? null : new Error('Access denied: Owner privileges required') }
}

const mapGoal = (row: Record<string, any>) => {
  const legacy = toLegacy<any>(row)!
  let extras: any = {}
  try { extras = row.notes ? JSON.parse(row.notes) : {} } catch {}
  return { ...legacy, target_story_points: extras.target_story_points ?? 0,
    completed_hours: row.actualHours ?? 0, completed_story_points: extras.completed_story_points ?? 0,
    monthly_checklist: extras.monthly_checklist ?? [] } as PerformanceGoal
}

export async function createPerformanceGoal(goal: any) {
  return result(async () => {
    const data = await particular<{ createPerformanceGoal: Record<string, any> }>('welcome.worklogs.write',
      `mutation Create($input: WelcomeEntityInput!) { createPerformanceGoal(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ ...goal, organizationId: getOrganizationId(), notes: JSON.stringify(goal) }) })
    return mapGoal(data.createPerformanceGoal)
  })
}
export async function getUserPerformanceGoals() {
  return result(async () => {
    const data = await particular<{ performanceGoals: Record<string, any>[] }>('welcome.worklogs.read',
      `query Goals($organizationId: String!) { performanceGoals(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
      { organizationId: getOrganizationId() })
    return data.performanceGoals.map(mapGoal)
  })
}
export async function getAllPerformanceGoals() { return getUserPerformanceGoals() as Promise<any> }
export async function updatePerformanceGoal(id: string, updates: any) {
  return result(async () => {
    const data = await particular<{ updatePerformanceGoal: Record<string, any> }>('welcome.worklogs.write',
      `mutation Update($input: WelcomeEntityInput!) { updatePerformanceGoal(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ id, ...updates, notes: JSON.stringify(updates) }) })
    return mapGoal(data.updatePerformanceGoal)
  })
}
export async function deletePerformanceGoal(id: string) {
  try {
    await particular('welcome.worklogs.write', `mutation Delete($id: String!) { deletePerformanceGoal(id: $id) }`, { id })
    return { error: null }
  } catch (error) { return { error: error as Error } }
}
export function getCurrentMonthYear() { return new Date().toISOString().slice(0, 7) }
export function calculatePerformancePercentage(ch: number, th: number, cs: number, ts: number) {
  if (!th && !ts) return 0
  return ((th ? ch / th : 0) + (ts ? cs / ts : 0)) / ((th ? 1 : 0) + (ts ? 1 : 0)) * 100
}


