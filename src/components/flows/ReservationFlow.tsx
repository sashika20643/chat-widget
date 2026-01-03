import CalendarPicker from './CalendarPicker'
import TimeSlotPicker from './TimeSlotPicker'
import UserDetailsForm from './UserDetailsForm'
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
  if (step === 'select_date') {
    return <CalendarPicker onDateSelect={onDateSelect} />
  }

  if (step === 'select_time' && data.availableSlots) {
    return (
      <TimeSlotPicker
        slots={data.availableSlots}
        pickedSlots={data.pickedSlots || []}
        selectedTime={data.selectedTime}
        onTimeSelect={onTimeSelect}
      />
    )
  }

  if (step === 'user_details') {
    return <UserDetailsForm onSubmit={onFormSubmit} />
  }

  return null
}

export default ReservationFlow

