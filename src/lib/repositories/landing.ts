import { getOrganizationId } from '@/lib/mf/config'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'
export interface LandingPage { id: string; title: string; subtitle: string; is_active: boolean; created_at: string; updated_at: string }
export interface LandingSection {
  id: string; landing_page_id: string; section_type: 'hero'|'welcome'|'features'|'process'|'cta'|'info'|'custom'
  title: string; content: any; order_index: number; is_visible: boolean; created_at: string; updated_at: string
}
export interface LandingPageWithSections extends LandingPage { sections: LandingSection[] }
const decode = (value?: string|null) => { try { return value ? JSON.parse(value) : {} } catch { return {} } }
const page = (row: Record<string, any>): LandingPage => ({ ...toLegacy<any>(row), ...decode(row.settingsJson), id: row.id,
  title: row.title, subtitle: decode(row.settingsJson).subtitle ?? '', is_active: row.isPublished ?? false })
const section = (row: Record<string, any>): LandingSection => ({ ...toLegacy<any>(row), ...decode(row.contentJson),
  landing_page_id: row.pageId, section_type: row.sectionType, content: decode(row.contentJson).content ?? decode(row.contentJson),
  order_index: row.sortOrder ?? 0 })
async function pages(accessToken?: string | null) {
  const data = await particular<{ landingPages: Record<string, any>[] }>('welcome.landing.read',
    `query Pages($organizationId: String!) { landingPages(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
    { organizationId: getOrganizationId() }, accessToken)
  return data.landingPages.map(page)
}
async function sections(pageId: string, accessToken?: string | null) {
  const data = await particular<{ landingSections: Record<string, any>[] }>('welcome.landing.read',
    `query Sections($pageId: String!) { landingSections(pageId: $pageId) { ${ENTITY_FIELDS} } }`, { pageId }, accessToken)
  return data.landingSections.map(section).sort((a,b) => a.order_index-b.order_index)
}
export const getAllLandingPages = async (accessToken?: string | null) => result(() => pages(accessToken))
export const getActiveLandingPage = async (accessToken?: string | null) => result(async () => {
  const found = (await pages(accessToken)).find((item) => item.is_active) ?? null
  return found ? { ...found, sections: await sections(found.id, accessToken) } : null
})
export const getLandingPageById = async (id: string) => result(async () => {
  const data = await particular<{ landingPage: Record<string, any>|null }>('welcome.landing.read',
    `query Page($pageId: String!) { landingPage(pageId: $pageId) { ${ENTITY_FIELDS} } }`, { pageId: id })
  return data.landingPage ? { ...page(data.landingPage), sections: await sections(id) } : null
})
async function mutatePage(name: string, input: any) {
  return result(async () => {
    const data = await particular<Record<string, Record<string, any>>>('welcome.landing.write',
      `mutation Save($input: WelcomeEntityInput!) { ${name}(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ id: input.id, organizationId: getOrganizationId(), slug: input.slug ?? input.title?.toLowerCase().replace(/\W+/g,'-'),
        title: input.title, isPublished: input.is_active, settingsJson: JSON.stringify(input) }) })
    return page(data[name])
  })
}
export const createLandingPage = async (input: any) => mutatePage('createLandingPage', input)
export const updateLandingPage = async (id: string, input: any) => mutatePage('updateLandingPage', { id, ...input })
export const deleteLandingPage = async (id: string) => {
  try { await particular('welcome.landing.write', `mutation Delete($id: String!) { deleteLandingPage(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}
async function mutateSection(input: any) {
  return result(async () => {
    const data = await particular<{ upsertLandingSection: Record<string, any> }>('welcome.landing.write',
      `mutation Save($input: WelcomeEntityInput!) { upsertLandingSection(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput({ id: input.id, pageId: input.landing_page_id ?? input.pageId,
        sectionType: input.section_type, title: input.title, sortOrder: input.order_index, contentJson: JSON.stringify(input) }) })
    return section(data.upsertLandingSection)
  })
}
export const createLandingSection = mutateSection
export const updateLandingSection = async (id: string, input: any) => mutateSection({ id, ...input })
export const deleteLandingSection = async (id: string) => {
  try { await particular('welcome.landing.write', `mutation Delete($id: String!) { deleteLandingSection(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}
export const reorderLandingSections = async (items: {id:string;order_index:number}[]) => {
  const results = await Promise.all(items.map((item) => updateLandingSection(item.id, item)))
  return { error: results.find((item) => item.error)?.error ?? null }
}
export const setActiveLandingPage = async (id: string) => {
  const all = await pages()
  await Promise.all(all.map((item) => updateLandingPage(item.id, { ...item, is_active: item.id === id })))
  return { error: null }
}

