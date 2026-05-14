import type { ScenarioResponse, MessageContent, SubscribeSubAction } from '@/types/chat'
import {
  createInitialMobelaboWizardState,
  createInitialSearchServiceWizardState,
} from '@/types/chat'

const CHAT_API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAT_API_BASE_URL) ||
  'https://getagent-chat-agent.ceilu9.easypanel.host'

const CHAT_STREAM_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_CHAT_STREAM_API_URL) ||
  'https://getagent-chat-agent.ceilu9.easypanel.host/api/chat/stream'

/** Assistant copy for newsletter signup; replaces API response text when action is newsletter. */
export const NEWSLETTER_ASSISTANT_MESSAGE = `You can join our newsletter below to
receive a 10% welcome bonus and
stay updated on our latest vintage
arrivals.
Claim 10% welcome bonus now: `

function messageIncludesSubscribeKeyword(message: string): boolean {
  return message.toLowerCase().includes('subscribe')
}

function messageIncludesGeneralChoiceKeyword(message: string): boolean {
  return message.toLowerCase().includes('general choice')
}

export interface AppointmentData {
  appointment_id: string
  date: string
  time: string
}

export interface ChatRequest {
  user_id: string
  message: string
  /** Optional image URLs provided by the client */
  images?: string[]
  thread_id?: string
  message_type?: 'user' | 'system'
  appointment_data?: AppointmentData | null
}

export interface ChatResponse {
  thread_id: string
  message: string
  action: string
  product_ids?: string[]
  /** Present when action is subscribe; which subscription flow to open */
  subscription_type?: string
  sub_action?: string
  is_on_topic?: boolean
  language?: string
  customer?: { name: string; tier: string }
}

export interface TriggerResponse {
  message: string
}

/** POST /api/chat – send message and get assistant response. */
export async function sendChatMessage(
  userId: string,
  message: string,
  threadId?: string | null,
  images?: string[]
): Promise<ChatResponse> {
  if (messageIncludesSubscribeKeyword(message)) {
    return {
      thread_id: threadId ?? '',
      message: NEWSLETTER_ASSISTANT_MESSAGE,
      action: 'newsletter',
    }
  }

  if (messageIncludesGeneralChoiceKeyword(message)) {
    return {
      thread_id: threadId ?? '',
      message: '',
      action: 'general_choice',
    }
  }

  const body: ChatRequest = {
    user_id: userId,
    message,
    ...(images && images.length ? { images } : {}),
    message_type: 'user',
  }
  if (threadId) body.thread_id = threadId

  const res = await fetch(`${CHAT_API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
  return res.json()
}

/** Metadata on stream `complete` event (and mock paths). */
export interface ChatStreamCompleteMetadata {
  thread_id?: string
  action?: string
  product_ids?: string[]
  /** Subscription sub-type when action is subscribe */
  subscription_type?: string
  sub_action?: string
}

export interface ChatStreamCallbacks {
  onChunk: (text: string) => void
  onConnected?: (threadId: string) => void
  /** Called when the backend sends a transient status update, e.g. \"Searching products...\" */
  onStatus?: (statusMessage: string) => void
  onDone?: (metadata?: ChatStreamCompleteMetadata) => void
  onError?: (err: Error) => void
}

/** POST /api/chat/stream – send message and stream assistant response via SSE. */
export async function sendChatMessageStream(
  userId: string,
  message: string,
  callbacks: ChatStreamCallbacks,
  threadId?: string | null,
  images?: string[]
): Promise<void> {
  if (messageIncludesSubscribeKeyword(message)) {
    if (threadId) {
      callbacks.onConnected?.(threadId)
    }
    callbacks.onChunk(NEWSLETTER_ASSISTANT_MESSAGE)
    callbacks.onDone?.({
      thread_id: threadId ?? undefined,
      action: 'newsletter',
    })
    return
  }

  if (messageIncludesGeneralChoiceKeyword(message)) {
    if (threadId) {
      callbacks.onConnected?.(threadId)
    }
    callbacks.onChunk('')
    callbacks.onDone?.({
      thread_id: threadId ?? undefined,
      action: 'general_choice',
    })
    return
  }

  const body: {
    user_id: string
    message: string
    images?: string[]
    thread_id?: string | null
  } = {
    user_id: userId,
    message,
  }
  if (images && images.length) body.images = images
  if (threadId) body.thread_id = threadId

  const res = await fetch(CHAT_STREAM_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = new Error(`Chat stream API error: ${res.status}`)
    callbacks.onError?.(err)
    throw err
  }

  const reader = res.body?.getReader()
  if (!reader) {
    callbacks.onError?.(new Error('No response body'))
    return
  }

  const decoder = new TextDecoder()
  let buffer = ''
  let hasComplete = false

  const parseLine = (raw: string) => {
    const data = raw.startsWith('data: ') ? raw.slice(6).trim() : raw.trim()
    if (!data || data === '[DONE]') return
    try {
      const parsed = JSON.parse(data) as { event?: string; data?: Record<string, unknown> }
      const ev = parsed.event
      const payload = parsed.data
      if (ev === 'connected' && payload?.thread_id) {
        callbacks.onConnected?.(String(payload.thread_id))
      } else if (ev === 'status' && payload?.message) {
        callbacks.onStatus?.(String(payload.message))
      } else if ((ev === 'message' || ev === 'token') && payload?.text) {
        callbacks.onChunk(String(payload.text))
      } else if (ev === 'complete' && payload) {
        hasComplete = true
        const p = payload as Record<string, unknown>
        const subscriptionRaw =
          (typeof p.subscription_type === 'string' && p.subscription_type.trim()) ||
          (typeof p.subscriptionType === 'string' && p.subscriptionType.trim()) ||
          (typeof p.sub_action === 'string' && p.sub_action.trim()) ||
          (typeof p.subAction === 'string' && p.subAction.trim()) ||
          (typeof p.subscribe_sub_action === 'string' && p.subscribe_sub_action.trim()) ||
          (typeof p.subscribeSubAction === 'string' && p.subscribeSubAction.trim()) ||
          undefined
        callbacks.onDone?.({
          thread_id: payload.thread_id as string | undefined,
          action: payload.action as string | undefined,
          product_ids: payload.product_ids as string[] | undefined,
          subscription_type: subscriptionRaw,
        })
      }
    } catch {
      if (data) callbacks.onChunk(data)
    }
  }

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''

      for (const line of lines) {
        parseLine(line)
      }
    }
    if (buffer.trim()) parseLine(buffer)
    if (!hasComplete) callbacks.onDone?.({})
  } catch (err) {
    callbacks.onError?.(err instanceof Error ? err : new Error(String(err)))
    throw err
  }
}

/** POST /api/chat – send system message with appointment summary (e.g. after booking). */
export async function sendAppointmentConfirmation(
  userId: string,
  threadId: string | null | undefined,
  appointmentData: AppointmentData
): Promise<ChatResponse> {
  const body: ChatRequest = {
    user_id: userId,
    message: 'Appointment confirmed',
    message_type: 'system',
    appointment_data: appointmentData,
  }
  if (threadId) body.thread_id = threadId

  const res = await fetch(`${CHAT_API_BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`Chat API error: ${res.status}`)
  return res.json()
}

/** POST /api/trigger – fire a named trigger (e.g. on inactivity) and get a suggested message. */
export async function triggerWebFormPause(language: string = 'english'): Promise<TriggerResponse> {
  const res = await fetch(`${CHAT_API_BASE_URL}/api/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      trigger_name: 'cart_pause',
      language,
    }),
  })
  if (!res.ok) throw new Error(`Trigger API error: ${res.status}`)
  return res.json()
}

function isNewsletterActionValue(action: string | undefined): boolean {
  if (!action) return false
  const n = action.toString().toLowerCase().replace(/-/g, '_').trim()
  return n === 'newsletter' || n === 'news_letter' || n.includes('newsletter')
}

function isGeneralChoiceActionValue(action: string | undefined): boolean {
  if (!action) return false
  const n = action.toString().toLowerCase().replace(/-/g, '_').trim()
  return n === 'general_choice' || n.includes('general_choice')
}

function normalizeActionValue(action: string | undefined): string {
  return action?.toString().toLowerCase().replace(/-/g, '_').trim() ?? ''
}

/** Parse subscription sub-action string from API (e.g. NEWSLETTER, moebelabo). */
export function parseSubscribeSubAction(raw: string | undefined): SubscribeSubAction | null {
  if (!raw) return null
  const n = raw.toLowerCase().replace(/-/g, '_').trim()
  if (n === 'newsletter' || n === 'news_letter') return 'newsletter'
  if (n === 'moebelabo' || n === 'mobelabo' || n === 'moebel_abo') return 'moebelabo'
  if (n === 'search_service' || n === 'searchservice') return 'search_service'
  if (n === 'all') return 'all'
  return null
}

function applySubscribeScenarioToContent(content: MessageContent, sub: SubscribeSubAction | null) {
  if (!sub) return
  if (sub === 'newsletter') {
    content.newsletterSignup = true
  } else if (sub === 'moebelabo') {
    content.mobelaboWizard = createInitialMobelaboWizardState()
  } else if (sub === 'search_service') {
    content.searchServiceWizard = createInitialSearchServiceWizardState()
  } else if (sub === 'all') {
    content.generalChoiceMenu = true
  }
}

/** Map ChatResponse to MessageContent for the UI. */
export function chatResponseToMessageContent(res: ChatResponse): MessageContent {
  const content: MessageContent = { text: res.message || '' }
  if (res.product_ids && res.product_ids.length > 0) {
    content.productIds = res.product_ids
  }
  const actionNorm = normalizeActionValue(res.action)
  if (actionNorm === 'subscribe') {
    const subRaw = res.subscription_type ?? res.sub_action
    const sub = parseSubscribeSubAction(subRaw)
    applySubscribeScenarioToContent(content, sub)
    if (sub === 'newsletter') {
      content.text = NEWSLETTER_ASSISTANT_MESSAGE
    }
  } else {
    if (isNewsletterActionValue(res.action)) {
      content.newsletterSignup = true
      content.text = NEWSLETTER_ASSISTANT_MESSAGE
    }
    if (isGeneralChoiceActionValue(res.action)) {
      content.generalChoiceMenu = true
    }
  }
  return content
}

export async function detectScenario(message: string): Promise<ScenarioResponse> {
  // Dummy API call - replace with actual API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerMessage = message.toLowerCase()

      if (lowerMessage.includes('general choice')) {
        resolve({
          scenario: null,
          message: { text: '', generalChoiceMenu: true },
        })
        return
      }

      // Check for reservation keywords
      if (lowerMessage.includes('sofa') || 
          lowerMessage.includes('showroom') || 
          lowerMessage.includes('reserve') || 
          lowerMessage.includes('appointment') ||
          lowerMessage.includes('book') ||
          lowerMessage.includes('timeslot')) {
        
        resolve({
          scenario: 'reservation',
          message: {
            text: "The sofa is currently on display in our showroom in the city center. Should I reserve it for you so you can take a look at it this week with no obligation?",
            buttons: [{
              label: "Book an appointment",
              onClick: () => {},
              variant: 'black'
            }]
          }
        })
      } else if (lowerMessage.includes('furniture') && lowerMessage.includes('scan')) {
        // Furniture scanning
        resolve({
          scenario: null,
          message: {
            text: "I can help you with furniture scanning! You can use our AR feature to scan and visualize furniture in your space. Would you like to try it?"
          }
        })
      } else if (lowerMessage.includes('about') && lowerMessage.includes('h100')) {
        // About H100
        resolve({
          scenario: null,
          message: {
            text: "H100 is a premium furniture brand offering high-quality, stylish furniture pieces. We specialize in creating beautiful, functional spaces with our curated collection of furniture. How can I help you learn more?"
          }
        })
      } else if (
        lowerMessage.includes('product') ||
        lowerMessage.includes('price') ||
        lowerMessage.includes('inquiry')
      ) {
        // Product inquiry – text + product IDs; client will fetch objects and show grid
        resolve({
          scenario: null,
          message: {
            text: "Here are some products that might interest you:",
            productIds: [
              '06477bff-145a-4bb2-a926-21b59864ce28',
              '7cf982ef-13d0-401e-9752-937078efb97f',
              '5521da0e-8d07-42f1-83af-6e49c38cb168',
              '346ee1b7-eb88-442b-9db5-4a97f71c80aa',
            ],
          },
        })
      } else if (lowerMessage.includes('similar')) {
        // Similar designer objects – text + product image cards grid with hyperlinks
        resolve({
          scenario: null,
          message: {
            text: "Okay super, Yannic ist informiert er wird gleich bei dir sein :). in der zwischenzeit habe ich dir noch ein paar ähnliche Designer Objekte:",
            productCards: [
              { src: "https://www.bogen33.ch/photo/data/beistelltisch-caruelle-nussbaum-vintage-georges-u-caruelle-embru-lounge-tisch-tisch-526-110659-2.jpg?ts=1765812414", alt: "Beistelltisch Caruelle", href: "https://www.bogen33.ch/", title: "Beistelltisch Caruelle Nussbaum" },
              { src: "https://www.bogen33.ch/photo/data/beistelltisch-caruelle-nussbaum-vintage-georges-u-caruelle-embru-lounge-tisch-tisch-382-110657-2.jpg?ts=1765812414", alt: "Caruelle Tisch Ansicht 2", href: "https://www.bogen33.ch/", title: "Caruelle Tisch" },
              { src: "https://www.bogen33.ch/photo/data/beistelltisch-caruelle-nussbaum-vintage-georges-u-caruelle-embru-lounge-tisch-tisch-665-110662-2.jpg?ts=1765812414", alt: "Caruelle Tisch Ansicht 3", href: "https://www.bogen33.ch/", title: "Caruelle Tisch" },
              { src: "https://www.bogen33.ch/photo/data/beistelltisch-caruelle-nussbaum-vintage-georges-u-caruelle-embru-lounge-tisch-tisch-798-110666-2.jpg?ts=1765812414", alt: "Caruelle Tisch Ansicht 4", href: "https://www.bogen33.ch/", title: "Caruelle Tisch" },
              { src: "https://placehold.co/200x200/eee/333?text=Designer+1", alt: "Designer Objekt", href: "https://www.bogen33.ch/", title: "Designer Objekt" },
              { src: "https://placehold.co/200x200/eee/333?text=Designer+2", alt: "Designer Objekt", href: "https://www.bogen33.ch/", title: "Designer Objekt" },
            ]
          }
        })
      } else {
        // Default response
        resolve({
          scenario: null,
          message: {
            text: "I'm here to help! How can I assist you today?"
          }
        })
      }
    }, 500) // Simulate API delay
  })
}

export async function getAvailableTimeSlots(_date: Date): Promise<{
  slots: string[]
  pickedSlots: string[]
}> {
  // Dummy API - replace with actual API
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSlots = [
        '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
      ]
      
      // Randomly mark some slots as picked (from database)
      const shuffled = [...allSlots].sort(() => Math.random() - 0.5)
      const pickedCount = Math.floor(allSlots.length * (0.2 + Math.random() * 0.1))
      const pickedSlots = shuffled.slice(0, pickedCount)
      
      resolve({
        slots: allSlots,
        pickedSlots
      })
    }, 300)
  })
}

export async function submitReservation(_data: {
  date: Date
  time: string
  userDetails: {
    firstName: string
    lastName: string
    email: string
    phone: string
    message?: string
  }
}): Promise<{ success: boolean; message: string }> {
  // Dummy API - replace with actual API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Your appointment has been booked successfully! We'll send you a confirmation email shortly."
      })
    }, 500)
  })
}

