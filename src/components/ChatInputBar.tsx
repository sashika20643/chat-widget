import { useState } from 'react'
import { Send, Plus, X } from 'lucide-react'
import { useAutoResizeTextarea } from '@/hooks'
import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'
import { IconButton } from '@/components/ui/icon-button'
import GalleryIcon from '@/assets/icons/Gallery Icon.svg'
import ARIcon from '@/assets/icons/AR Icon.svg'
import CameraIcon from '@/assets/icons/Camera Icon.svg'

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  onKeyDown?: (event: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

function ChatInputBar({ 
  value, 
  onChange, 
  onSend, 
  placeholder = 'Type your message...',
  onKeyDown,
}: ChatInputBarProps) {
  const textareaRef = useAutoResizeTextarea(value, {
    minHeightPx: 44,
    maxHeightRatio: 0.4,
  })
  const [mobileIconsOpen, setMobileIconsOpen] = useState(false)

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
      return
    }
    onKeyDown?.(event)
  }

  return (
    <div className="p-4 lg:p-5 flex-shrink-0">
      <div className="flex items-end gap-2 lg:gap-2">
        {/* Mobile: + only; tap to show Gallery, AR, Camera. Desktop: always show three icons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {/* Mobile: + button; tap to show vertical popup with three icons */}
          <div className="relative flex lg:hidden items-center">
            <IconButton
              icon={<Plus className="h-12 w-12" />}
              aria-label="Show more options"
              size="mlarge"
              className="border border-border bg-transparent hover:bg-transparent active:bg-transparent [&_svg]:h-6 [&_svg]:w-6"
              onClick={() => setMobileIconsOpen((open) => !open)}
            />
            {mobileIconsOpen && (
              <div
                className="absolute bottom-full left-0 mb-1.5 flex flex-col rounded-md bg-background p-2 shadow-lg"
                role="dialog"
                aria-label="Attach options"
              >
                <div className="flex items-center justify-end pb-1.5 mb-1.5">
                  <IconButton
                    icon={<X className="h-5 w-5" />}
                    aria-label="Close"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <IconButton
                    icon={GalleryIcon}
                    aria-label="Gallery"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  />
                  <IconButton
                    icon={ARIcon}
                    aria-label="AR"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  />
                  <IconButton
                    icon={CameraIcon}
                    aria-label="Camera"
                    size="sm"
                    onClick={() => setMobileIconsOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
          {/* Desktop: always show three icons */}
          <div className="hidden sm:flex items-center gap-2">
            <IconButton
              icon={GalleryIcon}
              aria-label="Gallery"
              size="sm"
            />
            <IconButton
              icon={ARIcon}
              aria-label="AR"
              size="sm"
            />
            <IconButton
              icon={CameraIcon}
              aria-label="Camera"
              size="sm"
            />
          </div>
        </div>

        {/* Input box + Send: grows with content up to 40vh, then scrollable */}
        <div className="flex flex-1 min-w-0 min-h-[50px] items-end border border-[#000000] rounded-[28px] overflow-hidden px-[10.5px] items-center">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className={cn(
              'flex-1 min-w-0 min-h-[44px] resize-none overflow-y-auto border-0 bg-transparent px-3 py-2 text-base shadow-none transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 lg:text-sm',
              '[scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0'
            )}
            style={{ maxHeight: '40vh' }}
          />
          <Button
            onClick={onSend}
            size="icon"
            variant="ghost"
            disabled={!value.trim()}
            className="h-[40px] w-[40px] flex-shrink-0 rounded-full bg-transparent hover:bg-transparent border border-[#000000] p-0 flex items-center justify-center"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ChatInputBar

