import { useState, useMemo, useEffect } from 'react'
import { startOfDay, isSameMonth, endOfMonth, addMonths } from 'date-fns'
import { CalendarGrid } from '@/components/CalendarGrid'
import { toDateKey, getCalendarStartDate } from '@/utils/calendarGridUtils'

interface CalendarPickerProps {
  onDateSelect: (date: Date) => void
  minDate?: Date
  availabilityMap?: Map<string, boolean>
}

function CalendarPicker({ onDateSelect, minDate, availabilityMap }: CalendarPickerProps) {
  const startDate = minDate ?? getCalendarStartDate()
  const firstAvailableMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [currentMonth, setCurrentMonth] = useState(() => firstAvailableMonth)

  const today = new Date()

  useEffect(() => {
    const minDay = startOfDay(startDate)
    if (endOfMonth(currentMonth) < minDay) {
      setCurrentMonth((m) => addMonths(m, 1))
    }
  }, [currentMonth, startDate])

  const defaultAvailabilityMap = useMemo(() => {
    const map = new Map<string, boolean>()
    const now = new Date()
    const currentYear = now.getFullYear()

    const addYear = (y: number) => {
      const start = new Date(y, 0, 1)
      const end = new Date(y, 11, 31)
      for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toDateKey(d)
        const daysFromToday = Math.floor(
          (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        map.set(key, daysFromToday % 3 !== 0)
      }
    }

    addYear(currentYear)
    addYear(currentYear + 1)
    addYear(currentYear + 2)
    return map
  }, [])

  const finalAvailabilityMap = availabilityMap ?? defaultAvailabilityMap
  const currentYear = today.getFullYear()

  function handleDateSelect(date: Date) {
    setSelectedDate(date)
    onDateSelect(date)
  }

  function disabled(date: Date) {
    const dayOfWeek = date.getDay()
    // Disable Sunday (0) and Monday (1) so only Tuesday–Saturday are pickable.
    return (
      !isSameMonth(date, currentMonth) ||
      startOfDay(date) < startOfDay(startDate) ||
      dayOfWeek === 0 ||
      dayOfWeek === 1
    )
  }

  return (
    <div className="p-1 sm:p-4 lg:p-6 w-[calc(100%-.5rem)] lg:w-full md:w-full">
      <CalendarGrid
        month={currentMonth}
        onMonthChange={setCurrentMonth}
        selected={selectedDate}
        onSelect={handleDateSelect}
        disabled={disabled}
        availabilityMap={finalAvailabilityMap}
        fromYear={currentYear}
        toYear={currentYear + 2}
      />
    </div>
  )
}

export default CalendarPicker
