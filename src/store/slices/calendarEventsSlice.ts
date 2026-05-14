import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { fetchCalendarEvents } from '@/services/calendarApi'

export interface CalendarEvent {
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
  attendees: Array<{
    type: string
    status: {
      time: string
      response: string
    }
    emailAddress: {
      name: string
      address: string
    }
  }>
  required_attendees: Array<{
    type: string
    status: {
      time: string
      response: string
    }
    emailAddress: {
      name: string
      address: string
    }
  }>
  optional_attendees: unknown[]
  status: string
  scheduled_by: string
  response_status: string | null
  is_online_meeting: boolean
  online_meeting_url: string | null
  is_reminder_on: boolean
  reminder_minutes_before_start: number
  recurrence: unknown | null
  web_link: string
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface GroupedEvents {
  [date: string]: CalendarEvent[]
}

interface CalendarEventsState {
  events: GroupedEvents
  loading: boolean
  error: string | null
  lastFetched: string | null
}

const initialState: CalendarEventsState = {
  events: {},
  loading: false,
  error: null,
  lastFetched: null,
}

export const fetchCalendarEventsAsync = createAsyncThunk(
  'calendarEvents/fetch',
  async ({ startDate, endDate }: { startDate: string; endDate: string }) => {
    console.log('[Calendar API] Fetching events:', { startDate, endDate })
    const response = await fetchCalendarEvents(startDate, endDate)
    console.log('[Calendar API] Events fetched:', response)
    return response
  }
)

const calendarEventsSlice = createSlice({
  name: 'calendarEvents',
  initialState,
  reducers: {
    clearEvents: (state) => {
      state.events = {}
      state.lastFetched = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCalendarEventsAsync.pending, (state) => {
        console.log('[Calendar Slice] Fetch pending')
        state.loading = true
        state.error = null
      })
      .addCase(fetchCalendarEventsAsync.fulfilled, (state, action: PayloadAction<GroupedEvents>) => {
        console.log('[Calendar Slice] Fetch fulfilled, events count:', Object.keys(action.payload).length)
        state.loading = false
        state.events = action.payload
        state.lastFetched = new Date().toISOString()
        console.log('[Calendar Slice] State updated:', state)
      })
      .addCase(fetchCalendarEventsAsync.rejected, (state, action) => {
        console.error('[Calendar Slice] Fetch rejected:', action.error)
        state.loading = false
        state.error = action.error.message || 'Failed to fetch calendar events'
      })
  },
})

export const { clearEvents } = calendarEventsSlice.actions
export default calendarEventsSlice.reducer

