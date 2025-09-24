import TextBadge from './TextBadge'
import TextButton from './TextButton'
import { formatPointDisplay, StoreProductUI } from '@/data/store'

interface StoreProductCardProps {
  product: StoreProductUI
  onRedeem: (productId: string) => void
  loading?: boolean
  disabled?: boolean
}

export default function StoreProductCard({ product, onRedeem, loading = false, disabled = false }: StoreProductCardProps) {
  const handleRedeemClick = () => {
    if (!disabled && !loading) {
      onRedeem(product.id)
    }
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

        <div className="mt-auto flex items-center justify-between">
          <TextBadge variant="success" className="font-mono text-sm">
            {formatPointDisplay(product.point_cost)}
          </TextBadge>
          <div className="flex items-center gap-2">
            <TextBadge variant={product as any && (product as any).quantity === 0 ? 'error' : 'muted'} className="font-mono text-xs">
              STOCK: {(product as any).quantity ?? '-'}
            </TextBadge>
          <TextButton
            onClick={handleRedeemClick}
            disabled={disabled || loading}
            variant="success"
            className="px-4 py-2"
          >
            {loading ? 'PROCESSING...' : 'REDEEM'}
          </TextButton>
          </div>
        </div>
      </div>
    </div>
  )
}


