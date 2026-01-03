export interface MessageButton {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'black'
}

export interface MessageImage {
  src: string
  alt?: string
}

export interface MessageContent {
  text?: string
  images?: MessageImage[]
  buttons?: MessageButton[]
}

export interface Message {
  id: string
  content: string | MessageContent
  role: 'user' | 'assistant'
  timestamp: Date
}

export type ConversationState = 
  | 'idle'
  | 'waiting_response'
  | 'reservation_flow'

export type ReservationStep = 
  | 'select_date'
  | 'select_time'
  | 'user_details'
  | 'confirmation'

export interface ReservationData {
  selectedDate?: Date
  selectedTime?: string
  availableSlots?: string[]
  pickedSlots?: string[]
  userDetails?: {
    name: string
    email: string
    phone: string
  }
}

export interface ConversationFlow {
  state: ConversationState
  step?: ReservationStep
  data?: ReservationData
}

export interface ScenarioResponse {
  scenario: 'reservation' | 'price_inquiry' | 'general' | null
  message: MessageContent
  flow?: ConversationFlow
}

export interface ChatWidgetProps {
  title?: string
  placeholder?: string
  onSendMessage?: (message: string) => void
}

