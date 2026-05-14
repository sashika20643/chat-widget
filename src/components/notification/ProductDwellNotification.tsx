import { ChevronRight, X } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { cn } from '@/utils/utils'

const PRODUCT_DWELL_BUTTONS = [
  { id: 'product_dwell_similar_products', label: '🔍 Similar Products' },
  { id: 'product_dwell_questions', label: '💬 Questions?' },
] as const

interface ProductDwellNotificationProps {
  visible: boolean
  variant: 'desktop' | 'mobile'
  productName: string
  onDismiss: () => void
  onAction: () => void
  onButtonClick?: (actionId: (typeof PRODUCT_DWELL_BUTTONS)[number]['id']) => void
}

export default function ProductDwellNotification({
  visible,
  variant,
  productName,
  onDismiss,
  onAction,
  onButtonClick,
}: ProductDwellNotificationProps) {
  if (!visible) return null

  const message = `Like this ${productName}? I'll show you similar alternatives or answer questions.`

  const handleButtonClick = (actionId: (typeof PRODUCT_DWELL_BUTTONS)[number]['id']) => {
    onButtonClick?.(actionId)
    onAction()
  }

  const handleButtonKeyDown = (
    event: KeyboardEvent<HTMLDivElement>,
    actionId: (typeof PRODUCT_DWELL_BUTTONS)[number]['id'],
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleButtonClick(actionId)
    }
  }

  if (variant === 'desktop') {
    return (
      <div
        className="fixed left-5 top-5 z-[110] w-[min(420px,calc(100vw-2.5rem))] animate-in fade-in slide-in-from-left-4 duration-300"
        role="dialog"
        aria-label="Product dwell suggestion"
      >
        <div className="relative overflow-visible rounded-2xl border-2 border-border bg-background px-5 pt-4 pb-5 shadow-lg">
          <button
            type="button"
            onClick={onDismiss}
            className="absolute left-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <p className="pr-12 pt-8 text-base font-medium leading-snug text-foreground">{message}</p>

          <button
            type="button"
            onClick={onAction}
            className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:opacity-90"
            aria-label="Open chat"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="mt-4 grid w-full grid-cols-2 gap-2">
            {PRODUCT_DWELL_BUTTONS.map((btn) => (
              <div
                key={btn.id}
                role="button"
                tabIndex={0}
                aria-label={btn.label}
                onClick={() => handleButtonClick(btn.id)}
                onKeyDown={(event) => handleButtonKeyDown(event, btn.id)}
                className={cn(
                  'min-w-0 w-full inline-flex items-center justify-center rounded-full border border-border bg-background px-2 py-2 text-center text-sm font-medium text-foreground leading-snug',
                  'hover:bg-muted transition-colors',
                )}
              >
                {btn.label}
              </div>
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
        'relative flex w-full min-w-0 flex-shrink-0 flex-col gap-3 rounded-xl border-2 border-border bg-background px-4 py-3 shadow-sm',
        'animate-in fade-in slide-in-from-bottom-2 duration-300',
      )}
      role="dialog"
      aria-label="Product dwell suggestion"
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onDismiss}
          className="mt-0.5 flex-shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 text-base font-medium text-foreground line-clamp-3 leading-snug">
          {message}
        </p>
        <button
          type="button"
          onClick={onAction}
          className="relative mt-0.5 flex flex-shrink-0 items-center justify-center gap-1 rounded-full bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow hover:opacity-90 sm:px-4 sm:text-base"
        >
          <span className="hidden sm:inline">Open</span>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      <div className="grid w-full grid-cols-2 gap-2">
        {PRODUCT_DWELL_BUTTONS.map((btn) => (
          <div
            key={btn.id}
            role="button"
            tabIndex={0}
            aria-label={btn.label}
            onClick={() => handleButtonClick(btn.id)}
            onKeyDown={(event) => handleButtonKeyDown(event, btn.id)}
            className={cn(
              'min-w-0 w-full inline-flex items-center justify-center rounded-full border border-border bg-background px-2 py-2 text-center text-xs font-medium text-foreground leading-snug sm:text-sm',
              'hover:bg-muted transition-colors',
            )}
          >
            {btn.label}
          </div>
        ))}
      </div>
    </div>
  )
}

