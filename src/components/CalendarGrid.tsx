import { addMonths, subMonths, format, startOfDay, endOfMonth, addDays, getDay } from 'date-fns'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'
import { getCalendarDays, toDateKey, type CalendarDay } from '@/utils/calendarGridUtils'
import { CalendarDayCell } from '@/components/CalendarDayCell'
import { TextContent } from '@/components/TextContent'

export interface CalendarGridProps {
  /** First day of the displayed month */
  month: Date
  onMonthChange: (month: Date) => void
  selected?: Date
  onSelect: (date: Date) => void
  disabled?: (date: Date) => boolean
  availabilityMap?: Map<string, boolean>
  fromYear?: number
  toYear?: number
  /** First date to show (earlier dates and previous month are rendered empty) */
  minDate?: Date
  className?: string
}

export function CalendarGrid({
  month,
  onMonthChange,
  selected,
  onSelect,
  disabled,
  availabilityMap,
  fromYear,
  toYear,
  minDate,
  className
}: CalendarGridProps) {
  const allDays = getCalendarDays(month)
  const minDay = minDate ? startOfDay(minDate) : null

  let days = minDay != null
    ? allDays.filter((cell) => {
        if (cell.isCurrentMonth && startOfDay(cell.date) < minDay) return false
        if (!cell.isCurrentMonth && cell.date <= endOfMonth(month)) return false
        return true
      })
    : allDays

  // Pad last row with next days (including Sat/Sun) so all rows have 5 cells
  const remainder = days.length % 5
  if (remainder !== 0 && days.length > 0) {
    const toAdd = 5 - remainder
    const lastDate = days[days.length - 1].date
    const padding: CalendarDay[] = []
    for (let i = 1; i <= toAdd; i++) {
      const date = addDays(lastDate, i)
      const dayOfWeek = getDay(date)
      padding.push({
        date,
        isCurrentMonth: false,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6
      })
    }
    days = [...days, ...padding]
  }

  const canPrev =
    fromYear == null ||
    subMonths(month, 1).getFullYear() >= fromYear
  const canNext =
    toYear == null ||
    addMonths(month, 1).getFullYear() <= toYear

  return (
    <div
      className={cn(
        'bg-background group/calendar [--cell-size:3.25rem] sm:[--cell-size:5rem] lg:[--cell-size:4rem]',
        className
      )}
    >
      {/* Month and navigation - outside the grid container */}
      <div className="flex w-full items-center justify-center pb-2">
        <div className="flex gap-1 items-center ">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="p-2 [&_svg]:!size-6 aria-disabled:opacity-50"
          aria-label="Previous month"
          disabled={!canPrev}
          onClick={() => onMonthChange(subMonths(month, 1))}
        >
          <ChevronLeftIcon className="size-8" />
        </Button>
        <TextContent variant="textMedium" as="span" className="min-w-[4rem] text-center">
          {format(month, 'MMMM yyyy')}
        </TextContent>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="p-2 [&_svg]:!size-6 aria-disabled:opacity-50"
          aria-label="Next month"
          disabled={!canNext}
          onClick={() => onMonthChange(addMonths(month, 1))}
        >
          <ChevronRightIcon className="size-8" />
        </Button>
        </div>
      </div>

      {/* Day grid - rounded bordered container */}
      <div className="overflow-hidden rounded-[18px] lg:rounded-[22px] border-[0.85px] border-border">
        <div
          className="grid w-full"
          style={{
            gridTemplateColumns: 'repeat(5, minmax(var(--cell-size), 1fr))'
          }}
        >
          {days.map((cell, index) => (
            <CalendarDayCell
              key={cell.date.toISOString()}
              cell={cell}
              selected={selected}
              disabled={disabled?.(cell.date) || !cell.isCurrentMonth}
              availability={availabilityMap?.get(toDateKey(cell.date))}
              onSelect={() => onSelect(cell.date)}
              isLastRow={index >= days.length - 5}
              isLastCol={(index % 5) === 4}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
