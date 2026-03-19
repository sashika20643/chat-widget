import { useState, useCallback } from 'react'
import type React from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addMessage, updateMessage } from '@/store/slices/chatSlice'
import { getOrCreateUserId } from '@/utils/userId'
import { sendChatMessageStream, detectScenario } from '@/services/chatApi'
import type { Message as MessageType, MessageContent } from '@/types/chat'

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
                const updates: { text: string; productIds?: string[]; buttons?: MessageContent['buttons'] } = { text: accumulatedText }
                if (meta?.product_ids && meta.product_ids.length > 0) {
                  updates.productIds = meta.product_ids
                }
                if (meta?.action === 'appointment') {
                  updates.buttons = [{ label: 'Book an appointment', variant: 'black' }]
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

