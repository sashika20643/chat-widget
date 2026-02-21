import { Button } from '@/components/ui/shadCN/button'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { ProductGrid } from '@/components/ProductGrid'
import { cn } from '@/utils/utils'
import type { Message as MessageType, MessageContent } from '@/types/chat'

interface MessageProps {
  message: MessageType
  onButtonClick?: (action: string, buttonIndex: number) => void
}

function Message({ message, onButtonClick }: MessageProps) {
  const isUser = message.role === 'user'
  const content: MessageContent = typeof message.content === 'string' 
    ? { text: message.content }
    : message.content

  return (
    <div
      className={cn(
        'flex gap-3 w-full min-w-0',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <ChatBubble
        variant={isUser ? 'user' : 'assistant'}
        className="min-w-[80px] sm:min-w-[100px] max-w-[80%] sm:max-w-[80%] w-fit"
      >
        {/* Text Content */}
        {content.text && (
          <p className="text-sm sm:text-base whitespace-pre-wrap break-words overflow-wrap-anywhere word-break-break-word leading-7">
            {content.text}
          </p>
        )}

        {/* Images */}
        {content.images && content.images.length > 0 && (
          <div className="mt-2 space-y-2">
            {content.images.map((image, index) => (
              <img
                key={index}
                src={image.src}
                alt={image.alt || `Image ${index + 1}`}
                className="rounded-md max-w-full h-auto"
              />
            ))}
          </div>
        )}

        {/* Product grid from object IDs (fetch objects API, show skeleton then grid) */}
        {content.productIds && content.productIds.length > 0 && (
          <ProductGrid productIds={content.productIds} />
        )}

        {/* Product cards: small grid with hyperlinks */}
        {content.productCards && content.productCards.length > 0 && (
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2">
            {content.productCards.map((card, index) => (
              <a
                key={index}
                href={card.href}
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

        {/* Buttons */}
        {content.buttons && content.buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {content.buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || 'outline'}
                size="sm"
                className="rounded-full px-4"
                onClick={() => {
                  button.onClick()
                  if (onButtonClick) {
                    onButtonClick(button.label.toLowerCase().replace(/\s+/g, '_'), index)
                  }
                }}
              >
                {button.label}
              </Button>
            ))}
          </div>
        )}
      </ChatBubble>
    </div>
  )
}

export default Message

