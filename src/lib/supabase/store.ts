import { supabase } from './client'

export interface StoreProduct {
  id: string
  name: string
  description: string | null
  image_url: string | null
  product_code: string
  point_cost: number
  quantity: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StoreTransaction {
  id: string
  user_id: string
  product_id: string
  point_cost: number
  points_balance_after: number
  status: 'completed' | 'cancelled'
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface PurchaseStoreProductResponse {
  transaction_id: string
  user_id: string
  product_id: string
  product_name: string
  product_code: string
  point_cost: number
  store_points_remaining: number
  status: 'completed' | 'cancelled'
  created_at: string
}

export const getStoreProducts = async (): Promise<{ data: StoreProduct[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .select('*')
      .eq('is_active', true)
      .order('point_cost', { ascending: true })
    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const createStoreProduct = async (product: {
  name: string
  description?: string
  image_url?: string
  product_code: string
  point_cost: number
  quantity?: number
  is_active?: boolean
}): Promise<{ data: StoreProduct | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .insert({
        name: product.name,
        description: product.description || null,
        image_url: product.image_url || null,
        product_code: product.product_code,
        point_cost: product.point_cost,
        quantity: product.quantity ?? 0,
        is_active: product.is_active ?? true,
      })
      .select()
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const updateStoreProduct = async (id: string, updates: Partial<StoreProduct>): Promise<{ data: StoreProduct | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('store_products')
      .update({
        name: updates.name,
        description: updates.description,
        image_url: updates.image_url,
        product_code: updates.product_code,
        point_cost: updates.point_cost,
        quantity: updates.quantity,
        is_active: updates.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()
    if (error) return { data: null, error }
    return { data, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const deleteStoreProduct = async (id: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('store_products')
      .delete()
      .eq('id', id)
    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const getStoreTransactions = async (): Promise<{ data: StoreTransaction[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('store_transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const getAllStoreTransactions = async (): Promise<{ data: StoreTransaction[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('store_transactions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) return { data: null, error }
    return { data: data || [], error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const deleteStoreTransaction = async (transactionId: string): Promise<{ error: Error | null }> => {
  try {
    const { error } = await supabase
      .from('store_transactions')
      .delete()
      .eq('id', transactionId)
    return { error: error || null }
  } catch (error) {
    return { error: error as Error }
  }
}

export const adjustUserPoints = async (userId: string, delta: number): Promise<{ data: any | null; error: Error | null }> => {
  try {
    const { data: current, error: getErr } = await supabase
      .from('users')
      .select('store_points')
      .eq('id', userId)
      .single()
    if (getErr) return { data: null, error: getErr }
    const next = Math.max(0, (current?.store_points || 0) + delta)
    const { data: updated, error: updErr } = await supabase
      .from('users')
      .update({ store_points: next, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (updErr) return { data: null, error: updErr }
    return { data: updated, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}

export const purchaseStoreProduct = async (productId: string): Promise<{ data: PurchaseStoreProductResponse | null; error: Error | null }> => {
  try {
    const { data, error } = await (supabase.rpc('purchase_store_product', {
      p_product_id: productId
    }) as unknown as Promise<{ data: PurchaseStoreProductResponse[] | PurchaseStoreProductResponse | null; error: any }>)
    if (error) return { data: null, error }
    const purchaseData = Array.isArray(data) ? data[0] : data
    if (!purchaseData) return { data: null, error: new Error('Purchase failed: No data returned') }
    return { data: purchaseData, error: null }
  } catch (error) {
    return { data: null, error: error as Error }
  }
}


