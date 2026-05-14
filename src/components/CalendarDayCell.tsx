import { format, isSameDay, isToday } from 'date-fns'
import { cn } from '@/utils/utils'
import type { CalendarDay } from '@/utils/calendarGridUtils'
import { TextContent } from '@/components/TextContent'

export interface CalendarDayCellProps {
  cell: CalendarDay
  selected?: Date
  disabled?: boolean
  availability?: boolean
  onSelect: () => void
  isLastRow?: boolean
  isLastCol?: boolean
}

export function CalendarDayCell({
  cell,
  selected,
  disabled,
  availability,
  onSelect,
  isLastRow,
  isLastCol
}: CalendarDayCellProps) {
  const dayName = format(cell.date, 'EEE').substring(0, 2).toUpperCase()
  const dayNumber = cell.date.getDate()
  const isSelected = selected != null && isSameDay(cell.date, selected)
  const isTodayDate = isToday(cell.date)
  // false in map = has bookings = yellow; true or undefined = available = green
  const hasBookings = availability === false
  const showDot = !disabled

  function handleClick() {
    if (!disabled) onSelect()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (disabled) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      data-day={cell.date.toLocaleDateString()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'aspect-square w-full min-h-[var(--cell-size)] min-w-[var(--cell-size)] rounded-none p-[8px]',
        'border-r-[0.85px] border-b-[0.85px] border-border',
        isLastCol && 'border-r-0',
        isLastRow && 'border-b-0',
        'flex flex-col items-start justify-between relative',
        'transition-colors',
        !disabled && 'cursor-pointer hover:bg-[hsl(var(--gray-100))]',
        disabled && 'cursor-not-allowed',
        !cell.isCurrentMonth && 'text-muted-foreground',
        isSelected && 'bg-primary text-primary-foreground',
        disabled &&
          'bg-muted/70 text-muted-foreground opacity-90',
        isTodayDate &&
          !isSelected &&
          'ring-2 ring-primary bg-primary/10'
      )}
    >
      <div className="flex w-full items-start justify-between mt-.5">
        <TextContent variant="textCalendar" as="span" className="uppercase">
          {dayName}
        </TextContent>
        <TextContent variant="textCalendar" as="span">
          {dayNumber}
        </TextContent>
      </div>
      {showDot && (
        <div
          className={cn(
            'absolute bottom-[8px] left-[8px] lg:bottom-[8px] lg:left-[8px] w-[8px] h-[8px] lg:w-[12px] lg:h-[12px] rounded-full',
            hasBookings ? 'bg-[hsl(var(--warning))]' : 'bg-[hsl(var(--success))]'
          )}
        />
      )}
    </div>
  )
}
