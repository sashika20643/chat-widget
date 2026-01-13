import { config } from '@/config'
import type { GroupedEvents } from '@/store/slices/calendarEventsSlice'

interface CalendarApiResponse {
  total: number
  start_date: string
  end_date: string
  grouped_events: GroupedEvents
}

function getApiUrl(): string {
  // Priority 1: Check for custom API URL from window object (for embed configuration)
  if (typeof window !== 'undefined') {
    const customApiUrl = (window as typeof window & { chatbotApiUrl?: string }).chatbotApiUrl
    if (customApiUrl) {
      console.log('[Calendar API] Using custom API URL from window:', customApiUrl)
      return customApiUrl
    }
  }
  
  // Priority 2: In development (Vite dev server only), use proxy path to avoid CORS
  // Only use proxy if we're actually running in Vite dev mode (not in embed build)
  // Check if we're running in development mode AND have the Vite dev server
  const isDev = import.meta.env.DEV === true
  const isViteDev = typeof window !== 'undefined' && 
    window.location.hostname === 'localhost' && 
    (window.location.port === '5173' || window.location.port === '5174') // Vite default ports
  
  if (isDev && isViteDev) {
    console.log('[Calendar API] Using proxy path for Vite dev server:', '/api')
    return '/api'
  }
  
  // Priority 3: In production/embed builds, always use full URL from config
  // This is the default for embed builds and production
  const apiUrl = config.apiBaseUrl
  console.log('[Calendar API] Using production API URL:', apiUrl)
  console.log('[Calendar API] Environment - DEV:', import.meta.env.DEV, 'MODE:', import.meta.env.MODE, 'Origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown')
  return apiUrl
}

export interface CreateCalendarEventRequest {
  subject: string
  content: string
  start_time: string // ISO format with timezone, e.g., "2026-01-21T14:30:00+00:00"
  end_time: string // ISO format with timezone, e.g., "2026-01-21T15:30:00+00:00"
  location: string
  attendees: Array<{
    email: string
    name: string
    type: 'required' | 'optional'
  }>
  is_online_meeting: boolean
  is_reminder_on: boolean
  reminder_minutes_before_start: number
}

export interface CreateCalendarEventResponse {
  id: string
  resource_id: string
  subject: string
  content: string
  location: string
  start_time: string
  end_time: string
  timezone: string
  is_all_day: boolean
  calendar_owner_email: string
  organizer_email: string
  organizer_name: string
  attendees: any[]
  required_attendees: any[]
  optional_attendees: any[]
  status: string
  scheduled_by: string
  response_status: string | null
  is_online_meeting: boolean
  online_meeting_url: string | null
  is_reminder_on: boolean
  reminder_minutes_before_start: number
  recurrence: string | null
  web_link: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export async function fetchCalendarEvents(
  startDate: string,
  endDate: string
): Promise<GroupedEvents> {
  try {
    const startDateEncoded = encodeURIComponent(startDate)
    const endDateEncoded = encodeURIComponent(endDate)
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/calendar/events/grouped?start_date=${startDateEncoded}&end_date=${endDateEncoded}`

    console.log('[Calendar API] Making request to:', url)
    console.log('[Calendar API] Request params:', { startDate, endDate })

    let response: Response
    try {
      response = await fetch(url, {
        method: 'GET',
        // No Content-Type header needed for GET requests - it can cause unnecessary preflight requests
        mode: 'cors', // Explicitly set CORS mode
      })
    } catch (fetchError) {
      // Handle network errors (including CORS)
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
      console.error('[Calendar API] Fetch error:', errorMessage)
      console.error('[Calendar API] URL attempted:', url)
      console.error('[Calendar API] Origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown')
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        throw new Error(
          `CORS error: The API server at ${url} does not allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'this origin'}. ` +
          `Please ensure the API server has CORS headers configured to allow requests from your origin.`
        )
      }
      throw new Error(`Network error: ${errorMessage}`)
    }

    console.log('[Calendar API] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('[Calendar API] Error response:', errorText)
      throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`)
    }

    const data: CalendarApiResponse = await response.json()
    console.log('[Calendar API] Full response received:', data)
    console.log('[Calendar API] Total events:', data.total)
    console.log('[Calendar API] Grouped events:', data.grouped_events)
    console.log('[Calendar API] Number of dates with events:', Object.keys(data.grouped_events).length)
    
    return data.grouped_events
  } catch (error) {
    console.error('[Calendar API] Error fetching calendar events:', error)
    throw error
  }
}

export async function createCalendarEvent(
  eventData: CreateCalendarEventRequest
): Promise<CreateCalendarEventResponse> {
  try {
    const baseUrl = getApiUrl()
    const url = `${baseUrl}/calendar/events`

    console.log('[Calendar API] Creating calendar event:', url)
    console.log('[Calendar API] Event data:', eventData)
    console.log('[Calendar API] Origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown')

    let response: Response
    try {
      // Minimal headers to avoid unnecessary preflight complexity
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Required for POST with JSON body
          // Don't add any other custom headers that would trigger preflight
        },
        body: JSON.stringify(eventData),
        mode: 'cors', // Explicitly set CORS mode
        credentials: 'omit', // Don't send credentials to avoid additional CORS complexity
      })
    } catch (fetchError) {
      // Handle network errors (including CORS)
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
      console.error('[Calendar API] Fetch error:', errorMessage)
      console.error('[Calendar API] URL attempted:', url)
      console.error('[Calendar API] Origin:', typeof window !== 'undefined' ? window.location.origin : 'unknown')
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        throw new Error(
          `CORS error: The API server at ${url} does not allow requests from ${typeof window !== 'undefined' ? window.location.origin : 'this origin'}. ` +
          `Please ensure the API server has CORS headers configured to allow requests from your origin.`
        )
      }
      throw new Error(`Network error: ${errorMessage}`)
    }

    console.log('[Calendar API] Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unable to read error response')
      console.error('[Calendar API] Error response:', errorText)
      throw new Error(`Failed to create calendar event: ${response.status} ${response.statusText}`)
    }

    const data: CreateCalendarEventResponse = await response.json()
    console.log('[Calendar API] Event created successfully:', data)
    
    return data
  } catch (error) {
    console.error('[Calendar API] Error creating calendar event:', error)
    throw error
  }
}

