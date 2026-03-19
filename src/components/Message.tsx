import { useState } from 'react'
import { Button } from '@/components/ui/shadCN/button'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { ProductGrid } from '@/components/ProductGrid'
import { TextContent } from '@/components/TextContent'
import { TypewriterText } from '@/components/TypewriterText'
import { ResponseTimeDisplay } from '@/components/ResponseTimeDisplay'
import { cn } from '@/utils/utils'
import type { Message as MessageType, MessageContent } from '@/types/chat'

interface MessageProps {
  message: MessageType
  onButtonClick?: (action: string, buttonIndex: number) => void
  /** If false, skip typewriter effect and show full text immediately (for old/restored messages) */
  isNewMessage?: boolean
}

function Message({ message, onButtonClick, isNewMessage = true }: MessageProps) {
  const [textComplete, setTextComplete] = useState(false)
  const isUser = message.role === 'user'
  const content: MessageContent = typeof message.content === 'string' 
    ? { text: message.content }
    : message.content

  return (
    <div
      className={cn(
        'flex gap-3 w-full min-w-0',
        isNewMessage && 'animate-in fade-in-0 duration-[1200ms] ease-out',
        isUser ? 'justify-end' : 'justify-start',
        isNewMessage && (isUser ? 'slide-in-from-right-6' : 'slide-in-from-left-6')
      )}
    >
      <div className={cn('flex', !isUser && 'flex-col')}>
      <ChatBubble
        variant={isUser ? 'user' : 'assistant'}
        className="max-w-[80%] sm:max-w-[80%] w-fit"
      >
        {/* Images */}
        {content.images && content.images.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-2">
            {content.images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt || `Image ${index + 1}`}
                className="rounded-md border border-border bg-muted w-full aspect-square object-cover"
              />
            ))}
          </div>
        )}

        {/* Text Content */}
        {content.text &&
          (isUser ? (
            <TextContent
              variant="textMedium"
              className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
            >
              {content.text}
            </TextContent>
          ) : isNewMessage ? (
            <TypewriterText text={content.text} speed={25} onComplete={() => setTextComplete(true)}>
              {(visibleText) => (
                <TextContent
                  variant="textMedium"
                  className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
                >
                  {visibleText}
                </TextContent>
              )}
            </TypewriterText>
          ) : (
            <TextContent
              variant="textMedium"
              className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
            >
              {content.text}
            </TextContent>
          ))}

        {/* Product grid – show only after text is fully printed (or immediately for old messages) */}
        {content.productIds && content.productIds.length > 0 && (textComplete || !isNewMessage) && (
          <ProductGrid productIds={content.productIds} />
        )}

        {/* Product cards – show only after text is fully printed (or immediately for old messages) */}
        {content.productCards && content.productCards.length > 0 && (textComplete || !isNewMessage) && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {content.productCards.map((card, index) => (
              <a
                key={index}
                href={card.product_url ?? card.href ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md overflow-hidden border border-border bg-muted hover:border-foreground/25 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                title={card.title}
              >
                <img
                  src={card.src}
                  alt={card.alt || card.title || `Product ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
              </a>
            ))}
          </div>
        )}

        {/* Buttons – show only after text is fully printed (or immediately for old messages) */}
        {content.buttons && content.buttons.length > 0 && (textComplete || !isNewMessage) && (
          <div className="mt-3 lg:mt-[15.5px] flex flex-wrap gap-2">
            {content.buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || 'outline'}
                size="sm"
                className="rounded-full px-4 py-3"
                onClick={() => {
                  if (typeof button.onClick === 'function') {
                    button.onClick()
                  }
                  if (onButtonClick) {
                    onButtonClick(button.label.toLowerCase().replace(/\s+/g, '_'), index)
                  }
                }}
              >
                <TextContent variant="buttonText" className="text-text-inverse">
                  {button.label}
                </TextContent>
              </Button>
            ))}
          </div>
        )}
      </ChatBubble>
      {!isUser && message.responseTimeMs != null && (
        <ResponseTimeDisplay responseTimeMs={message.responseTimeMs} />
      )}
      </div>
    </div>
  )
}

export default Message

