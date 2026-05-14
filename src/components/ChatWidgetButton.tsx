import { IconButton } from '@/components/ui/icon-button'
import { TextContent } from '@/components/TextContent'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'
// import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'
import ExpandIcon from '@/assets/icons/Expand Icon.svg'

interface ChatWidgetButtonProps {
  onOpen: () => void
}

function ChatWidgetButton({ onOpen }: ChatWidgetButtonProps) {
  return (
    <div className="fixed bottom-6 left-4 right-4 lg:left-auto lg:right-6 z-50 flex flex-row lg:flex-row items-center lg:items-center justify-center lg:justify-end gap-3">
      {/* Main Floating Button */}
      <IconButton
        icon={H100Icon}
        aria-label="H100 AI"
        size="xl"
        onClick={onOpen}
        className="shadow-none hover:shadow-none bg-transparent hover:bg-transparent transition-none"
      />

      {/* Chat Bubble */}
      <div className="flex items-center gap-1 lg:gap-3 bg-background pl-4 pr-3 lg:pl-6 lg:pr-4 py-2 lg:py-3 rounded-full shadow-lg border border-icon border-border">
          <TextContent variant="textMedium" className="text-text-primary max-w-[200px] lg:max-w-[280px] ">
          
          Hi, I am your personal H100 furniture consultant.
          </TextContent>
        {/* <IconButton
          icon={BookmarkCleanIcon}
          aria-label="Bookmark"
          size="bubble"
          className="bg-background flex-shrink-0"
        /> */}
        <IconButton
          icon={ExpandIcon}
          aria-label="Expand chat"
          size="bubble"
          onClick={onOpen}
          className="bg-background hover:shadow-xl flex-shrink-0"
        />
      </div>
    </div>
  )
}

export default ChatWidgetButton

