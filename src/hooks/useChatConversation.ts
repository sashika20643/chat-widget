import { useState, useCallback } from 'react'
import type React from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addMessage, updateMessage } from '@/store/slices/chatSlice'
import { getOrCreateUserId } from '@/utils/userId'
import {
  detectScenario,
  NEWSLETTER_ASSISTANT_MESSAGE,
  parseSubscribeSubAction,
  sendChatMessageStream,
} from '@/services/chatApi'
import type { Message as MessageType, MessageContent } from '@/types/chat'
import {
  createInitialAuthLoginWizardState,
  createInitialAuthRegisterWizardState,
  createInitialMobelaboWizardState,
  createInitialSearchServiceWizardState,
} from '@/types/chat'
import { detectAuthKeywordIntent } from '@/utils/authKeyword'

const createUserMessage = (content: string | MessageContent): MessageType => ({
  id: Date.now().toString(),
  content,
  role: 'user',
  timestamp: new Date().toISOString(),
})

const createAssistantMessage = (content: MessageType['content']): MessageType => ({
  id: (Date.now() + 1).toString(),
  content,
  role: 'assistant',
  timestamp: new Date().toISOString(),
})

function isNewsletterStreamAction(action: string | undefined): boolean {
  if (!action) return false
  const n = action.toString().toLowerCase().replace(/-/g, '_').trim()
  return n === 'newsletter' || n === 'news_letter' || n.includes('newsletter')
}

function isGeneralChoiceStreamAction(action: string | undefined): boolean {
  if (!action) return false
  const n = action.toString().toLowerCase().replace(/-/g, '_').trim()
  return n === 'general_choice' || n.includes('general_choice')
}

function normalizeStreamAction(action: string | undefined): string {
  return action?.toString().toLowerCase().replace(/-/g, '_').trim() ?? ''
}

interface UseChatConversationOptions {
  startBookingFlow: () => void
  threadId: string | null
  setThreadId: (id: string | null) => void
  onSendMessage?: (text: string) => void
  onBeforeInteraction?: () => void
}

export function useChatConversation({
  startBookingFlow,
  threadId,
  setThreadId,
  onSendMessage,
  onBeforeInteraction,
}: UseChatConversationOptions) {
  const dispatch = useAppDispatch()
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [statusMessage, setStatusMessage] = useState<string | null>(null)

  const sendChatOrScenarioMessage = useCallback(
    async (text: string, imageUrls?: string[]) => {
      const userId = getOrCreateUserId()
      let assistantMsgId: string | null = null
      let accumulatedText = ''
      const startTime = performance.now()

      try {
        await sendChatMessageStream(
          userId,
          text,
          {
            onChunk: (chunk) => {
              // Once we start receiving actual text, clear any transient status.
              if (statusMessage) setStatusMessage(null)
              accumulatedText += chunk
              if (!assistantMsgId) {
                const msg = createAssistantMessage({ text: accumulatedText })
                assistantMsgId = msg.id
                dispatch(addMessage(msg))
              } else {
                dispatch(updateMessage({ id: assistantMsgId, content: { text: accumulatedText } }))
              }
            },
            onConnected: (tid) => setThreadId(tid),
            onStatus: (status) => {
              setStatusMessage(status)
            },
            onDone: (meta) => {
              // Streaming is finished; clear status.
              setStatusMessage(null)
              const responseTimeMs = Math.round(performance.now() - startTime)
              if (meta?.thread_id) setThreadId(meta.thread_id)
              if (assistantMsgId) {
                const updates: {
                  text: string
                  productIds?: string[]
                  buttons?: MessageContent['buttons']
                  newsletterSignup?: boolean
                  generalChoiceMenu?: boolean
                  mobelaboWizard?: MessageContent['mobelaboWizard']
                  searchServiceWizard?: MessageContent['searchServiceWizard']
                } = { text: accumulatedText }
                if (meta?.product_ids && meta.product_ids.length > 0) {
                  updates.productIds = meta.product_ids
                }
                const actionNorm = normalizeStreamAction(meta?.action)
                if (actionNorm === 'subscribe') {
                  const sub = parseSubscribeSubAction(
                    meta?.subscription_type ?? meta?.sub_action,
                  )
                  if (sub === 'newsletter') {
                    updates.newsletterSignup = true
                  } else if (sub === 'moebelabo') {
                    updates.mobelaboWizard = createInitialMobelaboWizardState()
                  } else if (sub === 'search_service') {
                    updates.searchServiceWizard = createInitialSearchServiceWizardState()
                  } else if (sub === 'all') {
                    updates.generalChoiceMenu = true
                  }
                } else {
                  if (actionNorm === 'appointment') {
                    updates.buttons = [{ label: 'Book an appointment', variant: 'black' }]
                  }
                  if (isNewsletterStreamAction(meta?.action)) {
                    updates.newsletterSignup = true
                  }
                  if (isGeneralChoiceStreamAction(meta?.action)) {
                    updates.generalChoiceMenu = true
                  }
                }
                if (updates.newsletterSignup) {
                  updates.text = NEWSLETTER_ASSISTANT_MESSAGE
                }
                dispatch(
                  updateMessage({
                    id: assistantMsgId,
                    content: updates,
                    responseTimeMs,
                  })
                )
              }
            },
            onError: () => {},
          },
          threadId,
          imageUrls
        )
      } catch {
        const response = await detectScenario(text)
        if (!assistantMsgId) {
          dispatch(addMessage(createAssistantMessage(response.message)))
        } else {
          dispatch(updateMessage({ id: assistantMsgId, content: response.message }))
        }
      }
    },
    [dispatch, setThreadId, startBookingFlow, threadId, statusMessage],
  )

  const handleSend = useCallback(async (textOverride?: string, imageUrls?: string[]) => {
    const trimmed = (textOverride ?? inputValue).trim()
    const hasImages = (imageUrls?.length ?? 0) > 0

    if (!trimmed && !hasImages) return

    const authIntent = !hasImages ? detectAuthKeywordIntent(trimmed) : null
    if (authIntent) {
      onBeforeInteraction?.()
      const userMessage = createUserMessage(trimmed)
      dispatch(addMessage(userMessage))
      setInputValue('')
      if (authIntent === 'register') {
        dispatch(
          addMessage(
            createAssistantMessage({
              text: 'Here’s your registration form.',
              authRegisterWizard: createInitialAuthRegisterWizardState(),
            }),
          ),
        )
      } else {
        dispatch(
          addMessage(
            createAssistantMessage({
              text: 'Sign in with your email — we will send you a magic link.',
              authLoginWizard: createInitialAuthLoginWizardState(),
            }),
          ),
        )
      }
      onSendMessage?.(trimmed)
      return
    }

    onBeforeInteraction?.()

    const userContent: MessageType['content'] = hasImages
      ? {
          ...(trimmed ? { text: trimmed } : {}),
          images: (imageUrls ?? []).map((src) => ({ src })),
        }
      : trimmed

    const userMessage = createUserMessage(userContent)
    dispatch(addMessage(userMessage))

    setInputValue('')
    setIsLoading(true)

    const apiText = trimmed || (hasImages ? 'Image attachment' : '')
    await sendChatOrScenarioMessage(apiText, imageUrls)

    setIsLoading(false)
    onSendMessage?.(apiText)
  }, [dispatch, inputValue, onBeforeInteraction, onSendMessage, sendChatOrScenarioMessage])

  const handleTagClick = useCallback(
    async (tag: string) => {
      const lowerTag = tag.toLowerCase()
      if (lowerTag.includes('book') || lowerTag.includes('timeslot')) {
        startBookingFlow()
        return
      }

      const authIntent = detectAuthKeywordIntent(tag)
      if (authIntent) {
        onBeforeInteraction?.()
        const userMessage = createUserMessage(tag)
        dispatch(addMessage(userMessage))
        if (authIntent === 'register') {
          dispatch(
            addMessage(
              createAssistantMessage({
                text: 'Here’s your registration form.',
                authRegisterWizard: createInitialAuthRegisterWizardState(),
              }),
            ),
          )
        } else {
          dispatch(
            addMessage(
              createAssistantMessage({
                text: 'Sign in with your email — we will send you a magic link.',
                authLoginWizard: createInitialAuthLoginWizardState(),
              }),
            ),
          )
        }
        onSendMessage?.(tag)
        return
      }

      onBeforeInteraction?.()

      const userMessage = createUserMessage(tag)
      dispatch(addMessage(userMessage))
      setIsLoading(true)

      await sendChatOrScenarioMessage(tag)

      setIsLoading(false)
      onSendMessage?.(tag)
    },
    [dispatch, onBeforeInteraction, onSendMessage, sendChatOrScenarioMessage, startBookingFlow],
  )

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault()
        void handleSend()
      }
    },
    [handleSend],
  )

  return {
    inputValue,
    setInputValue,
    isLoading,
    statusMessage,
    handleSend,
    handleTagClick,
    handleKeyDown,
  }
}

