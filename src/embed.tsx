import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { Root } from 'react-dom/client'
import ChatWidget from '@/components/ChatWidget'
import type { ChatWidgetRef } from '@/components/ChatWidget'
import '@/styles/index.css'

interface ChatbotConfig {
  id?: number
  name?: string
  price?: number
  [key: string]: unknown
}

interface ChatbotAPI {
  open: (config?: ChatbotConfig) => void
  close: () => void
  toggle: () => void
}

class ChatbotController {
  private root: Root | null = null
  private widgetRef: ChatWidgetRef | null = null
  private isInitialized = false
  private isOpenState = false

  init() {
    if (this.isInitialized) return

    // Create container for the chat widget
    const container = document.createElement('div')
    container.id = 'chatbot-widget-container'
    document.body.appendChild(container)

    this.root = createRoot(container)

    // Render the widget with ref callback
    const WidgetWithRef = React.forwardRef<ChatWidgetRef>((props, ref) => {
      return <ChatWidget ref={ref} {...props} />
    })
    WidgetWithRef.displayName = 'WidgetWithRef'

    this.root.render(
      <StrictMode>
        <WidgetWithRef
          ref={(ref) => {
            this.widgetRef = ref
          }}
        />
      </StrictMode>
    )

    this.isInitialized = true
  }

  open(config?: ChatbotConfig) {
    this.init()
    if (this.widgetRef) {
      this.widgetRef.setIsOpen(true)
      this.isOpenState = true
      // Store config for use in the widget if needed
      if (config && typeof window !== 'undefined') {
        ;(window as typeof window & { chatbotConfig?: ChatbotConfig }).chatbotConfig = config
      }
    }
  }

  close() {
    if (this.widgetRef) {
      this.widgetRef.setIsOpen(false)
      this.isOpenState = false
    }
  }

  toggle() {
    this.init()
    if (this.isOpenState) {
      this.close()
    } else {
      this.open()
    }
  }
}

// Expose global API
if (typeof window !== 'undefined') {
  const chatbot = new ChatbotController()
  
  // Wait for DOM to be ready
  function initialize() {
    if (document.body) {
      chatbot.init()
    } else {
      // Wait for DOMContentLoaded or body to be available
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize)
      } else {
        // Use setTimeout as fallback
        setTimeout(initialize, 0)
      }
    }
  }
  
  // Start initialization
  initialize()
  
  // Expose global API
  ;(window as typeof window & { Chatbot: ChatbotAPI }).Chatbot = {
    open: (config?: ChatbotConfig) => chatbot.open(config),
    close: () => chatbot.close(),
    toggle: () => chatbot.toggle(),
  }
}
