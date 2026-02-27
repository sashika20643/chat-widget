import { useState, useCallback } from 'react'
import type React from 'react'
import { useAppDispatch } from '@/store/hooks'
import { addMessage } from '@/store/slices/chatSlice'
import { getOrCreateUserId } from '@/utils/userId'
import {
  sendChatMessage,
  chatResponseToMessageContent,
  detectScenario,
} from '@/services/chatApi'
import type { Message as MessageType } from '@/types/chat'

const createUserMessage = (content: string): MessageType => ({
  id: Date.now().toString(),
  content,
  role: 'user',
  timestamp: new Date(),
})

const createAssistantMessage = (content: MessageType['content']): MessageType => ({
  id: (Date.now() + 1).toString(),
  content,
  role: 'assistant',
  timestamp: new Date(),
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

  const sendChatOrScenarioMessage = useCallback(
    async (text: string) => {
      const userId = getOrCreateUserId()

      try {
        const response = await sendChatMessage(userId, text, threadId)
        setThreadId(response.thread_id ?? null)

        let content = chatResponseToMessageContent(response)

        if (response.action?.toLowerCase() === 'appointment') {
          content = {
            ...content,
            buttons: [
              { label: 'Book an appointment', onClick: startBookingFlow, variant: 'black' as const },
            ],
          }
        }

        dispatch(addMessage(createAssistantMessage(content)))
      } catch {
        const response = await detectScenario(text)
        dispatch(addMessage(createAssistantMessage(response.message)))
      }
    },
    [dispatch, setThreadId, startBookingFlow, threadId],
  )

  const handleSend = useCallback(async () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    onBeforeInteraction?.()

    const userMessage = createUserMessage(trimmed)
    dispatch(addMessage(userMessage))

    setInputValue('')
    setIsLoading(true)

    await sendChatOrScenarioMessage(trimmed)

    setIsLoading(false)
    onSendMessage?.(trimmed)
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
    handleSend,
    handleTagClick,
    handleKeyDown,
  }
}

