import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/shadCN/card'
import { ScrollArea } from '@/components/ui/shadCN/scroll-area'
import { Avatar, AvatarImage } from '@/components/ui/shadCN/avatar'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/utils/utils'
import Message from '@/components/Message'
import ChatWidgetButton from '@/components/ChatWidgetButton'
import ChatInputBar from '@/components/ChatInputBar'
import ReservationFlow from '@/components/flows/ReservationFlow'
import WelcomeScreen from '@/components/WelcomeScreen'
import { detectScenario, getAvailableTimeSlots, submitReservation } from '@/services/chatApi'
import { createCalendarEvent } from '@/services/calendarApi'
import { useAppDispatch } from '@/store/hooks'
import { fetchCalendarEventsAsync } from '@/store/slices/calendarEventsSlice'
import H100Icon from '@/assets/icons/H100 AI ICON.svg'
import HelpIcon from '@/assets/icons/Help Icon.svg'
import BookmarkCleanIcon from '@/assets/icons/Bookmark Clean Icon.svg'
import CollapsIcon from '@/assets/icons/Collaps Icon.svg'
import type { Message as MessageType, ChatWidgetProps, ConversationFlow, ReservationData, ReservationStep } from '@/types/chat'

export interface ChatWidgetRef {
  setIsOpen: (open: boolean) => void
  startBookingFlow: () => void
}

const ChatWidget = forwardRef<ChatWidgetRef, ChatWidgetProps>(({ 
  placeholder = 'Type your message...',
  onSendMessage 
}, ref) => {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [flow, setFlow] = useState<ConversationFlow>({ state: 'idle' })
  const [reservationData, setReservationData] = useState<ReservationData>({})
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dispatch = useAppDispatch()

  useImperativeHandle(ref, () => ({
    setIsOpen,
    startBookingFlow,
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

  function startBookingFlow() {
    console.log('[ChatWidget] Starting booking flow')
      
      const today = new Date()
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59)
      
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()
      
      console.log('[ChatWidget] Date range:', { startDate: startDateISO, endDate: endDateISO })
      
      dispatch(fetchCalendarEventsAsync({ startDate: startDateISO, endDate: endDateISO }))
      
      setFlow({
        state: 'reservation_flow',
        step: 'select_date'
      })
  }

  function handleButtonClick(action: string) {
    if (action === 'book_an_appointment') {
      console.log('[ChatWidget] Appointment button clicked, fetching calendar events')
      startBookingFlow()
    }
  }

  async function handleTagClick(tag: string) {
    // Handle special tag actions
    if (tag.toLowerCase().includes('book') || tag.toLowerCase().includes('timeslot')) {
      // Trigger booking flow
      startBookingFlow()
      return
    }

    // For other tags, send as a message
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: tag,
      role: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    // Check scenario when tag is clicked
    const response = await detectScenario(tag)
    
    const assistantMessage: MessageType = {
      id: (Date.now() + 1).toString(),
      content: response.message,
      role: 'assistant',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, assistantMessage])
    setIsLoading(false)

    if (onSendMessage) {
      onSendMessage(tag)
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

    try {
      // Convert selected date and UTC time to ISO format for calendar event
      // selectedTime is stored in UTC format (HH:mm)
      const selectedDate = reservationData.selectedDate
      const [utcHours, utcMinutes] = reservationData.selectedTime.split(':').map(Number)
      
      // Get date components from selectedDate
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      
      // Create start time in UTC ISO format
      const startTimeISO = `${year}-${month}-${day}T${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}:00+00:00`
      
      // Create end time (1 hour after start time)
      const endDate = new Date(`${year}-${month}-${day}T${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}:00Z`)
      endDate.setUTCHours(endDate.getUTCHours() + 1)
      
      const endYear = endDate.getUTCFullYear()
      const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0')
      const endDay = String(endDate.getUTCDate()).padStart(2, '0')
      const endHours = String(endDate.getUTCHours()).padStart(2, '0')
      const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0')
      const endTimeISO = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00+00:00`

      console.log('[ChatWidget] Creating calendar event:', {
        start_time: startTimeISO,
        end_time: endTimeISO,
        attendee: details.email
      })

      // Create calendar event
      const fullName = `${details.firstName} ${details.lastName}`
      await createCalendarEvent({
        subject: `Appointment with ${fullName}-test`,
        content: `Appointment booking for ${fullName}-test${details.message ? `\n\nMessage: ${details.message}` : ''}`,
        start_time: startTimeISO,
        end_time: endTimeISO,
        location: 'Showroom',
        attendees: [
          {
            email: details.email,
            name: fullName,
            type: 'required' as const
          }
        ],
        is_online_meeting: false,
        is_reminder_on: true,
        reminder_minutes_before_start: 15
      })

      console.log('[ChatWidget] Calendar event created successfully')
    } catch (error) {
      console.error('[ChatWidget] Error creating calendar event:', error)
      // Continue with reservation submission even if calendar event creation fails
    }

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
    <Card className={cn(
      "fixed z-50 flex flex-col shadow-2xl border-2 border-black sm:border-2 sm:border-muted",
      // Mobile (<640px): Full width overlay, slides from bottom
      "bottom-0 left-0 right-0 w-full h-[calc(100vh-2rem)] max-h-[calc(100vh-2rem)]",
      "animate-in slide-in-from-bottom duration-300",
      // sm (≥640px): Fixed position bottom-right corner
      "sm:bottom-4 sm:left-auto sm:right-4 sm:w-[30rem] sm:h-[800px] sm:max-h-[85%] sm:rounded-lg"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b flex-shrink-0">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {flow.state === 'reservation_flow' && flow.step ? (
            <IconButton
              icon={CollapsIcon}
              aria-label="Back"
              variant="ghost"
              size="icon"
              className="h-7 w-7 sm:h-8 sm:w-8 flex-shrink-0 [&>img]:rotate-90"
              onClick={handleBack}
            />
          ) : messages.length > 0 ? (
            <Avatar className="h-7 w-7 sm:h-9 sm:w-9 flex-shrink-0">
              <AvatarImage src={H100Icon} alt="H100 AI" />
          </Avatar>
          ) : null}
          </div>
        <div className="flex items-center gap-2 flex-shrink-0">
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
      ) : messages.length === 0 ? (
        <WelcomeScreen onTagClick={handleTagClick} />
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-3 sm:p-4 space-y-4 min-w-0 overflow-visible">
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

