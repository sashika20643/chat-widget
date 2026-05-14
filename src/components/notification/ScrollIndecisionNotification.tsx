import { ChevronRight, X } from 'lucide-react'
import { cn } from '@/utils/utils'

const SCROLL_INDECISION_MESSAGE = "Looking for something specific? I'll narrow the selection for you."
const SCROLL_INDECISION_BUTTONS = [
  { id: 'scroll_indecision_filter_assistant', label: '💡 Filter Assistant' },
  { id: 'scroll_indecision_specific_search', label: '🎯 Specific Search' },
  { id: 'scroll_indecision_inspiration', label: '✨ Inspiration' },
] as const

export type ScrollIndecisionActionId = (typeof SCROLL_INDECISION_BUTTONS)[number]['id']

interface ScrollIndecisionNotificationProps {
  visible: boolean
  variant: 'desktop' | 'mobile'
  onDismiss: () => void
  onAction: () => void
  onButtonClick?: (actionId: ScrollIndecisionActionId) => void
}

export default function ScrollIndecisionNotification({
  visible,
  variant,
  onDismiss,
  onAction,
  onButtonClick,
}: ScrollIndecisionNotificationProps) {
  if (!visible) return null

  const handleButtonClick = (actionId: ScrollIndecisionActionId) => {
    onButtonClick?.(actionId)
    onAction()
  }

  if (variant === 'desktop') {
    return (
      <div
        className="fixed left-5 top-5 z-[9999] w-[min(430px,calc(100vw-2.5rem))] animate-in fade-in slide-in-from-left-4 duration-300"
        role="dialog"
        aria-label="Scroll indecision suggestion"
      >
        <div className="relative rounded-2xl border-2 border-border bg-background px-5 pt-4 pb-5 shadow-lg">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute left-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="pr-12 pt-8 text-base font-medium leading-snug text-foreground">
            {SCROLL_INDECISION_MESSAGE}
          </p>

          <button
            type="button"
            onClick={onAction}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
            aria-label="Open chat"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 flex flex-wrap gap-2">
            {SCROLL_INDECISION_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => handleButtonClick(btn.id)}
                className={cn(
                  'rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-foreground',
                  'hover:bg-muted transition-colors',
                )}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div
            className="absolute -bottom-2.5 left-8 h-5 w-5 rotate-45 border-b-2 border-r-2 border-border bg-background"
            aria-hidden
          />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'relative flex flex-shrink-0 items-center gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 shadow-sm',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
      )}
      role="dialog"
      aria-label="Scroll indecision suggestion"
    >
      <button
        type="button"
        onClick={onDismiss}
        className="flex-shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Close"
      >
        <X className="h-5 w-5" />
      </button>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="text-base font-medium text-foreground line-clamp-2 leading-snug">
          {SCROLL_INDECISION_MESSAGE}
        </p>
        <div className="flex flex-wrap gap-2">
          {SCROLL_INDECISION_BUTTONS.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => handleButtonClick(btn.id)}
              className={cn(
                'rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-foreground',
                'hover:bg-muted transition-colors',
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onAction}
        className="relative flex flex-shrink-0 items-center justify-center gap-1 rounded-full bg-primary px-4 py-2 text-base font-medium text-primary-foreground shadow hover:opacity-90"
      >
        <span className="hidden sm:inline">Open</span>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

