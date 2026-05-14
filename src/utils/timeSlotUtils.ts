import type { GroupedEvents, CalendarEvent } from '@/store/slices/calendarEventsSlice'

function getLocalDateString(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalTimeStringFromIso(utcTimeString: string): string {
  // Convert an ISO UTC timestamp to local HH:mm
  const date = new Date(utcTimeString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function convertUtcToLocalTime(utcTime: string, date: Date): string {
  // utcTime: "HH:mm" in UTC for the given date
  const [hours, minutes] = utcTime.split(':').map(Number)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`

  const utcDate = new Date(
    `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00Z`
  )

  const localHours = String(utcDate.getHours()).padStart(2, '0')
  const localMinutes = String(utcDate.getMinutes()).padStart(2, '0')

  console.log(
    `[Time Slot Utils] convertUtcToLocalTime utc=${utcTime} -> local=${localHours}:${localMinutes} on ${dateStr}`
  )

  return `${localHours}:${localMinutes}`
}

export function convertLocalToUtcTime(localTime: string, date: Date): string {
  // localTime: "HH:mm" in local time for the given date
  const [hours, minutes] = localTime.split(':').map(Number)
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`

  const localDate = new Date(
    `${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
  )

  const utcHours = String(localDate.getUTCHours()).padStart(2, '0')
  const utcMinutes = String(localDate.getUTCMinutes()).padStart(2, '0')

  console.log(
    `[Time Slot Utils] convertLocalToUtcTime local=${localTime} -> utc=${utcHours}:${utcMinutes} on ${dateStr}`
  )

  return `${utcHours}:${utcMinutes}`
}

export function convertUtcSlotsToLocal(utcSlots: string[], date: Date): string[] {
  console.log('[Time Slot Utils] Converting UTC slots to local:', utcSlots, 'for date:', date)
  const localSlots = utcSlots.map((slot) => convertUtcToLocalTime(slot, date))
  console.log('[Time Slot Utils] Converted slots (local):', localSlots)
  return localSlots
}

export function getBookedTimeSlots(events: GroupedEvents, selectedDate: Date): string[] {
  const localDateKey = getLocalDateString(selectedDate)
  const bookedSlots: string[] = []

  // Check all events to find ones that match the selected date in local time
  Object.keys(events).forEach((utcDateKey) => {
    const eventsForDate = events[utcDateKey]

    eventsForDate.forEach((event: CalendarEvent) => {
      const eventLocalDate = getLocalDateString(new Date(event.start_time))

      if (eventLocalDate === localDateKey) {
        const timeSlot = getLocalTimeStringFromIso(event.start_time)
        if (!bookedSlots.includes(timeSlot)) {
          bookedSlots.push(timeSlot)
        }
      }
    })
  })

  console.log('[Time Slot Utils] Booked slots for', localDateKey, ':', bookedSlots)
  return bookedSlots
}
