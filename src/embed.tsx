import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import type { Root } from 'react-dom/client'
import ChatWidget from '@/components/ChatWidget'
import type { ChatWidgetRef } from '@/components/ChatWidget'
import { store } from '@/store'
import { ParentEventTracker } from '@/utils/parentEventTracker'
import { Toaster } from '@/components/ui/shadCN/toaster-embed'
import { toast } from 'sonner'
import '@/styles/index.css'

interface ChatbotConfig {
  id?: number
  name?: string
  price?: number
  apiUrl?: string // Optional API URL override
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
  private hasAppliedInitialChatOption = false
  private eventTracker: ParentEventTracker | null = null
  private lastClickToastTime = 0
  private lastScrollToastTime = 0
  private readonly TOAST_THROTTLE_MS = 5000 // Show toast max once per 5 seconds

  init() {
    if (this.isInitialized) {
      console.log('[Chatbot] init called but already initialized')
      return
    }

    console.log('[Chatbot] Creating container for chat widget')
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

    console.log('[Chatbot] Rendering ChatWidget root')
    this.root.render(
      <StrictMode>
        <Provider store={store}>
          <Toaster />
          <WidgetWithRef
            ref={(ref) => {
              console.log('[Chatbot] Widget ref set:', !!ref)
              this.widgetRef = ref
              // Once the ref is available, (re)apply initial chat option logic
              this.applyInitialChatOption()
            }}
          />
        </Provider>
      </StrictMode>
    )

    this.isInitialized = true
    console.log('[Chatbot] Initialization complete')

    // Start tracking parent website events
    this.startEventTracking()
  }

  private startEventTracking() {
    if (this.eventTracker) {
      return
    }

    this.eventTracker = new ParentEventTracker({
      onUserClick: (event) => {
        console.log('[Chatbot] Parent website click detected:', event)
        const now = Date.now()
        if (now - this.lastClickToastTime > this.TOAST_THROTTLE_MS) {
          this.lastClickToastTime = now
          toast.info('Click detected', {
            description: 'We noticed you clicked on the page',
            duration: 2000,
          })
        }
      },
      onUserScroll: (event) => {
        console.log('[Chatbot] Parent website scroll detected:', event)
        const now = Date.now()
        if (now - this.lastScrollToastTime > this.TOAST_THROTTLE_MS) {
          this.lastScrollToastTime = now
          toast.info('Scroll detected', {
            description: 'You scrolled on the page',
            duration: 2000,
          })
        }
      },
      onUserInactive: (inactiveDuration) => {
        const minutes = Math.round(inactiveDuration / 60000)
        console.log(`[Chatbot] User inactive for ${minutes} minutes`)
        toast.warning('You\'ve been inactive', {
          description: `You haven't interacted with the page for ${minutes} minute${minutes > 1 ? 's' : ''}. Need help?`,
          duration: 5000,
        })
      }
    })

    this.eventTracker.setInactivityThreshold(2) // 2 minutes
    this.eventTracker.startTracking()
  }

  // Cleanup method for event tracking (useful for widget destruction/cleanup scenarios)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private stopEventTracking() {
    if (this.eventTracker) {
      this.eventTracker.stopTracking()
      this.eventTracker = null
    }
  }

  // Public cleanup method that can be called when widget needs to be destroyed
  destroy() {
    this.stopEventTracking()
    if (this.root) {
      this.root.unmount()
      this.root = null
    }
    const container = document.getElementById('chatbot-widget-container')
    if (container) {
      container.remove()
    }
    this.isInitialized = false
    this.widgetRef = null
  }

  private applyInitialChatOption() {
    if (typeof window === "undefined") return
    if (this.hasAppliedInitialChatOption) return

    const params = new URLSearchParams(window.location.search)
    const chatOption = params.get("chatOption")

    console.log('[Chatbot] applyInitialChatOption - chatOption:', chatOption, 'widgetRef set:', !!this.widgetRef)

    if (chatOption === "booking" && this.widgetRef) {
      console.log('[Chatbot] applyInitialChatOption - opening widget and starting booking flow')
      this.widgetRef.setIsOpen(true)
      this.widgetRef.startBookingFlow()
      this.isOpenState = true
      this.hasAppliedInitialChatOption = true
    }
  }

  open(config?: ChatbotConfig) {
    console.log('[Chatbot] open called with config:', config)
    this.init()
    if (this.widgetRef) {
      this.widgetRef.setIsOpen(true)
      this.isOpenState = true

      // Apply initial behavior (e.g., auto-start booking flow)
      this.applyInitialChatOption()
      // Store config for use in the widget if needed
      if (config && typeof window !== 'undefined') {
        ;(window as typeof window & { chatbotConfig?: ChatbotConfig }).chatbotConfig = config
        // Set API URL if provided
        if (config.apiUrl) {
          ;(window as typeof window & { chatbotApiUrl?: string }).chatbotApiUrl = config.apiUrl
        }
      }
    } else {
      console.warn('[Chatbot] open called but widgetRef is not yet set')
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
  
  // Check for API URL configuration from script tag data attribute
  function getApiUrlFromScriptTag(): string | null {
    const scripts = document.getElementsByTagName('script')
    for (let i = 0; i < scripts.length; i++) {
      const script = scripts[i]
      const apiUrl = script.getAttribute('data-api-url')
      if (apiUrl) {
        return apiUrl
      }
    }
    return null
  }
  
  // Initialize API URL from script tag if available
  const scriptApiUrl = getApiUrlFromScriptTag()
  if (scriptApiUrl) {
    ;(window as typeof window & { chatbotApiUrl?: string }).chatbotApiUrl = scriptApiUrl
    console.log('[Chatbot] API URL configured from script tag:', scriptApiUrl)
  }
  
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

  // If URL has chatOption=booking, auto-open and jump to booking flow
  if (typeof window !== 'undefined') {
    console.log('[Chatbot] Checking URL for initial chatOption')
    const params = new URLSearchParams(window.location.search)
    const chatOption = params.get('chatOption')
    if (chatOption === 'booking') {
      console.log('[Chatbot] chatOption=booking detected, calling open()')
      chatbot.open()
    }
  }
  
  // Expose global API
  ;(window as typeof window & { Chatbot: ChatbotAPI }).Chatbot = {
    open: (config?: ChatbotConfig) => chatbot.open(config),
    close: () => chatbot.close(),
    toggle: () => chatbot.toggle(),
  }

  // Expose toast function globally for use in parent website
  ;(window as typeof window & { toast?: typeof toast }).toast = toast
}
