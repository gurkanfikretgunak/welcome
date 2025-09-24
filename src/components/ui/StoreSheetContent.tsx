import TextBadge from './TextBadge'
import TextButton from './TextButton'
import StoreProductCard from './StoreProductCard'
import { StoreProductUI } from '@/data/store'

interface StoreSheetContentProps {
  userEmail: string | null
  userId: string
  userTitle: string
  storePoints: number
  products: StoreProductUI[]
  onRedeem: (productId: string) => void
  purchasingProductId: string | null
  isLoading: boolean
  error: string | null
}

export default function StoreSheetContent({
  userEmail,
  userId,
  userTitle,
  storePoints,
  products,
  onRedeem,
  purchasingProductId,
  isLoading,
  error
}: StoreSheetContentProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <TextBadge variant="default" className="font-mono text-xs">
                {userTitle}
              </TextBadge>
              <TextBadge variant="muted" className="font-mono text-xs">
                {userId}
              </TextBadge>
            </div>
            {userEmail && (
              <p className="font-mono text-sm text-gray-600">{userEmail}</p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span className="font-mono text-xs text-gray-500">STORE POINTS</span>
            <TextBadge variant="success" className="px-3 py-2 font-mono text-base">
              {storePoints}
            </TextBadge>
          </div>
        </div>

        <p className="font-mono text-xs uppercase tracking-wide text-gray-500">
          View store items defined by the owner and quickly redeem using your points. Purchases are deducted from your balance instantly.
        </p>
      </header>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm font-semibold uppercase tracking-wide">ÜRÜNLER</h2>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 p-4">
            <TextBadge variant="error" className="font-mono text-xs">
              {error}
            </TextBadge>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <TextBadge variant="muted">YÜKLENİYOR...</TextBadge>
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 py-12">
            <TextBadge variant="muted" className="font-mono text-xs">
              MAĞAZA ÜRÜNÜ BULUNAMADI
            </TextBadge>
            <p className="font-mono text-xs text-gray-500">Owner mağazaya ürün eklediğinde burada belirecek.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <StoreProductCard
                key={product.id}
                product={product}
                onRedeem={onRedeem}
                disabled={storePoints < product.point_cost}
                loading={purchasingProductId === product.id}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}


