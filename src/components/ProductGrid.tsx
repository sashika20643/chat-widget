import { useEffect, useState } from 'react'
import { fetchChatBotObjects, resolveImageUrl, type ChatBotObject } from '@/services/chatObjectsApi'
import { cn } from '@/utils/utils'
import type { MessageProductDetail } from '@/types/chat'

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e5e7eb" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14" font-family="sans-serif">No image</text></svg>'
)

interface ProductGridProps {
  productIds: string[]
  className?: string
  onProductSelect?: (product: MessageProductDetail) => void
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 border-l border-t border-border">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden border-r border-b border-border">
          <div className="w-full aspect-square bg-muted animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function toProductDetail(obj: ChatBotObject): MessageProductDetail {
  const withExtras = obj as ChatBotObject & {
    description?: string | null
    short_description?: string | null
    measurements?: string | null
    image_urls?: string[] | null
    gallery_images?: string[] | null
  }

  const primary = resolveImageUrl(obj.image_url)
  const extraImages = [
    ...(obj.images ?? []),
    ...(withExtras.image_urls ?? []),
    ...(withExtras.gallery_images ?? []),
  ]
    .map((url) => resolveImageUrl(url))
    .filter((u): u is string => !!u)

  const uniqueImages = Array.from(new Set([primary, ...extraImages].filter((u): u is string => !!u)))

  return {
    objectId: String(obj.object_id),
    name: obj.name,
    price: obj.price,
    displayedPrice: obj.displayed_price,
    measurements: withExtras.measurements ?? null,
    description: obj.web_text_a ?? withExtras.description ?? withExtras.short_description ?? null,
    images: uniqueImages.map((src) => ({ src, alt: obj.name })),
    productUrl: obj.product_url ?? null,
  }
}

export function ProductGrid({ productIds, className, onProductSelect }: ProductGridProps) {
  const [objects, setObjects] = useState<ChatBotObject[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!productIds.length) return
    let cancelled = false
    setError(null)
    fetchChatBotObjects(productIds)
      .then((data) => {
        if (!cancelled) setObjects(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load products')
      })
    return () => { cancelled = true }
  }, [productIds.join(',')])

  if (error) {
    return (
      <p className="text-sm text-muted-foreground mt-2" role="status">
        Could not load products: {error}
      </p>
    )
  }

  if (objects === null) {
    return (
      <div className={cn('mt-3', className)}>
        <ProductGridSkeleton count={productIds.length} />
      </div>
    )
  }

  if (objects.length === 0) {
    return null
  }

  return (
    <div className={cn('mt-3 grid grid-cols-2 lg:grid-cols-3 border-l border-t border-border', className)}>
      {objects.map((obj) => (
        <button
          type="button"
          key={obj.fca_object_id}
          className="block overflow-hidden border-r border-b border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
          title={obj.name}
          onClick={() => {
            if (!onProductSelect) return
            onProductSelect(toProductDetail(obj))
          }}
        >
          <img
            src={resolveImageUrl(obj.image_url) || PLACEHOLDER_IMAGE}
            alt={obj.name}
            className="w-full aspect-square object-cover"
          />
        </button>
      ))}
    </div>
  )
}
