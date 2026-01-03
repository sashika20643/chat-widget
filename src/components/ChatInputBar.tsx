import { Send } from 'lucide-react'
import { Input } from '@/components/ui/shadCN/input'
import { Button } from '@/components/ui/shadCN/button'
import { IconButton } from '@/components/ui/icon-button'
import { Separator } from '@/components/ui/shadCN/separator'
import GalleryIcon from '@/assets/icons/Gallery Icon.svg'
import ARIcon from '@/assets/icons/AR Icon.svg'
import CameraIcon from '@/assets/icons/Camera Icon.svg'

interface ChatInputBarProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
  onKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

function ChatInputBar({ 
  value, 
  onChange, 
  onSend, 
  placeholder = 'Type your message...',
  onKeyPress 
}: ChatInputBarProps) {
  return (
    <>
      <Separator />
      <div className="p-3 sm:p-4 flex-shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
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
          
          {/* Input Field */}
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            className="flex-1 min-w-0"
          />
          
          {/* Send Button */}
          <Button
            onClick={onSend}
            size="icon"
            variant="ghost"
            disabled={!value.trim()}
            className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0 rounded-full bg-transparent hover:bg-transparent border-2 border-[hsl(var(--tertiary))]"
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export default ChatInputBar

