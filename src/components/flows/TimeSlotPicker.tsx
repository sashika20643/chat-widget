import { Button } from '@/components/ui/shadCN/button'
import { cn } from '@/utils/utils'

interface TimeSlotPickerProps {
  slots: string[]
  pickedSlots?: string[]
  selectedTime?: string
  onTimeSelect: (time: string) => void
}

function TimeSlotPicker({ slots, pickedSlots = [], selectedTime, onTimeSelect }: TimeSlotPickerProps) {
  return (
    <div className="bg-background border border-[hsl(var(--tertiary))] rounded-lg p-4">
      <h3 className="font-semibold text-sm mb-3">Select a time slot</h3>
      <div className="grid grid-cols-3 gap-2">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot
          const isPicked = pickedSlots.includes(slot)
          
          return (
            <Button
              key={slot}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => !isPicked && onTimeSelect(slot)}
              disabled={isPicked}
              className={cn(
                "text-xs",
                !isPicked && " hover:bg-primary text-foreground border-primary",
                isPicked && "time-slot-picked bg-secondary" 
              )}
            >
              {slot}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export default TimeSlotPicker

