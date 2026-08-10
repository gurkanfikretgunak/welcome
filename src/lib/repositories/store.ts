import { getOrganizationId } from '@/lib/mf/config'
import { getUserProfile, updateUserProfile } from './users'
import { ENTITY_FIELDS, particular, result, toInput, toLegacy } from './entity'
export interface StoreProduct {
  id: string; name: string; description: string|null; image_url: string|null; product_code: string
  point_cost: number; quantity: number; is_active: boolean; created_at: string; updated_at: string
}
export interface StoreTransaction {
  id: string; user_id: string; product_id: string; point_cost: number; points_balance_after: number
  status: 'completed'|'cancelled'; metadata: Record<string, unknown>|null; created_at: string
}
export interface PurchaseStoreProductResponse {
  transaction_id: string; user_id: string; product_id: string; product_name: string; product_code: string
  point_cost: number; store_points_remaining: number; status: 'completed'|'cancelled'; created_at: string
}
const map = (row: Record<string, any>) => {
  const value = toLegacy<any>(row)!
  return { ...value, point_cost: row.pricePoints, quantity: row.stock, product_code: row.slug,
    transaction_id: row.id, product_name: row.name, store_points_remaining: row.storePoints }
}
async function list(field: 'storeProducts'|'storeTransactions') {
  return result(async () => {
    const data = await particular<Record<string, Record<string, any>[]>>('welcome.store.read',
      `query Store($organizationId: String!) { ${field}(organizationId: $organizationId) { ${ENTITY_FIELDS} } }`,
      { organizationId: getOrganizationId() })
    return data[field].map(map)
  })
}
export const getStoreProducts = async () => list('storeProducts') as any
export const getStoreTransactions = async () => list('storeTransactions') as any
export const getAllStoreTransactions = getStoreTransactions
async function mutate(name: string, input: any) {
  return result(async () => {
    const mapped = { ...input, pricePoints: input.point_cost, stock: input.quantity, slug: input.product_code }
    const data = await particular<Record<string, Record<string, any>>>('welcome.store.write',
      `mutation Save($input: WelcomeEntityInput!) { ${name}(input: $input) { ${ENTITY_FIELDS} } }`,
      { input: toInput(mapped) })
    return map(data[name])
  })
}
export const createStoreProduct = async (input: any) => mutate('createStoreProduct', { ...input, organizationId: getOrganizationId() })
export const updateStoreProduct = async (id: string, input: any) => mutate('updateStoreProduct', { id, ...input })
export const deleteStoreProduct = async (id: string) => {
  try { await particular('welcome.store.write', `mutation Delete($id: String!) { deleteStoreProduct(id: $id) }`, { id }); return { error: null } }
  catch (error) { return { error: error as Error } }
}
export const purchaseStoreProduct = async (productId: string) => result(async () => {
  const data = await particular<{ purchaseStoreProduct: Record<string, any> }>('welcome.store.write',
    `mutation Purchase($organizationId: String!, $productId: String!) {
      purchaseStoreProduct(organizationId: $organizationId, productId: $productId) { ${ENTITY_FIELDS} }
    }`, { organizationId: getOrganizationId(), productId })
  return map(data.purchaseStoreProduct) as PurchaseStoreProductResponse
})
export const adjustUserPoints = async (userId: string, delta: number) => {
  const current = await getUserProfile(userId)
  if (current.error || !current.data) return { data: null, error: current.error ?? new Error('Profile not found') }
  return updateUserProfile(userId, { store_points: Math.max(0, (current.data.store_points ?? 0) + delta) })
}
export const deleteStoreTransaction = async (_id: string) => ({ error: new Error('Deleting store transactions is not supported') })


