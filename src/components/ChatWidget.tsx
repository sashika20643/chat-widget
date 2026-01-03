import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/shadCN/card'
import { ScrollArea } from '@/components/ui/shadCN/scroll-area'
import { Avatar, AvatarImage } from '@/components/ui/shadCN/avatar'
import { IconButton } from '@/components/ui/icon-button'
import { ArrowLeft } from 'lucide-react'
import Message from '@/components/Message'
import ChatWidgetButton from '@/components/ChatWidgetButton'
import ChatInputBar from '@/components/ChatInputBar'
import ReservationFlow from '@/components/flows/ReservationFlow'
import { detectScenario, getAvailableTimeSlots, submitReservation } from '@/services/chatApi'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'
import HelpIcon from '@/assets/icons/Help Icon.svg'
import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'
import CollapsIcon from '@/assets/icons/Collaps Icon.svg'
import type { Message as MessageType, ChatWidgetProps, ConversationFlow, ReservationData, ReservationStep } from '@/types/chat'

export interface ChatWidgetRef {
  setIsOpen: (open: boolean) => void
}

const ChatWidget = forwardRef<ChatWidgetRef, ChatWidgetProps>(({ 
  placeholder = 'Type your message...',
  onSendMessage 
}, ref) => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      role: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [flow, setFlow] = useState<ConversationFlow>({ state: 'idle' })
  const [reservationData, setReservationData] = useState<ReservationData>({})
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useImperativeHandle(ref, () => ({
    setIsOpen,
  }))

  // Auto-scroll to bottom when messages or flow changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
  }, [messages, flow.state, flow.step])

  async function handleSend() {
    if (!inputValue.trim()) return

    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const messageText = inputValue
    setInputValue('')
    setIsLoading(true)

    // Check scenario when send button is clicked
    const response = await detectScenario(messageText)
    
    const assistantMessage: MessageType = {
      id: (Date.now() + 1).toString(),
      content: response.message,
      role: 'assistant',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)

    if (onSendMessage) {
      onSendMessage(messageText)
    }
  }

  function handleKeyPress(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }


  function handleClose() {
    setIsOpen(false)
  }

  function handleOpen() {
    setIsOpen(true)
  }

  function handleButtonClick(action: string) {
    if (action === 'book_an_appointment') {
      setFlow({
        state: 'reservation_flow',
        step: 'select_date'
      })
    }
  }

  async function handleDateSelect(date: Date) {
    setReservationData(prev => ({ ...prev, selectedDate: date }))
    setFlow(prev => ({ ...prev, step: 'select_time' }))
    
    // Load available time slots and picked slots from database
    const { slots, pickedSlots } = await getAvailableTimeSlots(date)
    setReservationData(prev => ({ ...prev, availableSlots: slots, pickedSlots }))
  }

  function handleTimeSelect(time: string) {
    setReservationData(prev => ({ ...prev, selectedTime: time }))
    setFlow(prev => ({ ...prev, step: 'user_details' }))
  }

  async function handleFormSubmit(details: ReservationData['userDetails']) {
    if (!details || !reservationData.selectedDate || !reservationData.selectedTime) return

    const result = await submitReservation({
      date: reservationData.selectedDate,
      time: reservationData.selectedTime,
      userDetails: details
    })

    const confirmationMessage: MessageType = {
      id: Date.now().toString(),
      content: {
        text: result.message
      },
      role: 'assistant',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, confirmationMessage])
    setFlow({ state: 'idle' })
    setReservationData({})
  }

  function handleBack() {
    if (flow.state !== 'reservation_flow' || !flow.step) return

    const currentStep = flow.step

    if (currentStep === 'user_details') {
      // Go back to time selection
      setFlow({ 
        state: 'reservation_flow', 
        step: 'select_time' 
      })
    } else if (currentStep === 'select_time') {
      // Go back to date selection
      setReservationData((prev) => ({
        selectedDate: prev.selectedDate,
        availableSlots: undefined,
        selectedTime: undefined,
        userDetails: undefined
      }))
      setFlow({ 
        state: 'reservation_flow', 
        step: 'select_date' 
      })
    } else if (currentStep === 'select_date') {
      // Exit flow and go back to idle
      setFlow({ state: 'idle' })
      setReservationData({})
    }
  }

  if (!isOpen) {
    return <ChatWidgetButton onOpen={handleOpen} />
  }
  

  return (
    <Card className="fixed bottom-4 sm:inset-x-auto sm:right-4 sm:left-auto w-[calc(100%)] sm:w-[26rem] lg:w-[28rem] h-[calc(100vh-2rem)] sm:h-[600px] lg:h-[700px] max-h-[600px] lg:max-h-[700px] z-50 flex flex-col shadow-2xl border-2">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {flow.state === 'reservation_flow' && flow.step ? (
            <IconButton
              icon={<ArrowLeft className="h-full w-full" />}
              aria-label="Back"
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0"
              onClick={handleBack}
            />
          ) : (
            <Avatar className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0">
              <AvatarImage src={H100Icon} alt="H100 AI" />
          </Avatar>
          )}
          </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <IconButton
            icon={HelpIcon}
            aria-label="Help"
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
          <IconButton
            icon={BookmarkCleanIcon}
            aria-label="Bookmark"
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
          />
          <IconButton
            icon={CollapsIcon}
            aria-label="Collapse"
            variant="ghost"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={handleClose}
          />
        </div>
      </div>

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
      ) : (
        <ScrollArea className="flex-1 p-3 sm:p-4 min-h-0">
        <div className="space-y-4">
          {messages.map((message) => (
              <Message 
                key={message.id} 
                message={message}
                onButtonClick={handleButtonClick}
              />
          ))}

            {isLoading && (
              <div className="text-xs text-muted-foreground">Thinking...</div>
            )}
            
            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      )}

      {/* Input Area */}
      <ChatInputBar
            value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        placeholder={placeholder}
            onKeyPress={handleKeyPress}
      />
    </Card>
  )
})

ChatWidget.displayName = 'ChatWidget'

export default ChatWidget

