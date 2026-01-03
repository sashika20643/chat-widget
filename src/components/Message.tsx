import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'
import type { Message as MessageType, MessageContent } from '@/types/chat'

interface MessageProps {
  message: MessageType
  onButtonClick?: (action: string, buttonIndex: number) => void
}

function Message({ message, onButtonClick }: MessageProps) {
  function formatTime(date: Date) {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const isUser = message.role === 'user'
  const content: MessageContent = typeof message.content === 'string' 
    ? { text: message.content }
    : message.content

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] sm:max-w-[75%] rounded-lg px-3 py-2 sm:px-4 min-w-0 bg-background border border-[hsl(var(--tertiary))]'
        )}
      >
        {/* Text Content */}
        {content.text && (
          <p className="text-xs sm:text-sm whitespace-pre-wrap break-words text-foreground">
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

        {/* Buttons */}
        {content.buttons && content.buttons.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {content.buttons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant || 'outline'}
                size="sm"
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

        {/* Timestamp */}
        <span className="text-xs mt-2 block text-muted-foreground">
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

export default Message

