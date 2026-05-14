import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  getDay,
  isSameMonth,
  startOfDay,
  addDays,
  type Locale
} from 'date-fns'

export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isWeekend: boolean
}

const WEEK_STARTS_ON = 2 // Tuesday

/**
 * Returns a flat list of calendar day cells for the given month.
 * Only Tue–Sat are included; each row has 5 cells.
 * Sunday and Monday are excluded. Days from adjacent months are included for alignment (isCurrentMonth = false).
 */
export function getCalendarDays(
  month: Date,
  options?: { weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6; locale?: Locale }
): CalendarDay[] {
  const weekStartsOn = options?.weekStartsOn ?? WEEK_STARTS_ON
  const start = startOfWeek(startOfMonth(month), { weekStartsOn })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn })
  const allDays = eachDayOfInterval({ start, end })

  const weekdays = allDays.filter((d) => {
    const day = getDay(d)
    return day >= 2 && day <= 6 // Tue=2 .. Sat=6
  })

  return weekdays.map((date) => ({
    date,
    isCurrentMonth: isSameMonth(date, month),
    isWeekend: false
  }))
}

/** Format date as YYYY-MM-DD (local) for availability map keys */
export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Returns the first date the calendar should show as available.
 * - If today is Tue–Sat, returns start of today.
 * - If today is Sunday, returns next Tuesday (+2 days).
 * - If today is Monday, returns next Tuesday (+1 day).
 */
export function getCalendarStartDate(): Date {
  const today = startOfDay(new Date())
  const day = getDay(today) // 0 = Sun, 6 = Sat
  if (day >= 2 && day <= 6) return today // Tue–Sat
  return addDays(today, day === 0 ? 2 : 1) // Sun -> +2, Mon -> +1
}

/**
 * Returns true if the date is before the calendar start date (or is a weekend).
 * Use to hide or disable dates that should not be selectable.
 */
export function isBeforeCalendarStart(date: Date): boolean {
  const start = getCalendarStartDate()
  return startOfDay(date) < start
}
