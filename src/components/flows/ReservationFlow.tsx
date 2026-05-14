import CalendarPicker from './CalendarPicker'
import TimeSlotPicker from './TimeSlotPicker'
import UserDetailsForm from './UserDetailsForm'
import { useAppSelector } from '@/store/hooks'
import { createAvailabilityMap } from '@/utils/calendarUtils'
import {
  getBookedTimeSlots,
  convertUtcSlotsToLocal,
  convertLocalToUtcTime,
  convertUtcToLocalTime
} from '@/utils/timeSlotUtils'
import type { ReservationStep, ReservationData } from '@/types/chat'

interface ReservationFlowProps {
  step: ReservationStep
  data: ReservationData
  onDateSelect: (date: Date) => void
  onTimeSelect: (time: string) => void
  onFormSubmit: (details: ReservationData['userDetails']) => void
}

function ReservationFlow({
  step,
  data,
  onDateSelect,
  onTimeSelect,
  onFormSubmit
}: ReservationFlowProps) {
  const events = useAppSelector((state) => state.calendarEvents.events)
  const availabilityMap = createAvailabilityMap(events)

  if (step === 'select_date') {
    return <CalendarPicker onDateSelect={onDateSelect} availabilityMap={availabilityMap} />
  }

  if (step === 'select_time' && data.availableSlots && data.selectedDate) {
    // Slots from API are in UTC; convert to local time for display
    const localSlots = convertUtcSlotsToLocal(data.availableSlots, data.selectedDate)

    // Get booked time slots from calendar events for the selected date (already in local time)
    const bookedSlots = getBookedTimeSlots(events, data.selectedDate)

    // Match booked slots (local) to local slots
    const bookedLocalSlots = bookedSlots.filter((slot) => localSlots.includes(slot))

    // Convert selectedTime from UTC to local for display
    const selectedLocalTime =
      data.selectedTime && data.selectedDate
        ? convertUtcToLocalTime(data.selectedTime, data.selectedDate)
        : undefined

    return (
      <TimeSlotPicker
        slots={localSlots}
        pickedSlots={bookedLocalSlots}
        selectedTime={selectedLocalTime}
        selectedDate={data.selectedDate}
        onTimeSelect={(localTime) => {
          // Convert local time back to UTC for storage/API
          if (data.selectedDate) {
            const utcTime = convertLocalToUtcTime(localTime, data.selectedDate)
            console.log('[ReservationFlow] Time selected - Local:', localTime, 'UTC:', utcTime)
            onTimeSelect(utcTime)
          } else {
            onTimeSelect(localTime)
          }
        }}
      />
    )
  }

  if (step === 'user_details') {
    return <UserDetailsForm onSubmit={onFormSubmit} />
  }

  return null
}

export default ReservationFlow

