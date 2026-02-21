import { useAppSelector } from '@/store/hooks'
import { toMessage } from '@/store/slices/chatSlice'
import type { Message } from '@/types/chat'

/**
 * Returns chat messages from Redux, with timestamps restored to Date.
 */
export function useChatMessages(): Message[] {
  const serialized = useAppSelector((state) => state.chat.messages)
  return serialized.map(toMessage)
}
