import { useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TextContent } from '@/components/TextContent'
import type { MessageProductDetail } from '@/types/chat'

interface ProductDetailCardProps {
  product: MessageProductDetail
  onBack: () => void
  onStartBooking?: (productId?: string) => void
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

export function ProductDetailCard({ product, onBack, onStartBooking }: ProductDetailCardProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  const safeImages = product.images.length > 0 ? product.images : []
  const currentImage = safeImages[activeImageIdx]
  const hasMultipleImages = safeImages.length > 1
  const description = product.description?.trim() ?? ''
  const longDescription = wordCount(description) > 50
  useEffect(() => {
    setImageLoaded(false)
  }, [currentImage?.src, product.objectId])
  const displayedDescription = useMemo(() => {
    if (!description) return ''
    if (expanded || !longDescription) return description
    return description.split(/\s+/).slice(0, 50).join(' ') + '...'
  }, [description, expanded, longDescription])

  return (
    <div className="mt-2 rounded-[18px] overflow-hidden">
      <div className="relative">
        {!imageLoaded && (
          <div className="absolute inset-0 z-[1] flex items-center justify-center bg-muted">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-transparent" />
          </div>
        )}
        {currentImage ? (
          <img
            key={currentImage.src}
            src={currentImage.src}
            alt={currentImage.alt || product.name}
            className="h-[220px] w-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageLoaded(true)}
          />
        ) : (
          <div className="h-[220px] w-full bg-muted" />
        )}

        <button
          type="button"
          onClick={onBack}
          className="absolute left-2 top-2 rounded-full border border-border bg-background/90 p-1.5"
          aria-label="Back"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {hasMultipleImages && (
          <>
            <button
              type="button"
              onClick={() =>
                (setImageLoaded(false), setActiveImageIdx((prev) =>
                  prev === 0 ? safeImages.length - 1 : prev - 1
                ))
              }
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1.5"
              aria-label="Previous image"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() =>
                (setImageLoaded(false), setActiveImageIdx((prev) =>
                  prev === safeImages.length - 1 ? 0 : prev + 1
                ))
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5"
              aria-label="Next image"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => onStartBooking?.(product.objectId)}
          className="absolute bottom-2 right-2 rounded-full border border-border bg-transparent px-3 py-1 text-sm text-foreground"
        >
          Besichtigen
        </button>
      </div>

      <div className="border-t border-border">
        <div className="space-y-1.5 px-2.5 py-2">
          <TextContent variant="textMedium">
            {product.name}
          </TextContent>

          <TextContent variant="textSmall" className="font-normal">
          Preis:{product.displayedPrice || product.price ? `CHF ${product.displayedPrice || product.price}` : 'Price on request'}
          </TextContent>

          {product.measurements && (
            <TextContent variant="textSmall" className="font-normal">{product.measurements}</TextContent>
          )}

          {description && (
            <div className="space-y-1">
              <TextContent variant="textSmall" className="leading-snug font-normal">
                {displayedDescription}
              </TextContent>
              {longDescription && (
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="text-xs underline underline-offset-2"
                >
                  {expanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

