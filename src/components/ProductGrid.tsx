import { useEffect, useState } from 'react'
import { fetchChatBotObjects, resolveImageUrl, type ChatBotObject } from '@/services/chatObjectsApi'
import { cn } from '@/utils/utils'
import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'

const PLACEHOLDER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#e5e7eb" width="200" height="200"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14" font-family="sans-serif">No image</text></svg>'
)

interface ProductGridProps {
  productIds: string[]
  className?: string
}

function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-md overflow-hidden border border-border bg-white">
          <div className="w-full aspect-square bg-white animate-pulse" />
          <div className="p-2 space-y-1 bg-white">
            <div className="h-3 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ProductGrid({ productIds, className }: ProductGridProps) {
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
    <div className={cn('mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2', className)}>
      {objects.map((obj) => (
        <a
          key={obj.fca_object_id}
          href={obj.product_url ?? 'https://www.bogen33.ch/'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-md overflow-hidden border border-border bg-muted hover:border-foreground/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring relative"
          title={obj.name}
        >
          <span className="absolute top-2 left-2 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white/90 shadow-sm" aria-hidden>
            <img src={BookmarkCleanIcon} alt="" className="w-4 h-4" />
          </span>
          <img
            src={resolveImageUrl(obj.image_url) || PLACEHOLDER_IMAGE}
            alt={obj.name}
            className="w-full aspect-square object-cover"
          />
          <div className="p-2">
            <p className="text-xs font-medium text-foreground truncate" title={obj.name}>
              {obj.name}
            </p>
            <p className="text-xs text-muted-foreground">{obj.displayed_price} CHF</p>
          </div>
        </a>
      ))}
    </div>
  )
}
