import { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/utils'

const DEFAULT_MESSAGE = 'For this Chair I have further recommendations!'
const TYPING_INTERVAL_MS = 35

interface InactivitySuggestionNotificationProps {
  visible: boolean
  onDismiss: () => void
  onAction: () => void
  message?: string
  /** Optional image URLs for recommendation thumbnails (up to 6, shown in 2x3 grid on desktop) */
  thumbnailUrls?: string[]
  /** Desktop = top-left popup with typing; Mobile = in bottom panel with pulse */
  variant: 'desktop' | 'mobile'
}

function useTypingAnimation(fullText: string, enabled: boolean) {
  const [displayedText, setDisplayedText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!enabled || !fullText) {
      setDisplayedText('')
      setDone(false)
      return
    }
    setDisplayedText('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i += 1
      if (i > fullText.length) {
        clearInterval(id)
        setDone(true)
        return
      }
      setDisplayedText(fullText.slice(0, i))
    }, TYPING_INTERVAL_MS)
    return () => clearInterval(id)
  }, [fullText, enabled])

  return { displayedText, done }
}

export function InactivitySuggestionNotification({
  visible,
  onDismiss,
  onAction,
  message = DEFAULT_MESSAGE,
  thumbnailUrls = [],
  variant,
}: InactivitySuggestionNotificationProps) {
  const [animationStarted, setAnimationStarted] = useState(false)
  const { displayedText } = useTypingAnimation(message, visible && variant === 'desktop' && animationStarted)

  useEffect(() => {
    if (visible && variant === 'desktop') {
      const t = setTimeout(() => setAnimationStarted(true), 100)
      return () => clearTimeout(t)
    }
    if (!visible) setAnimationStarted(false)
  }, [visible, variant])

  if (!visible) return null

  if (variant === 'desktop') {
    return (
      <div
        className="fixed left-5 top-5 z-[100] w-[min(420px,calc(100vw-2.5rem))] animate-in fade-in slide-in-from-left-4 duration-300"
        role="dialog"
        aria-label="Suggestion"
      >
        {/* Speech bubble with tail */}
        <div className="relative rounded-2xl border-2 border-black/20 bg-white px-5 pt-4 pb-5 shadow-lg">
          {/* Close button */}
          <button
            type="button"
            onClick={onDismiss}
            className="absolute left-3 top-3 rounded-full p-1.5 text-black/60 hover:bg-black/5 hover:text-black"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Message with typing animation */}
          <p className="min-h-[2em] pr-12 pt-8 text-base font-medium leading-snug text-black">
            {displayedText}
            {!displayedText && <span className="invisible">{message}</span>}
          </p>

          {/* Green CTA button - opens chat */}
          <button
            type="button"
            onClick={onAction}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shadow hover:bg-green-700"
            aria-label="View recommendations"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Optional thumbnails grid (2x3) */}
          {thumbnailUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2">
              {thumbnailUrls.slice(0, 6).map((url, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-md border border-black/10 bg-muted"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Speech bubble tail (pointing down-right) */}
          <div
            className="absolute -bottom-2.5 left-8 h-5 w-5 rotate-45 border-b-2 border-r-2 border-black/20 bg-white"
            aria-hidden
          />
        </div>
      </div>
    )
  }

  // Mobile: integrated into bottom control panel with pulse animation
  return (
    <div
      className={cn(
        'relative flex flex-shrink-0 items-center gap-3 rounded-xl border-2 border-black/15 bg-white px-4 py-3 shadow-sm',
        'animate-in fade-in slide-in-from-bottom-2 duration-300'
      )}
      role="dialog"
      aria-label="Suggestion"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 rounded-full p-1.5 text-black/60 hover:bg-black/5 hover:text-black"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <p className="min-w-0 flex-1 text-base font-medium text-black line-clamp-2 leading-snug">
        {message}
      </p>
      <button
        type="button"
        onClick={onAction}
        className="relative flex flex-shrink-0 items-center justify-center gap-1 rounded-full bg-green-600 px-4 py-2 text-base font-medium text-white shadow hover:bg-green-700"
      >
        <span className="hidden sm:inline">View</span>
        <ChevronRight className="h-5 w-5" />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-ping rounded-full bg-white/80" aria-hidden />
      </button>
    </div>
  )
}

export default InactivitySuggestionNotification
