import TextBadge from './TextBadge'
import TextButton from './TextButton'
import { formatPointDisplay, StoreProductUI } from '@/data/store'
import { useState } from 'react'

interface StoreProductCardProps {
  product: StoreProductUI
  onRedeem: (productId: string) => void
  loading?: boolean
  disabled?: boolean
}

export default function StoreProductCard({ product, onRedeem, loading = false, disabled = false }: StoreProductCardProps) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)

  const handleRedeemClick = () => {
    if (!disabled && !loading) {
      setShowConfirmDialog(true)
    }
  }

  const handleConfirmRedeem = () => {
    setShowConfirmDialog(false)
    onRedeem(product.id)
  }

  const handleCancelRedeem = () => {
    setShowConfirmDialog(false)
  }

  return (
    <div className="flex flex-col border border-black bg-white">
      <div className="flex h-40 items-center justify-center border-b border-black bg-gray-50">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain p-4"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center font-mono text-xs text-gray-500">
            <span>NO IMAGE</span>
            <span>{product.product_code}</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-mono text-base font-semibold uppercase tracking-wide">{product.name}</h3>
          <TextBadge variant="muted" className="font-mono text-xs">
            {product.product_code}
          </TextBadge>
        </div>

        {product.description && (
          <p className="font-mono text-xs leading-relaxed text-gray-600">
            {product.description}
          </p>
        )}

        <div className="mt-auto space-y-3">
          <div className="flex items-center justify-between">
            <TextBadge variant="success" className="font-mono text-sm">
              {formatPointDisplay(product.point_cost)}
            </TextBadge>
            <TextBadge variant={product as any && (product as any).quantity === 0 ? 'error' : 'muted'} className="font-mono text-xs">
              STOCK: {(product as any).quantity ?? '-'}
            </TextBadge>
          </div>
          <div className="flex justify-center">
            <TextButton
              onClick={handleRedeemClick}
              disabled={disabled || loading}
              variant="success"
              className="px-4 py-2 w-full"
            >
              {loading ? 'PROCESSING...' : 'REDEEM'}
            </TextButton>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 max-w-md w-full mx-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-mono text-lg font-bold uppercase tracking-wide mb-2">
                  CONFIRM REDEMPTION
                </h3>
                <p className="font-mono text-sm text-gray-600">
                  Are you sure you want to redeem <strong>{product.name}</strong> for <strong>{formatPointDisplay(product.point_cost)}</strong>?
                </p>
              </div>
              
              <div className="flex gap-3 justify-end">
                <TextButton
                  onClick={handleCancelRedeem}
                  variant="default"
                  className="px-4 py-2"
                >
                  CANCEL
                </TextButton>
                <TextButton
                  onClick={handleConfirmRedeem}
                  variant="success"
                  className="px-4 py-2"
                >
                  CONFIRM REDEEM
                </TextButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


