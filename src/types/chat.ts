export interface MessageButton {
  label: string
  onClick: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'black'
}

export interface MessageImage {
  src: string
  alt?: string
}

export interface MessageProductCard {
  src: string
  alt?: string
  href: string
  title?: string
}

export interface MessageContent {
  text?: string
  images?: MessageImage[]
  /** Product image cards in a grid (image + hyperlink) */
  productCards?: MessageProductCard[]
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
    firstName: string
    lastName: string
    email: string
    phone: string
    message?: string
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

/** URL param `action` values that trigger different widget flows */
export type WidgetAction = 'booking' | 'chat'

export interface ChatWidgetProps {
  title?: string
  placeholder?: string
  onSendMessage?: (message: string) => void
}

