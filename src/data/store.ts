export interface StoreProductUI {
  id: string
  name: string
  description: string | null
  image_url: string | null
  product_code: string
  point_cost: number
  quantity?: number
}

export const formatPointDisplay = (points: number) => `${points} POINTS`


