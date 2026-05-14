import { cn } from '@/utils/utils'
import type { ReactNode } from 'react'

interface ChatBubbleProps {
  children: ReactNode
  variant?: 'user' | 'assistant'
  className?: string
  showTail?: boolean
}

export function ChatBubble({ children, variant = 'assistant', className, showTail = true }: ChatBubbleProps) {
  return (
    <div
      className={cn(
        'relative min-w-[120px]',
        variant === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant',
        className
      )}
    >
      {showTail && (
        <>
          <div className="tail"></div>
          <div className="tail2"></div>
        </>
      )}
      <div className="relative z-10 min-w-0 w-full">
        {children}
      </div>
    </div>
  )
}

