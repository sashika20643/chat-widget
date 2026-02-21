import { Button } from '@/components/ui/shadCN/button'
import { ChatBubble } from '@/components/ui/chat-bubble'
import { cn } from '@/utils/utils'

interface TimeSlotPickerProps {
  slots: string[]
  pickedSlots?: string[]
  selectedTime?: string
  onTimeSelect: (time: string) => void
}

function TimeSlotPicker({ slots, pickedSlots = [], selectedTime, onTimeSelect }: TimeSlotPickerProps) {
  return (
    <ChatBubble variant="assistant" className="p-4">
      <span className="text-sm lg:text-lg mb-5 block">Sure, Thursday, September 19 
works very well, we'll have plenty 
of time for you then! What time 
suits you best?</span>
      <div className="grid grid-cols-4 gap-2">
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
                "text-xs lg:text-lg rounded-full w-fit min-w-0 px-4 py-4",
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

