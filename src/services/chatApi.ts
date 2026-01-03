import type { ScenarioResponse } from '@/types/chat'

export async function detectScenario(message: string): Promise<ScenarioResponse> {
  // Dummy API call - replace with actual API later
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerMessage = message.toLowerCase()
      
      // Check for reservation keywords
      if (lowerMessage.includes('sofa') || 
          lowerMessage.includes('showroom') || 
          lowerMessage.includes('reserve') || 
          lowerMessage.includes('appointment') ||
          lowerMessage.includes('book')) {
        
        resolve({
          scenario: 'reservation',
          message: {
            text: "The sofa is currently on display in our showroom in the city center. Should I reserve it for you so you can take a look at it this week with no obligation?",
            buttons: [{
              label: "Book an appointment",
              onClick: () => {},
              variant: 'black'
            }]
          }
        })
      } else {
        // Default response
        resolve({
          scenario: null,
          message: {
            text: "I'm here to help! How can I assist you today?"
          }
        })
      }
    }, 500) // Simulate API delay
  })
}

export async function getAvailableTimeSlots(_date: Date): Promise<{
  slots: string[]
  pickedSlots: string[]
}> {
  // Dummy API - replace with actual API
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSlots = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
      ]
      
      // Randomly mark some slots as picked (from database)
      const shuffled = [...allSlots].sort(() => Math.random() - 0.5)
      const pickedCount = Math.floor(allSlots.length * (0.2 + Math.random() * 0.1))
      const pickedSlots = shuffled.slice(0, pickedCount)
      
      resolve({
        slots: allSlots,
        pickedSlots
      })
    }, 300)
  })
}

export async function submitReservation(_data: {
  date: Date
  time: string
  userDetails: {
    name: string
    email: string
    phone: string
  }
}): Promise<{ success: boolean; message: string }> {
  // Dummy API - replace with actual API
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: "Your appointment has been booked successfully! We'll send you a confirmation email shortly."
      })
    }, 500)
  })
}

