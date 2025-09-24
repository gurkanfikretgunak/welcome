import TextBadge from './TextBadge'
import TextButton from './TextButton'
import StoreProductCard from './StoreProductCard'
import { StoreProductUI } from '@/data/store'
import React from 'react'

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
  // optional: history support (provided by parent)
  history?: Array<{
    id: string
    product_name: string
    product_code: string
    point_cost: number
    status: 'completed' | 'cancelled'
    created_at: string
  }>
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
  error,
  history
}: StoreSheetContentProps) {
  const [activeTab, setActiveTab] = React.useState<'redeem' | 'used'>('redeem')
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
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 border font-mono text-xs ${activeTab === 'redeem' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              onClick={() => setActiveTab('redeem')}
            >
              REDEEM
            </button>
            <button
              className={`px-3 py-1 border font-mono text-xs ${activeTab === 'used' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
              onClick={() => setActiveTab('used')}
            >
              USED
            </button>
          </div>
        </div>

        {error && (
          <div className="border border-red-300 bg-red-50 p-4">
            <TextBadge variant="error" className="font-mono text-xs">
              {error}
            </TextBadge>
          </div>
        )}

        {activeTab === 'redeem' ? (
          isLoading ? (
            <div className="flex justify-center py-12">
              <TextBadge variant="muted">LOADING...</TextBadge>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 py-12">
              <TextBadge variant="muted" className="font-mono text-xs">
                NO STORE PRODUCTS FOUND
              </TextBadge>
              <p className="font-mono text-xs text-gray-500">Items will appear here when the owner adds them to the store.</p>
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
          )
        ) : (
          <div className="space-y-3">
            {!history || history.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-gray-300 py-12">
                <TextBadge variant="muted" className="font-mono text-xs">NO REDEEM HISTORY</TextBadge>
                <p className="font-mono text-xs text-gray-500">Your recent redemptions will appear here.</p>
              </div>
            ) : (
              history.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between border border-black bg-white p-3">
                  <div className="text-left">
                    <div className="font-mono text-sm">{tx.product_name}</div>
                    <div className="font-mono text-xs text-gray-500">{tx.product_code} • {new Date(tx.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TextBadge variant={tx.status === 'completed' ? 'success' : 'warning'} className="font-mono text-xs uppercase">{tx.status}</TextBadge>
                    <TextBadge variant="muted" className="font-mono text-xs">-{tx.point_cost} pts</TextBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  )
}


