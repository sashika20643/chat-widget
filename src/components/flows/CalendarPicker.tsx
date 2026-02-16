import { useState } from 'react'
import { Calendar } from '@/components/ui/shadCN/calendar'
import { DayButton } from 'react-day-picker'
import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'

interface CalendarPickerProps {
  onDateSelect: (date: Date) => void
  minDate?: Date
  availabilityMap?: Map<string, boolean> // Map of date strings to availability (true = available/green, false = limited/yellow)
}

function CustomDayButton({
  className,
  day,
  modifiers,
  availabilityMap,
  ...props
}: React.ComponentProps<typeof DayButton> & { availabilityMap?: Map<string, boolean> }) {
  const dayOfWeek = day.date.getDay()
  // Hide weekends (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return null
  }

  const dayName = day.date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2).toUpperCase()
  const dayNumber = day.date.getDate()
  // Use local date to match calendar display, format as YYYY-MM-DD
  const year = day.date.getFullYear()
  const month = String(day.date.getMonth() + 1).padStart(2, '0')
  const date = String(day.date.getDate()).padStart(2, '0')
  const dateKey = `${year}-${month}-${date}` // YYYY-MM-DD format in local timezone
  
  // Check availability from map
  // undefined or not in map = no bookings = green (available)
  // false = has bookings = yellow (unavailable)
  const availability = availabilityMap?.get(dateKey)
  const hasBookings = availability === false // false means has bookings
  const showDot = !modifiers.disabled // Show dot for all enabled dates
  
  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "h-[--cell-size] w-[--cell-size] min-h-[--cell-size] min-w-[--cell-size] max-h-[--cell-size] max-w-[--cell-size]",
        "border border-[hsl(var(--tertiary))]/30 rounded-md p-1 sm:p-1.5",
        "flex flex-col items-start justify-between relative",
        "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        "data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground",
        "data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground",
        "data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground",
        "hover:bg-[hsl(var(--gray-100))] disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    >
      {/* Top row: Day name (left) and Day number (right) */}
      <div className="flex items-start justify-between w-full -mt-0.5 text-[9px] sm:text-[10px]">
        <span className=" font-medium uppercase leading-none">
          {dayName}
        </span>
        <span className=" font-semibold leading-none">
          {dayNumber}
        </span>
      </div>
      
      {/* Bottom left: Availability dot */}
      {showDot && (
        <div className={cn(
          "absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full",
          hasBookings ? "bg-[hsl(var(--warning))]" : "bg-[hsl(var(--success))]" // Yellow if has bookings, green if no bookings
        )} />
      )}
    </Button>
  )
}

function CalendarPicker({ onDateSelect, minDate, availabilityMap }: CalendarPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const today = new Date()
  // Find the next weekday if today is a weekend
  const todayDayOfWeek = today.getDay()
  const startDate = minDate || (todayDayOfWeek === 0 || todayDayOfWeek === 6 
    ? (() => {
        const nextWeekday = new Date(today)
        // If Sunday (0), add 1 day to get Monday
        // If Saturday (6), add 2 days to get Monday
        nextWeekday.setDate(today.getDate() + (todayDayOfWeek === 0 ? 1 : 2))
        return nextWeekday
      })()
    : today)

  // Create dummy availability map if not provided
  const defaultAvailabilityMap = new Map<string, boolean>()
  if (!availabilityMap) {
    const currentYear = today.getFullYear()
    
    // Generate availability for current year (remaining days)
    const endOfYear = new Date(currentYear, 11, 31)
    for (let date = new Date(today); date <= endOfYear; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0]
      const daysFromToday = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      
      // Make some dates unavailable (yellow) - every 3rd day is limited
      if (daysFromToday % 3 === 0) {
        defaultAvailabilityMap.set(dateKey, false)
      } else {
        defaultAvailabilityMap.set(dateKey, true)
      }
    }
    
    // Generate availability for next 2 years
    for (let yearOffset = 1; yearOffset <= 2; yearOffset++) {
      const targetYear = currentYear + yearOffset
      const startOfYear = new Date(targetYear, 0, 1)
      const endOfYear = new Date(targetYear, 11, 31)
      
      for (let date = new Date(startOfYear); date <= endOfYear; date.setDate(date.getDate() + 1)) {
        const dateKey = date.toISOString().split('T')[0]
        const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
        
        if (dayOfYear % 3 === 0) {
          defaultAvailabilityMap.set(dateKey, false)
        } else {
          defaultAvailabilityMap.set(dateKey, true)
        }
      }
    }
  }

  const finalAvailabilityMap = availabilityMap || defaultAvailabilityMap

  function handleDateSelect(date: Date | undefined) {
    if (date) {
      setSelectedDate(date)
      onDateSelect(date)
    }
  }

  function CustomDayButtonWithAvailability(props: React.ComponentProps<typeof DayButton>) {
    return <CustomDayButton {...props} availabilityMap={finalAvailabilityMap} />
  }

  const currentYear = today.getFullYear()

  return (
    <div className="p-1 sm:p-4 lg:p-6 w-[calc(100%-.5rem)] lg:w-[calc(100%)] md:w-[calc(100%)]">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        disabled={(date) => {
          const dayOfWeek = date.getDay()
          // Disable weekends (Saturday = 6, Sunday = 0) and past dates
          return date < startDate || dayOfWeek === 0 || dayOfWeek === 6
        }}
        className="[--cell-size:2.5rem] sm:[--cell-size:3rem] lg:[--cell-size:3.5rem] [&_.rdp-week]:gap-1 [&_.rdp-day[data-day='0']]:hidden [&_.rdp-day[data-day='6']]:hidden [&_.rdp-weekday:first-child]:hidden [&_.rdp-weekday:last-child]:hidden [&_.rdp-day]:flex-1 [&_.rdp-day]:overflow-hidden [&_td[data-day]:has([data-day='0'])]:hidden [&_td[data-day]:has([data-day='6'])]:hidden [&_.rdp-today]:overflow-hidden [&_.rdp-today_button]:overflow-hidden"
        classNames={{
          weekday: "flex-1",
       day: "flex-1 overflow-hidden [&[data-day='0']]:hidden [&[data-day='6']]:hidden",
          today: "overflow-hidden"

        }}
          fromYear={currentYear}
          toYear={currentYear + 2}
          components={{
            DayButton: CustomDayButtonWithAvailability,
            Day: ({ day, ...props }) => {
              const dayOfWeek = day.date.getDay()
              // Hide weekend cells completely by returning a hidden td
              if (dayOfWeek === 0 || dayOfWeek === 6) {
                return <td {...props} style={{ display: 'none' }} />
              }
              return <td {...props} />
            }
          }}
      />
    </div>
  )
}

export default CalendarPicker
