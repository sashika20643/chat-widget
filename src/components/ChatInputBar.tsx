import { useRef, useEffect } from 'react'
import { Send } from 'lucide-react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function adjustHeight() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = '0'
    el.style.height = `${Math.min(el.scrollHeight, window.innerHeight * 0.4)}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [value])

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      onSend()
      return
    }
    onKeyDown?.(event)
  }

  return (
    <div className="p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-end gap-1.5 sm:gap-2">
          {/* Icon Buttons */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <IconButton
              icon={GalleryIcon}
              aria-label="Gallery"
              size="sm"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <IconButton
              icon={ARIcon}
              aria-label="AR"
              size="sm"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
            <IconButton
              icon={CameraIcon}
              aria-label="Camera"
              size="sm"
              className="h-8 w-8 sm:h-10 sm:w-10"
            />
          </div>
          
          {/* Textarea with Send Button */}
          <div className="relative flex-1 min-w-0 flex flex-col">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              className={cn(
                'w-full min-h-[2.25rem] max-h-[40vh] resize-none overflow-y-auto rounded-md border-0 bg-transparent px-3 py-2 pr-10 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-black disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0'
              )}
            />
            <Button
              onClick={onSend}
              size="icon"
              variant="ghost"
              disabled={!value.trim()}
              className="absolute right-1 bottom-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0 rounded-full bg-transparent hover:bg-transparent border border-black p-3"
            >
              <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
  )
}

export default ChatInputBar

