import { useState, forwardRef, useImperativeHandle, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/shadCN/card'
import { ScrollArea } from '@/components/ui/shadCN/scroll-area'
import { cn } from '@/utils/utils'
import Message from '@/components/Message'
import ChatWidgetButton from '@/components/ChatWidgetButton'
import ChatInputBar from '@/components/ChatInputBar'
import ReservationFlow from '@/components/flows/ReservationFlow'
import WelcomeScreen from '@/components/WelcomeScreen'
import InactivitySuggestionNotification from '@/components/notification/InactivitySuggestionNotification'
import ProductDwellNotification from '@/components/notification/ProductDwellNotification'
import WebFormAbandonmentNotification from '@/components/notification/WebFormAbandonmentNotification'
import ThankYouNotification from '@/components/notification/ThankYouNotification'
import ScrollIndecisionNotification from '@/components/notification/ScrollIndecisionNotification'
import { ChatWidgetHeader } from '@/components/ChatWidgetHeader'
import { useChatMessages, useChatWidgetOpen, useMediaQuery, useScrollToBottom } from '@/hooks'
import { useChatConversation } from '@/hooks/useChatConversation'
import { triggerWebFormPause } from '@/services/chatApi'
import { uploadImageToImgBB } from '@/services/imgbbApi'
import { useReservationFlow } from '@/hooks/useReservationFlow'
import { subscribeToNewsletter } from '@/services/newsletterApi'
import { useAppDispatch } from '@/store/hooks'
import { addMessage } from '@/store/slices/chatSlice'
import {
  CHAT_WIDGET_INACTIVITY_EVENT,
  CHAT_WIDGET_PRODUCT_DWELL_EVENT,
  CHAT_WIDGET_WEBFORM_ABANDONMENT_EVENT,
  CHAT_WIDGET_SCROLL_INDECISION_EVENT,
  CHAT_WIDGET_THANK_YOU_EVENT,
  type ProductDwellEventDetail,
} from '@/utils/chatWidgetNotifications'
import {
  createInitialMobelaboWizardState,
  createInitialSearchServiceWizardState,
  type ChatWidgetProps,
  type GeneralChoiceOption,
  type MessageProductDetail,
  type ReservationStep,
  type WidgetAction,
} from '@/types/chat'

const PRODUCT_DWELL_DELAY_MS = 15_000

export interface ChatWidgetRef {
  setIsOpen: (open: boolean) => void
  startBookingFlow: () => void
  /** Start a flow by action (e.g. from URL param action=booking). */
  startFlow: (action: WidgetAction) => void
  sendMessage: (text: string) => Promise<void>
}

const ChatWidget = forwardRef<ChatWidgetRef, ChatWidgetProps>(({ 
  placeholder = 'Type your message...',
  onSendMessage 
}, ref) => {
  const messages = useChatMessages()
  const [isOpen, setIsOpen] = useState(false)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [showInactivitySuggestion, setShowInactivitySuggestion] = useState(false)
  const [showProductDwellNotification, setShowProductDwellNotification] = useState(false)
  const [showWebFormAbandonmentNotification, setShowWebFormAbandonmentNotification] = useState(false)
  const [showScrollIndecisionNotification, setShowScrollIndecisionNotification] = useState(false)
  const [showThankYouNotification, setShowThankYouNotification] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const initialMessageCountRef = useRef<number | null>(null)
  const wasOpenRef = useRef(false)
  const [inactivityMessage, setInactivityMessage] = useState<string | undefined>(undefined)
  const [dwellProductName, setDwellProductName] = useState<string>('this product')
  const [activeProductDetails, setActiveProductDetails] = useState<Record<string, MessageProductDetail>>({})
  const productDwellTimeoutRef = useRef<number | null>(null)

  // Snapshot message count when widget opens so only messages from stream after open get typewriter; history shows in full
  if (isOpen && !wasOpenRef.current) {
    wasOpenRef.current = true
    initialMessageCountRef.current = messages.length
  }
  if (!isOpen) wasOpenRef.current = false
  if (messages.length === 0) {
    initialMessageCountRef.current = 0
  }

  const dispatch = useAppDispatch()
  const {
    flow,
    reservationData,
    startBookingFlow,
    handleDateSelect,
    handleTimeSelect,
    handleFormSubmit,
    handleBack,
  } = useReservationFlow({ threadId })

  const {
    inputValue,
    setInputValue,
    isLoading,
    statusMessage,
    handleSend,
    handleTagClick,
    handleKeyDown,
  } = useChatConversation({
    startBookingFlow,
    threadId,
    setThreadId,
    onSendMessage,
    onBeforeInteraction: () => {
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(false)
      setShowScrollIndecisionNotification(false)
      setShowThankYouNotification(false)
    },
  })

  const isDesktopForNotification = useMediaQuery('(min-width: 640px)')
  useChatWidgetOpen(isOpen)
  useScrollToBottom(messagesEndRef, [messages, flow.state, flow.step])

  // When opening the widget with existing messages, jump to the end immediately.
  useEffect(() => {
    if (!isOpen) return
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' })
      })
    })
  }, [isOpen])

  useImperativeHandle(ref, () => ({
    setIsOpen,
    startBookingFlow,
    startFlow(action: WidgetAction) {
      if (action === 'booking') startBookingFlow()
    },
    async sendMessage(text: string) {
      await handleSend(text)
    },
  }))

  useEffect(() => {
    const handler = () => {
      const w = window as Window & { __CHAT_WIDGET_PENDING_INACTIVITY__?: { ts: number } }
      delete w.__CHAT_WIDGET_PENDING_INACTIVITY__
      ;(async () => {
        try {
          const res = await triggerWebFormPause('english')
          const resAny = res as unknown as { message?: string; data?: { message?: string } }
          const text =
            typeof resAny?.message === 'string'
              ? resAny.message
              : typeof resAny?.data?.message === 'string'
                ? resAny.data.message
                : ''
          setInactivityMessage(text || undefined)
        } catch (err) {
          console.error('[ChatWidget] Failed to fetch inactivity trigger message:', err)
          setInactivityMessage(undefined)
        }
        setShowProductDwellNotification(false)
        setShowInactivitySuggestion(true)
      })()
    }

    const flushPendingInactivity = () => {
      const w = window as Window & { __CHAT_WIDGET_PENDING_INACTIVITY__?: { ts: number } }
      const pending = w.__CHAT_WIDGET_PENDING_INACTIVITY__
      if (!pending) return
      if (Date.now() - pending.ts > 30_000) {
        delete w.__CHAT_WIDGET_PENDING_INACTIVITY__
        return
      }
      delete w.__CHAT_WIDGET_PENDING_INACTIVITY__
      handler()
    }

    const productDwellHandler = (event: Event) => {
      const customEvent = event as CustomEvent<ProductDwellEventDetail>
      const productName = customEvent.detail?.productName?.trim() || 'this product'
      const dwellMs = customEvent.detail?.dwellMs ?? PRODUCT_DWELL_DELAY_MS

      if (productDwellTimeoutRef.current != null) {
        window.clearTimeout(productDwellTimeoutRef.current)
      }

      productDwellTimeoutRef.current = window.setTimeout(() => {
        setDwellProductName(productName)
        setShowInactivitySuggestion(false)
        setShowProductDwellNotification(true)
      }, dwellMs)
    }

    const webFormAbandonmentHandler = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_WEBFORM_ABANDON__?: { ts: number }
      }
      delete w.__CHAT_WIDGET_PENDING_WEBFORM_ABANDON__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(true)
    }

    const scrollIndecisionHandler = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_SCROLL_INDECISION__?: { ts: number }
      }
      delete w.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(false)
      setShowScrollIndecisionNotification(true)
    }

    const thankYouHandler = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_THANK_YOU__?: { ts: number }
      }
      delete w.__CHAT_WIDGET_PENDING_THANK_YOU__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(false)
      setShowScrollIndecisionNotification(false)
      setShowThankYouNotification(true)
    }

    const flushPendingWebFormAbandonment = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_WEBFORM_ABANDON__?: { ts: number }
      }
      const pending = w.__CHAT_WIDGET_PENDING_WEBFORM_ABANDON__
      if (!pending) return
      if (Date.now() - pending.ts > 30_000) {
        delete w.__CHAT_WIDGET_PENDING_WEBFORM_ABANDON__
        return
      }
      delete w.__CHAT_WIDGET_PENDING_WEBFORM_ABANDON__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(true)
    }

    const flushPendingScrollIndecision = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_SCROLL_INDECISION__?: { ts: number }
      }
      const pending = w.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__
      if (!pending) return
      if (Date.now() - pending.ts > 30_000) {
        delete w.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__
        return
      }
      delete w.__CHAT_WIDGET_PENDING_SCROLL_INDECISION__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(false)
      setShowScrollIndecisionNotification(true)
    }

    const flushPendingThankYou = () => {
      const w = window as Window & {
        __CHAT_WIDGET_PENDING_THANK_YOU__?: { ts: number }
      }
      const pending = w.__CHAT_WIDGET_PENDING_THANK_YOU__
      if (!pending) return
      if (Date.now() - pending.ts > 30_000) {
        delete w.__CHAT_WIDGET_PENDING_THANK_YOU__
        return
      }
      delete w.__CHAT_WIDGET_PENDING_THANK_YOU__
      setShowInactivitySuggestion(false)
      setShowProductDwellNotification(false)
      setShowWebFormAbandonmentNotification(false)
      setShowScrollIndecisionNotification(false)
      setShowThankYouNotification(true)
    }

    window.addEventListener(CHAT_WIDGET_INACTIVITY_EVENT, handler)
    window.addEventListener(CHAT_WIDGET_PRODUCT_DWELL_EVENT, productDwellHandler as EventListener)
    window.addEventListener(CHAT_WIDGET_WEBFORM_ABANDONMENT_EVENT, webFormAbandonmentHandler)
    window.addEventListener(CHAT_WIDGET_SCROLL_INDECISION_EVENT, scrollIndecisionHandler)
    window.addEventListener(CHAT_WIDGET_THANK_YOU_EVENT, thankYouHandler)
    flushPendingInactivity()
    flushPendingWebFormAbandonment()
    flushPendingScrollIndecision()
    flushPendingThankYou()
    return () => {
      window.removeEventListener(CHAT_WIDGET_INACTIVITY_EVENT, handler)
      window.removeEventListener(CHAT_WIDGET_PRODUCT_DWELL_EVENT, productDwellHandler as EventListener)
      window.removeEventListener(CHAT_WIDGET_WEBFORM_ABANDONMENT_EVENT, webFormAbandonmentHandler)
      window.removeEventListener(CHAT_WIDGET_SCROLL_INDECISION_EVENT, scrollIndecisionHandler)
      window.removeEventListener(CHAT_WIDGET_THANK_YOU_EVENT, thankYouHandler)
      if (productDwellTimeoutRef.current != null) {
        window.clearTimeout(productDwellTimeoutRef.current)
      }
    }
  }, [])

  function handleClose() {
    setIsOpen(false)
  }

  function handleOpen() {
    setIsOpen(true)
  }

  function handleButtonClick(action: string) {
    if (action === 'book_an_appointment') {
      console.log('[ChatWidget] Appointment button clicked, fetching calendar events')
      startBookingFlow()
    }
  }

  function handleGeneralChoice(option: GeneralChoiceOption) {
    if (option === 'newsletter') {
      void handleSend('subscribe')
      return
    }

    if (option === 'mobelabo') {
      const uid = `mobelabo-u-${Date.now()}`
      const aid = `mobelabo-a-${Date.now()}`
      dispatch(
        addMessage({
          id: uid,
          role: 'user',
          content: 'MÖBELABO',
          timestamp: new Date().toISOString(),
        }),
      )
      dispatch(
        addMessage({
          id: aid,
          role: 'assistant',
          content: {
            text: '',
            mobelaboWizard: {
              ...createInitialMobelaboWizardState(),
              pairedUserMessageId: uid,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      )
      return
    }

    if (option === 'search_service') {
      const uid = `search-u-${Date.now()}`
      const aid = `search-a-${Date.now()}`
      dispatch(
        addMessage({
          id: uid,
          role: 'user',
          content: 'Search Service',
          timestamp: new Date().toISOString(),
        }),
      )
      dispatch(
        addMessage({
          id: aid,
          role: 'assistant',
          content: {
            text: '',
            searchServiceWizard: {
              ...createInitialSearchServiceWizardState(),
              pairedUserMessageId: uid,
            },
          },
          timestamp: new Date().toISOString(),
        }),
      )
      return
    }

    const outgoing: Record<Exclude<GeneralChoiceOption, 'newsletter' | 'mobelabo' | 'search_service'>, string> = {
      furniture_consultation: '🎨Furniture Consultation',
    }
    void handleSend(outgoing[option])
  }

  const handleInactivityDismiss = () => setShowInactivitySuggestion(false)
  const handleProductDwellDismiss = () => setShowProductDwellNotification(false)
  const handleWebFormAbandonmentDismiss = () => setShowWebFormAbandonmentNotification(false)
  const handleScrollIndecisionDismiss = () => setShowScrollIndecisionNotification(false)
  const handleThankYouDismiss = () => setShowThankYouNotification(false)
  const handleInactivityAction = () => {
    setShowInactivitySuggestion(false)
    setIsOpen(true)
  }
  const handleProductDwellAction = () => {
    setShowProductDwellNotification(false)
    setIsOpen(true)
  }
  const handleWebFormAbandonmentAction = () => {
    setShowWebFormAbandonmentNotification(false)
    setIsOpen(true)
  }
  const handleScrollIndecisionAction = () => {
    setShowScrollIndecisionNotification(false)
    setIsOpen(true)
  }
  const handleThankYouAction = () => {
    setShowThankYouNotification(false)
    setIsOpen(true)
  }

  function handleInactivityNotificationButtonClick(actionId: string) {
    // When the user clicks the "Price Info" button in the inactivity notification,
    // automatically send a price inquiry message into the chat.
    if (actionId === 'price_info') {
      try {
        const raw = window.localStorage.getItem('cartItems')
        const parsed = raw ? JSON.parse(raw) : null

        const items = Array.isArray(parsed) ? parsed : []
        const titles = items
          .map((item: any) => item?.title)
          .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)

        const message =
          titles.length === 1
            ? `Price inquiry for product ${titles[0]}.`
            : titles.length > 1
              ? `Price inquiry for these products: ${Array.from(new Set(titles)).join(', ')}.`
              : 'Price inquiry for product.'

        handleTagClick(message)
      } catch {
        // If localStorage is unavailable or parsing fails, fall back to a generic message.
        handleTagClick('Price inquiry for product.')
      }
    }
  }

  function handleProductDwellButtonClick(actionId: string) {
    if (actionId === 'product_dwell_similar_products') {
      void handleSend(`Show me similar alternatives for ${dwellProductName}.`)
      return
    }

    if (actionId === 'product_dwell_questions') {
      void handleSend(`I have some questions about ${dwellProductName}.`)
    }
  }

  function handleWebFormAbandonmentButtonClick(actionId: string) {
    if (actionId === 'webform_need_help') {
      void handleTagClick('I need help with checkout.')
      return
    }
    if (actionId === 'webform_back_to_enquiry') {
      void handleTagClick('Take me back to product enquiry.')
    }
  }

  function handleScrollIndecisionButtonClick(actionId: string) {
    if (actionId === 'scroll_indecision_filter_assistant') {
      void handleTagClick('Help me filter this product list.')
      return
    }
    if (actionId === 'scroll_indecision_specific_search') {
      void handleTagClick('I want a specific search for product features.')
      return
    }
    if (actionId === 'scroll_indecision_inspiration') {
      void handleTagClick('Show me inspirational picks from this list.')
    }
  }

  function handleThankYouButtonClick(actionId: string) {
    if (actionId === 'thank_you_recommendations') {
      try {
        const raw = window.localStorage.getItem('cartItems')
        const parsed = raw ? JSON.parse(raw) : null
        const items = Array.isArray(parsed) ? parsed : []
        const titles = items
          .map((item: any) => item?.title)
          .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)

        const productsPart =
          titles.length === 0
            ? 'the products the customer just requested'
            : titles.length === 1
              ? `the requested product "${titles[0]}"`
              : `these requested products: ${Array.from(new Set(titles)).join(', ')}`

        const message =
          `The customer just completed a product request (${productsPart}). ` +
          'Please suggest similar or fitting objects from OPENSTORAGE, add smart cross-sell recommendations ' +
          '(for example, garden table -> garden chairs), and end with a newsletter signup offer.'

        void handleSend(message)
      } catch {
        void handleSend(
          'The customer just completed a product request. Please suggest suitable alternatives, cross-sell products, and end with a newsletter offer.',
        )
      }
    }
  }

  function handleProductSelect(messageId: string, product: MessageProductDetail) {
    setActiveProductDetails((prev) => ({ ...prev, [messageId]: product }))
  }

  function handleProductDetailBack(messageId: string) {
    setActiveProductDetails((prev) => {
      const next = { ...prev }
      delete next[messageId]
      return next
    })
  }

  async function handleWelcomeImageFiles(files: File[]) {
    if (files.length === 0 || isLoading) return
    try {
      const urls = await Promise.all(files.map((file) => uploadImageToImgBB(file)))
      await handleSend('', urls)
    } catch (err) {
      console.error('[ChatWidget] Welcome image upload failed:', err)
    }
  }

  if (!isOpen) {
    return (
      <>
        {showInactivitySuggestion && isDesktopForNotification && (
          <InactivitySuggestionNotification
            visible
            variant="desktop"
            message={inactivityMessage}
            onNotificationButtonClick={handleInactivityNotificationButtonClick}
            onDismiss={handleInactivityDismiss}
            onAction={handleInactivityAction}
          />
        )}
        {showProductDwellNotification && isDesktopForNotification && (
          <ProductDwellNotification
            visible
            variant="desktop"
            productName={dwellProductName}
            onButtonClick={handleProductDwellButtonClick}
            onDismiss={handleProductDwellDismiss}
            onAction={handleProductDwellAction}
          />
        )}
        {showWebFormAbandonmentNotification && isDesktopForNotification && (
          <WebFormAbandonmentNotification
            visible
            variant="desktop"
            onButtonClick={handleWebFormAbandonmentButtonClick}
            onDismiss={handleWebFormAbandonmentDismiss}
            onAction={handleWebFormAbandonmentAction}
          />
        )}
        {showThankYouNotification && isDesktopForNotification && (
          <ThankYouNotification
            visible
            variant="desktop"
            onButtonClick={handleThankYouButtonClick}
            onDismiss={handleThankYouDismiss}
            onAction={handleThankYouAction}
          />
        )}
        {showScrollIndecisionNotification && isDesktopForNotification && (
          <ScrollIndecisionNotification
            visible
            variant="desktop"
            onButtonClick={handleScrollIndecisionButtonClick}
            onDismiss={handleScrollIndecisionDismiss}
            onAction={handleScrollIndecisionAction}
          />
        )}
        <ChatWidgetButton onOpen={handleOpen} />
      </>
    )
  }

  return (
    <>
      {showInactivitySuggestion && isDesktopForNotification && (
        <InactivitySuggestionNotification
          visible
          variant="desktop"
          message={inactivityMessage}
          onNotificationButtonClick={handleInactivityNotificationButtonClick}
          onDismiss={handleInactivityDismiss}
          onAction={handleInactivityAction}
        />
      )}
      {showProductDwellNotification && isDesktopForNotification && (
        <ProductDwellNotification
          visible
          variant="desktop"
          productName={dwellProductName}
          onButtonClick={handleProductDwellButtonClick}
          onDismiss={handleProductDwellDismiss}
          onAction={handleProductDwellAction}
        />
      )}
      {showWebFormAbandonmentNotification && isDesktopForNotification && (
        <WebFormAbandonmentNotification
          visible
          variant="desktop"
          onButtonClick={handleWebFormAbandonmentButtonClick}
          onDismiss={handleWebFormAbandonmentDismiss}
          onAction={handleWebFormAbandonmentAction}
        />
      )}
      {showThankYouNotification && isDesktopForNotification && (
        <ThankYouNotification
          visible
          variant="desktop"
          onButtonClick={handleThankYouButtonClick}
          onDismiss={handleThankYouDismiss}
          onAction={handleThankYouAction}
        />
      )}
      {showScrollIndecisionNotification && isDesktopForNotification && (
        <ScrollIndecisionNotification
          visible
          variant="desktop"
          onButtonClick={handleScrollIndecisionButtonClick}
          onDismiss={handleScrollIndecisionDismiss}
          onAction={handleScrollIndecisionAction}
        />
      )}
      <Card
        className={cn(
          'fixed z-50 flex flex-col shadow-2xl shadow-border border-[0.85px] border-border sm:border-border',
          // Mobile: Full width overlay, ~90vh height, slides from bottom
          'bottom-0 left-0 right-0 w-full h-[90vh] max-h-[90vh] rounded-t-[24px]',
          'animate-in slide-in-from-bottom duration-300',
          // Desktop: Full-height popup bottom-right
          'sm:bottom-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[30rem] sm:h-screen sm:max-h-none sm:rounded-none sm:rounded-l-lg',
          // Wide desktop: Full-height right sidebar, fixed to 25% width
          'min-[1600px]:right-0 min-[1600px]:bottom-0 min-[1600px]:top-0 min-[1600px]:h-screen min-[1600px]:w-[25vw] min-[1600px]:max-h-none min-[1600px]:rounded-l-lg',
        )}
      >
        <ChatWidgetHeader
          hasMessages={messages.length > 0}
          isInOverlayFlow={flow.state === 'reservation_flow' && !!flow.step}
          onBack={handleBack}
          onClose={handleClose}
        />

        {/* Messages Area */}
        {flow.state === 'reservation_flow' && flow.step ? (
          <div className="flex-1 flex items-end justify-center p-3 sm:p-4 min-h-0">
            <div className="w-full max-w-full">
              <ReservationFlow
                step={flow.step as ReservationStep}
                data={reservationData}
                onDateSelect={handleDateSelect}
                onTimeSelect={handleTimeSelect}
                onFormSubmit={handleFormSubmit}
              />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <WelcomeScreen
            onTagClick={handleTagClick}
            onWelcomeImageFiles={handleWelcomeImageFiles}
            isBusy={isLoading}
          />
        ) : (
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-3 pb-1 lg:p-4 lg:pb-2 space-y-4 min-w-0 overflow-visible relative">
              {/* Gradient shadow at top of messages (sticky) */}
              <div
                className="sticky top-0 -mt-3 -mx-4 pt-0 px-4 h-6 flex-shrink-0 pointer-events-none z-10"
                style={{
                  background:
                    'linear-gradient(color-mix(in srgb, var(--color-text-muted) 50%, transparent) 0%, color-mix(in srgb, var(--color-text-muted) 20%, transparent) 35%, transparent 70%)',
                }}
              />
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  onButtonClick={handleButtonClick}
                  onProductSelect={handleProductSelect}
                  onProductDetailBack={handleProductDetailBack}
                  onStartBooking={startBookingFlow}
                  isProductDetailActive={activeProductDetails[message.id] != null}
                  productDetailOverride={activeProductDetails[message.id]}
                  isNewMessage={index >= (initialMessageCountRef.current ?? 0)}
                  onNewsletterSubscribe={(email) => subscribeToNewsletter(email)}
                  onGeneralChoiceSelect={handleGeneralChoice}
                />
              ))}

              <div className="min-h-[20px] flex items-center">
                {isLoading && (
                  <div
                    key={statusMessage || 'thinking'}
                    className="inline-flex items-center gap-2 text-xs text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                  >
                    <span className="flex gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/70 animate-bounce" />
                    </span>
                    <span>{statusMessage || 'Thinking...'}</span>
                  </div>
                )}
              </div>

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        )}

        {/* Inactivity suggestion (mobile: in bottom panel) */}
        {showInactivitySuggestion && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <InactivitySuggestionNotification
              visible
              variant="mobile"
              message={inactivityMessage}
              onNotificationButtonClick={handleInactivityNotificationButtonClick}
              onDismiss={handleInactivityDismiss}
              onAction={handleInactivityAction}
            />
          </div>
        )}
        {showProductDwellNotification && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <ProductDwellNotification
              visible
              variant="mobile"
              productName={dwellProductName}
              onButtonClick={handleProductDwellButtonClick}
              onDismiss={handleProductDwellDismiss}
              onAction={handleProductDwellAction}
            />
          </div>
        )}
        {showWebFormAbandonmentNotification && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <WebFormAbandonmentNotification
              visible
              variant="mobile"
              onButtonClick={handleWebFormAbandonmentButtonClick}
              onDismiss={handleWebFormAbandonmentDismiss}
              onAction={handleWebFormAbandonmentAction}
            />
          </div>
        )}
        {showThankYouNotification && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <ThankYouNotification
              visible
              variant="mobile"
              onButtonClick={handleThankYouButtonClick}
              onDismiss={handleThankYouDismiss}
              onAction={handleThankYouAction}
            />
          </div>
        )}
        {showScrollIndecisionNotification && !isDesktopForNotification && (
          <div className="flex-shrink-0 px-3 pb-1 sm:px-4">
            <ScrollIndecisionNotification
              visible
              variant="mobile"
              onButtonClick={handleScrollIndecisionButtonClick}
              onDismiss={handleScrollIndecisionDismiss}
              onAction={handleScrollIndecisionAction}
            />
          </div>
        )}

        {/* Input Area */}
        <ChatInputBar
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
        />
      </Card>
    </>
  )
})

ChatWidget.displayName = 'ChatWidget'

export default ChatWidget

