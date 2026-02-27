import { Button } from '@/components/ui/shadCN/button'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { TextContent } from '@/components/TextContent'
import { cn } from '@/utils/utils'

function formatSelectedDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

interface TimeSlotPickerProps {
  slots: string[]
  pickedSlots?: string[]
  selectedTime?: string
  selectedDate: Date
  onTimeSelect: (time: string) => void
}

function TimeSlotPicker({ slots, pickedSlots = [], selectedTime, selectedDate, onTimeSelect }: TimeSlotPickerProps) {
  const dateLabel = formatSelectedDate(selectedDate)
  return (
    <ChatBubble variant="assistant" className="p-4">
      <TextContent variant="textMedium" className="mb-5 block">
        Sure, {dateLabel} works very well, we'll have plenty of time for you then! What time suits you best?
      </TextContent>
      <div className="grid grid-cols-4 gap-x-2 lg:gap-x-3 gap-y-3 lg:gap-y-5">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot
          const isPicked = pickedSlots.includes(slot)
          
          return (
            <Button
              key={slot}
              variant={isSelected ? 'default' : isPicked ? 'outline' : 'outline-black'}
              size="sm"
              onClick={() => !isPicked && onTimeSelect(slot)}
              disabled={isPicked}
              className={cn(
                "text-xs lg:text-lg rounded-full w-fit min-w-0 lg:px-4 lg:py-4 px-3.5 py-3",
                !isPicked && !isSelected && "bg-[hsl(var(--primary))] text-primary-foreground hover:bg-[hsl(var(--primary))]/90",
                isSelected && "bg-primary text-primary-foreground",
                isPicked && "time-slot-picked bg-secondary text-secondary-foreground" 
              )}
            >
              {slot}
            </Button>
          )
        })}
      </div>
    </ChatBubble>
  )
}

export default TimeSlotPicker

