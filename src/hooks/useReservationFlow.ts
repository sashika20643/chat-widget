import { useState, useCallback } from 'react'
import { useAppDispatch } from '@/store/hooks'
import { useChatMessages } from '@/hooks'
import { fetchCalendarEventsAsync } from '@/store/slices/calendarEventsSlice'
import { addMessage, setMessages } from '@/store/slices/chatSlice'
import {
  chatResponseToMessageContent,
  getAvailableTimeSlots,
  sendAppointmentConfirmation,
  submitReservation,
} from '@/services/chatApi'
import { getOrCreateUserId } from '@/utils/userId'
import { convertUtcToLocalTime } from '@/utils/timeSlotUtils'
import { createCalendarEvent } from '@/services/calendarApi'
import type {
  ConversationFlow,
  ReservationData,
  ReservationStep,
  Message as MessageType,
} from '@/types/chat'

interface UseReservationFlowOptions {
  threadId: string | null
}

export function useReservationFlow({ threadId }: UseReservationFlowOptions) {
  const dispatch = useAppDispatch()
  const messages = useChatMessages()
  const [flow, setFlow] = useState<ConversationFlow>({ state: 'idle' })
  const [reservationData, setReservationData] = useState<ReservationData>({})

  const startBookingFlow = useCallback((bookingProductId?: string) => {
    const today = new Date()
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
    const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0, 23, 59, 59)

    const startDateISO = startDate.toISOString()
    const endDateISO = endDate.toISOString()

    // eslint-disable-next-line no-console
    console.log('[ChatWidget] Date range:', { startDate: startDateISO, endDate: endDateISO })

    dispatch(fetchCalendarEventsAsync({ startDate: startDateISO, endDate: endDateISO }))

    // If user came from product detail ("Besichtigen"), prefill the message later.
    setReservationData((prev) => ({ ...prev, bookingProductId }))

    setFlow({
      state: 'reservation_flow',
      step: 'select_date',
    })
  }, [dispatch])

  const handleDateSelect = useCallback(async (date: Date) => {
    setReservationData((prev) => ({ ...prev, selectedDate: date }))
    setFlow((prev) => ({ ...prev, step: 'select_time' as ReservationStep }))

    const { slots, pickedSlots } = await getAvailableTimeSlots(date)
    setReservationData((prev) => ({ ...prev, availableSlots: slots, pickedSlots }))
  }, [])

  const handleTimeSelect = useCallback((time: string) => {
    setReservationData((prev) => ({ ...prev, selectedTime: time }))
    setFlow((prev) => ({ ...prev, step: 'user_details' as ReservationStep }))
  }, [])

  const handleFormSubmit = useCallback(
    async (details: ReservationData['userDetails']) => {
      if (!details || !reservationData.selectedDate || !reservationData.selectedTime) return

      try {
        const selectedDate = reservationData.selectedDate
        const [utcHours, utcMinutes] = reservationData.selectedTime.split(':').map(Number)

        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')

        const startTimeISO = `${year}-${month}-${day}T${String(utcHours).padStart(
          2,
          '0',
        )}:${String(utcMinutes).padStart(2, '0')}:00+00:00`

        const endDate = new Date(
          `${year}-${month}-${day}T${String(utcHours).padStart(2, '0')}:${String(
            utcMinutes,
          ).padStart(2, '0')}:00Z`,
        )
        endDate.setUTCHours(endDate.getUTCHours() + 1)

        const endYear = endDate.getUTCFullYear()
        const endMonth = String(endDate.getUTCMonth() + 1).padStart(2, '0')
        const endDay = String(endDate.getUTCDate()).padStart(2, '0')
        const endHours = String(endDate.getUTCHours()).padStart(2, '0')
        const endMinutes = String(endDate.getUTCMinutes()).padStart(2, '0')
        const endTimeISO = `${endYear}-${endMonth}-${endDay}T${endHours}:${endMinutes}:00+00:00`

        // eslint-disable-next-line no-console
        console.log('[ChatWidget] Creating calendar event:', {
          start_time: startTimeISO,
          end_time: endTimeISO,
          attendee: details.email,
        })

        const fullName = `${details.firstName} ${details.lastName}`
        const bookingProductId = reservationData.bookingProductId
        const subject = bookingProductId
          ? `booking with ${fullName} for product-${bookingProductId}`
          : `booking with ${fullName}`

        const calendarContent = details.message
          ? `Appointment booking for ${fullName}\n\nMessage: ${details.message}`
          : `Appointment booking for ${fullName}`

        await createCalendarEvent({
          subject,
          content: calendarContent,
          start_time: startTimeISO,
          end_time: endTimeISO,
          location: 'Showroom',
          attendees: [
            {
              email: details.email,
              name: fullName,
              type: 'required' as const,
            },
          ],
          is_online_meeting: false,
          is_reminder_on: true,
          reminder_minutes_before_start: 15,
        })

        // eslint-disable-next-line no-console
        console.log('[ChatWidget] Calendar event created successfully')
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[ChatWidget] Error creating calendar event:', error)
      }

      const result = await submitReservation({
        date: reservationData.selectedDate,
        time: reservationData.selectedTime,
        userDetails: details,
      })

      const selectedDate = reservationData.selectedDate
      const selectedTime = reservationData.selectedTime

      const dateStr = `${selectedDate.getFullYear()}-${String(
        selectedDate.getMonth() + 1,
      ).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`
      const timeStr = convertUtcToLocalTime(selectedTime, selectedDate)
      const appointmentId = `APT-${Date.now()}`

      if (messages.length > 0) {
        dispatch(setMessages(messages.slice(0, -1)))
      }

      const userId = getOrCreateUserId()
      let content: MessageType['content']

      try {
        const chatResponse = await sendAppointmentConfirmation(userId, threadId, {
          appointment_id: appointmentId,
          date: dateStr,
          time: timeStr,
        })
        content = chatResponseToMessageContent(chatResponse)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ChatWidget] Failed to send appointment to chat:', err)
        content = { text: result.message }
      }

      const confirmationMessage: MessageType = {
        id: Date.now().toString(),
        content,
        role: 'assistant',
        timestamp: new Date().toISOString(),
      }

      dispatch(addMessage(confirmationMessage))
      setFlow({ state: 'idle' })
      setReservationData({})
    },
    [dispatch, messages, reservationData, threadId],
  )

  const handleBack = useCallback(() => {
    if (flow.state !== 'reservation_flow' || !flow.step) return

    const currentStep = flow.step

    if (currentStep === 'user_details') {
      setFlow({
        state: 'reservation_flow',
        step: 'select_time',
      })
    } else if (currentStep === 'select_time') {
      setReservationData((prev) => ({
        selectedDate: prev.selectedDate,
        availableSlots: undefined,
        selectedTime: undefined,
        bookingProductId: prev.bookingProductId,
        userDetails: undefined,
      }))
      setFlow({
        state: 'reservation_flow',
        step: 'select_date',
      })
    } else if (currentStep === 'select_date') {
      setFlow({ state: 'idle' })
      setReservationData({})
    }
  }, [flow.state, flow.step])

  return {
    flow,
    reservationData,
    startBookingFlow,
    handleDateSelect,
    handleTimeSelect,
    handleFormSubmit,
    handleBack,
  }
}

