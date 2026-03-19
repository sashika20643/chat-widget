import { Avatar, AvatarImage } from '@/components/ui/shadCN/avatar'
import { IconButton } from '@/components/ui/icon-button'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'
import HelpIcon from '@/assets/icons/Help Icon.svg'
import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'
import CollapsIcon from '@/assets/icons/Collaps Icon.svg'

interface ChatWidgetHeaderProps {
  hasMessages: boolean
  isInReservationFlow: boolean
  onBack: () => void
  onClose: () => void
}

export function ChatWidgetHeader({
  hasMessages,
  isInReservationFlow,
  onBack,
  onClose,
}: ChatWidgetHeaderProps) {
  return (
    <div className="flex items-center justify-between py-3.5 px-3.5 lg:p-4 flex-shrink-0">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {isInReservationFlow ? (
          <IconButton
            icon={CollapsIcon}
            aria-label="Back"
            variant="header"
            size="default"
            className="flex-shrink-0 [&>img]:rotate-90"
            onClick={onBack}
          />
        ) : hasMessages ? (
          <Avatar className="h-37 w-37 lg:h-44 lg:w-44 flex-shrink-0">
            <AvatarImage src={H100Icon} alt="H100 AI" />
          </Avatar>
        ) : null}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <IconButton
          icon={HelpIcon}
          aria-label="Help"
          variant="header"
          size="default"
        />
        {/* <IconButton
          icon={BookmarkCleanIcon}
          aria-label="Bookmark"
          variant="header"
          size="default"
        /> */}
        <IconButton
          icon={CollapsIcon}
          aria-label="Collapse"
          variant="header"
          size="default"
          onClick={onClose}
        />
      </div>
    </div>
  )
}

