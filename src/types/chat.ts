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

export interface MessageProductDetail {
  objectId: string
  name: string
  price?: string | null
  displayedPrice?: string | null
  measurements?: string | null
  description?: string | null
  images: MessageImage[]
  productUrl?: string | null
}

/** MÖBELABO wizard steps (in-chat bubble). */
export type MobelaboStep = 'intro' | 'categories' | 'info' | 'confirmation'

export interface MobelaboWizardState {
  step: MobelaboStep
  selectedCategories: string[]
  lastName: string
  firstName: string
  email: string
  /** Set when the wizard is opened from chat; used to remove the paired user line on dismiss. */
  pairedUserMessageId?: string
}

export function createInitialMobelaboWizardState(): MobelaboWizardState {
  return {
    step: 'intro',
    selectedCategories: [],
    lastName: '',
    firstName: '',
    email: '',
  }
}

/** Search Service wizard (in-chat bubble). */
export type SearchServiceStep = 'intro' | 'details' | 'info' | 'confirmation'

export interface SearchServiceWizardState {
  step: SearchServiceStep
  designer: string
  manufacturer: string
  model: string
  price: string
  customerComment: string
  lastName: string
  firstName: string
  email: string
  pairedUserMessageId?: string
}

export function createInitialSearchServiceWizardState(): SearchServiceWizardState {
  return {
    step: 'intro',
    designer: '',
    manufacturer: '',
    model: '',
    price: '',
    customerComment: '',
    lastName: '',
    firstName: '',
    email: '',
  }
}

/** In-chat registration form (keyword "register"; POSTs to IMAGE_BASE_URL/api/auth/create-user). */
export interface AuthRegisterWizardState {
  email: string
  firstName: string
  /** Family / full name as requested by product (field label "Name"). */
  name: string
  zip: string
  /** Last create-user API error; cleared when the user edits any field. */
  submitError?: string
}

export function createInitialAuthRegisterWizardState(): AuthRegisterWizardState {
  return {
    email: '',
    firstName: '',
    name: '',
    zip: '',
  }
}

/** Magic-link login (keyword "login"); POSTs send-magic-link with email + hardcoded display name. */
export interface AuthLoginWizardState {
  email: string
  submitError?: string
}

export function createInitialAuthLoginWizardState(): AuthLoginWizardState {
  return { email: '' }
}

export interface MessageProductDetailSourceContent {
  text?: string
  images?: MessageImage[]
  productCards?: MessageProductCard[]
  productIds?: string[]
  buttons?: MessageButton[]
  newsletterSignup?: boolean
  generalChoiceMenu?: boolean
}

export type GeneralChoiceOption =
  | 'newsletter'
  | 'mobelabo'
  | 'search_service'
  | 'furniture_consultation'

/**
 * Subscription sub-action from the chat API when `action === "subscribe"`.
 * Backend may send snake_case strings; client normalizes to these values.
 */
export type SubscribeSubAction = 'newsletter' | 'moebelabo' | 'search_service' | 'all'

export interface MessageContent {
  text?: string
  images?: MessageImage[]
  /** Product image cards in a grid (image + hyperlink) */
  productCards?: MessageProductCard[]
  /** Product object FCA IDs – fetch details from objects API and show grid */
  productIds?: string[]
  /** Expanded product detail card rendered as a dedicated bubble */
  productDetail?: MessageProductDetail
  /**
   * Original content captured when a product card transforms the message.
   * On reload, we can show this again (default view).
   */
  productDetailSource?: MessageProductDetailSourceContent
  buttons?: MessageButton[]
  /** Show newsletter email form inside this assistant bubble (below streamed text). */
  newsletterSignup?: boolean
  /** General Choice assistant menu (four pill actions). */
  generalChoiceMenu?: boolean
  /** MÖBELABO wizard inside this assistant bubble. */
  mobelaboWizard?: MobelaboWizardState
  /** Search Service wizard inside this assistant bubble. */
  searchServiceWizard?: SearchServiceWizardState
  /** Auth registration form (keyword "register"). */
  authRegisterWizard?: AuthRegisterWizardState
  /** Auth magic-link login (keyword "login"); API sends fixed display name. */
  authLoginWizard?: AuthLoginWizardState
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
  /** If user comes from a product detail ("Besichtigen"), prefill the contact message with this product id */
  bookingProductId?: string
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

