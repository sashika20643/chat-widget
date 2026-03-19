export interface MessageButton {
  label: string
  onClick?: () => void
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive' | 'black'
}

export interface MessageImage {
  src: string
  alt?: string
}

export interface MessageProductCard {
  src: string
  alt?: string
  /** Link URL – use product_url from payload when present */
  href?: string
  product_url?: string
  title?: string
}

export interface MessageContent {
  text?: string
  images?: MessageImage[]
  /** Product image cards in a grid (image + hyperlink) */
  productCards?: MessageProductCard[]
  /** Product object FCA IDs – fetch details from objects API and show grid */
  productIds?: string[]
  buttons?: MessageButton[]
}

export interface Message {
  id: string
  content: string | MessageContent
  role: 'user' | 'assistant'
  /** ISO timestamp (serializable for Redux) */
  timestamp: string
  /** Total response time in ms (assistant messages only, for debugging – remove later) */
  responseTimeMs?: number
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

