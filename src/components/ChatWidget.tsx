import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/shadCN/card'
import { ScrollArea } from '@/components/ui/shadCN/scroll-area'
import { cn } from '@/utils/utils'
import Message from '@/components/Message'
import ChatWidgetButton from '@/components/ChatWidgetButton'
import ChatInputBar from '@/components/ChatInputBar'
import ReservationFlow from '@/components/flows/ReservationFlow'
import WelcomeScreen from '@/components/WelcomeScreen'
import InactivitySuggestionNotification from '@/components/notification/InactivitySuggestionNotification'
import { ChatWidgetHeader } from '@/components/ChatWidgetHeader'
import { useChatMessages, useChatWidgetOpen, useMediaQuery, useScrollToBottom } from '@/hooks'
import { useChatConversation } from '@/hooks/useChatConversation'
import { useReservationFlow } from '@/hooks/useReservationFlow'
import type { ChatWidgetProps, ReservationStep, WidgetAction } from '@/types/chat'

export interface ChatWidgetRef {
  setIsOpen: (open: boolean) => void
  startBookingFlow: () => void
  /** Start a flow by action (e.g. from URL param action=booking). */
  startFlow: (action: WidgetAction) => void
}

const ChatWidget = forwardRef<ChatWidgetRef, ChatWidgetProps>(({ 
  placeholder = 'Type your message...',
  onSendMessage 
}, ref) => {
  const messages = useChatMessages()
  const [isOpen, setIsOpen] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [showInactivitySuggestion, setShowInactivitySuggestion] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const {
    flow,
    reservationData,
    startBookingFlow,
    handleDateSelect,
    handleTimeSelect,
    handleFormSubmit,
    handleBack,
  } = useReservationFlow({ threadId })

  const {
    inputValue,
    setInputValue,
    isLoading,
    handleSend,
    handleTagClick,
    handleKeyDown,
  } = useChatConversation({
    startBookingFlow,
    threadId,
    setThreadId,
    onSendMessage,
    onBeforeInteraction: () => setShowInactivitySuggestion(false),
  })

  const isDesktopForNotification = useMediaQuery('(min-width: 640px)')
  useChatWidgetOpen(isOpen)
  useScrollToBottom(messagesEndRef, [messages.length, flow.state, flow.step])

  // When opening the widget with existing messages, jump to the end immediately.
  useEffect(() => {
    if (!isOpen) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      })
    })
  }, [isOpen])

  useImperativeHandle(ref, () => ({
    setIsOpen,
    startBookingFlow,
    startFlow(action: WidgetAction) {
      if (action === 'booking') startBookingFlow()
    },
  }))

  useEffect(() => {
    const handler = () => setShowInactivitySuggestion(true)
    window.addEventListener('chat-widget-inactivity', handler)
    return () => window.removeEventListener('chat-widget-inactivity', handler)
  }, [])

  function handleClose() {
    setIsOpen(false)
  }

  function handleOpen() {
    setIsOpen(true)
  }

  function handleButtonClick(action: string) {
    if (action === 'book_an_appointment') {
      console.log('[ChatWidget] Appointment button clicked, fetching calendar events')
      startBookingFlow()
    }
  }

  const handleInactivityDismiss = () => setShowInactivitySuggestion(false)
  const handleInactivityAction = () => {
    setShowInactivitySuggestion(false)
    setIsOpen(true)
  }

  if (!isOpen) {
    return (
      <>
        {showInactivitySuggestion && isDesktopForNotification && (
          <InactivitySuggestionNotification
            visible
            variant="desktop"
            onDismiss={handleInactivityDismiss}
            onAction={handleInactivityAction}
          />
        )}
        <ChatWidgetButton onOpen={handleOpen} />
      </>
    )
  }

  return (
    <>
      {showInactivitySuggestion && isDesktopForNotification && (
        <InactivitySuggestionNotification
          visible
          variant="desktop"
          onDismiss={handleInactivityDismiss}
          onAction={handleInactivityAction}
        />
      )}
      <Card
        className={cn(
          'fixed z-50 flex flex-col shadow-2xl border-2 border-dark sm:border-muted',
          // Mobile: Full width overlay, ~90vh height, slides from bottom
          'bottom-0 left-0 right-0 w-full h-[90vh] max-h-[90vh]',
          'animate-in slide-in-from-bottom duration-300',
          // Desktop: Full-height popup bottom-right
          'sm:bottom-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[30rem] sm:h-screen sm:max-h-none sm:rounded-none sm:rounded-l-lg',
          // Wide desktop: Full-height right sidebar
          'min-[1500px]:right-0 min-[1500px]:bottom-0 min-[1500px]:top-0 min-[1500px]:h-screen min-[1500px]:w-[28rem] min-[1500px]:max-h-none min-[1500px]:rounded-l-lg',
        )}
      >
        <ChatWidgetHeader
          hasMessages={messages.length > 0}
          isInReservationFlow={flow.state === 'reservation_flow' && !!flow.step}
          onBack={handleBack}
          onClose={handleClose}
        />

        {/* Messages Area */}
        {flow.state === 'reservation_flow' && flow.step ? (
          <div className="flex-1 flex items-end justify-center p-3 sm:p-4 min-h-0">
            <div className="w-full max-w-full">
              <ReservationFlow
                step={flow.step as ReservationStep}
                data={reservationData}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                onFormSubmit={handleFormSubmit}
              />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen onTagClick={handleTagClick} />
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 sm:p-4 space-y-4 min-w-0 overflow-visible relative">
              {/* Gradient shadow at top of messages (sticky) */}
              <div
                className="sticky top-0 -mt-3 -mx-4 pt-0 px-4 h-6 flex-shrink-0 pointer-events-none z-10"
                style={{
                  background:
                    'linear-gradient(color-mix(in srgb, var(--color-text-muted) 50%, transparent) 0%, color-mix(in srgb, var(--color-text-muted) 20%, transparent) 35%, transparent 70%)',
                }}
              />
              {messages.map((message) => (
                <Message key={message.id} message={message} onButtonClick={handleButtonClick} />
              ))}

              {isLoading && (
                <div className="text-xs text-muted-foreground">Thinking...</div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Inactivity suggestion (mobile: in bottom panel) */}
        {showInactivitySuggestion && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <InactivitySuggestionNotification
              visible
              variant="mobile"
              onDismiss={handleInactivityDismiss}
              onAction={handleInactivityAction}
            />
          </div>
        )}

        {/* Input Area */}
        <ChatInputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
      </Card>
    </>
  )
})

ChatWidget.displayName = 'ChatWidget'

export default ChatWidget

