import { forwardParticular } from '@/lib/mf/client'

export const ENTITY_FIELDS = `
  id organizationId userId githubUsername masterEmail personalEmail isVerified isStoreUser
  storePoints firstName lastName phone department jobRole companyEmailOtp companyEmailOtpExpiresAt
  monthYear targetHours actualHours notes title description date hours project category priority status
  assignedTo resolutionNotes resolvedAt eventDate location maxParticipants isUpcoming isPublished isActive
  createdBy eventId email fullName referenceCode itemsJson checklistId assignedAt completedAt checklistKey
  itemKey completed name pricePoints imageUrl stock productId pointsSpent slug settingsJson formId
  questionType label required sortOrder questionId respondentEmail respondentName submissionId valueText
  pageId sectionType contentJson platform version createdAt updatedAt
`

const aliases: Record<string, string> = {
  organization_id: 'organizationId', user_id: 'userId', github_username: 'githubUsername',
  master_email: 'masterEmail', personal_email: 'personalEmail', is_verified: 'isVerified',
  is_store_user: 'isStoreUser', store_points: 'storePoints', first_name: 'firstName',
  last_name: 'lastName', job_role: 'jobRole', month_year: 'monthYear',
  target_hours: 'targetHours', actual_hours: 'actualHours', assigned_to: 'assignedTo',
  resolution_notes: 'resolutionNotes', resolved_at: 'resolvedAt', event_date: 'eventDate',
  max_participants: 'maxParticipants', is_upcoming: 'isUpcoming', is_published: 'isPublished',
  is_active: 'isActive', created_by: 'createdBy', event_id: 'eventId', full_name: 'fullName',
  reference_code: 'referenceCode', items_json: 'itemsJson', checklist_id: 'checklistId',
  assigned_at: 'assignedAt', completed_at: 'completedAt', checklist_key: 'checklistKey',
  item_key: 'itemKey', price_points: 'pricePoints', image_url: 'imageUrl',
  product_id: 'productId', points_spent: 'pointsSpent', settings_json: 'settingsJson',
  form_id: 'formId', question_type: 'questionType', sort_order: 'sortOrder',
  question_id: 'questionId', respondent_email: 'respondentEmail',
  respondent_name: 'respondentName', submission_id: 'submissionId', value_text: 'valueText',
  page_id: 'pageId', section_type: 'sectionType', content_json: 'contentJson',
  created_at: 'createdAt', updated_at: 'updatedAt',
  role: 'jobRole',
}

const inputFields = new Set(ENTITY_FIELDS.trim().split(/\s+/))

export function toInput(value: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, field]) => field !== undefined)
      .map(([key, field]) => [aliases[key] ?? key, field] as const)
      .filter(([key]) => inputFields.has(key))
  )
}

export function toLegacy<T = Record<string, unknown>>(value: Record<string, any> | null): T | null {
  if (!value) return null
  const out: Record<string, any> = { ...value }
  for (const [legacy, modern] of Object.entries(aliases)) out[legacy] = value[modern]
  out.role = value.jobRole
  return out as T
}

export async function particular<T>(
  capability: string,
  query: string,
  variables: Record<string, unknown> = {},
  accessToken?: string | null
) {
  return forwardParticular<T>({ requiredCapability: capability, query, variables, accessToken })
}

export const result = async <T>(operation: () => Promise<T>) => {
  try {
    return { data: await operation(), error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}
