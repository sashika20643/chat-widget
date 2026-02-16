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
          lowerMessage.includes('book') ||
          lowerMessage.includes('timeslot')) {
        
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
      } else if (lowerMessage.includes('furniture') && lowerMessage.includes('scan')) {
        // Furniture scanning
        resolve({
          scenario: null,
          message: {
            text: "I can help you with furniture scanning! You can use our AR feature to scan and visualize furniture in your space. Would you like to try it?"
          }
        })
      } else if (lowerMessage.includes('about') && lowerMessage.includes('h100')) {
        // About H100
        resolve({
          scenario: null,
          message: {
            text: "H100 is a premium furniture brand offering high-quality, stylish furniture pieces. We specialize in creating beautiful, functional spaces with our curated collection of furniture. How can I help you learn more?"
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
        '08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
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
    firstName: string
    lastName: string
    email: string
    phone: string
    message?: string
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

