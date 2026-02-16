import { IconButton } from '@/components/ui/icon-button'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'
import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'
import ExpandIcon from '@/assets/icons/Expand Icon.svg'

interface ChatWidgetButtonProps {
  onOpen: () => void
}

function ChatWidgetButton({ onOpen }: ChatWidgetButtonProps) {
  return (
    <div className="fixed bottom-4 left-1 right-1 sm:left-auto sm:right-4 z-50 flex flex-row sm:flex-row items-end sm:items-center gap-3">
      {/* Main Floating Button */}
      <IconButton
        icon={H100Icon}
        aria-label="H100 AI"
        onClick={onOpen}
        className="h-14 w-14 bg-background shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-[hsl(var(--gray-50))]"
      />

      {/* Chat Bubble */}
      <div className="flex items-center gap-2 sm:gap-3 bg-background px-3 sm:px-4 py-2 sm:py-3 rounded-full shadow-lg border border-black">
        <span className="text-xs sm:text-base font-medium text-[hsl(var(--gray-800))] max-w-[200px] sm:max-w-[280px]">
          Hi, I am your personal H100 furniture consultant.
        </span>
        <IconButton
          icon={BookmarkCleanIcon}
          aria-label="Bookmark"
          className="h-8 w-8 bg-background flex-shrink-0"
        />
        <IconButton
          icon={ExpandIcon}
          aria-label="Expand chat"
          onClick={onOpen}
          className="h-8 w-8 bg-background hover:shadow-xl flex-shrink-0"
        />
      </div>
    </div>
  )
}

export default ChatWidgetButton

