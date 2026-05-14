import type { GroupedEvents, CalendarEvent } from '@/store/slices/calendarEventsSlice'

function getLocalDateString(utcDateString: string): string {
  // Convert UTC date string to local date string (YYYY-MM-DD)
  const date = new Date(utcDateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createAvailabilityMap(events: GroupedEvents): Map<string, boolean> {
  console.log('[Calendar Utils] Creating availability map from events:', events)
  const availabilityMap = new Map<string, boolean>()
  
  // Iterate through all dates in the events (API returns UTC dates)
  Object.keys(events).forEach((utcDateKey) => {
    const eventsForDate = events[utcDateKey]
    
    // Convert each event's start_time from UTC to local date
    eventsForDate.forEach((event: CalendarEvent) => {
      const localDateKey = getLocalDateString(event.start_time)
      
      // If there are events (bookings), show yellow dot (false = has bookings/unavailable)
      // If there are no events (not in map), show green dot (available)
      if (!availabilityMap.has(localDateKey)) {
        availabilityMap.set(localDateKey, false) // Has bookings = yellow
        console.log(`[Calendar Utils] Date ${localDateKey} (from UTC ${utcDateKey}): ${eventsForDate.length} events (YELLOW - has bookings)`)
      }
    })
  })
  
  console.log('[Calendar Utils] Availability map created with', availabilityMap.size, 'dates')
  return availabilityMap
}

