import { useAppSelector } from '@/store/hooks'
import { toMessage } from '@/store/slices/chatSlice'
import type { Message } from '@/types/chat'

/**
 * Returns chat messages from Redux (timestamp already serializable).
 */
export function useChatMessages(): Message[] {
  const serialized = useAppSelector((state) => state.chat.messages)
  return serialized.map(toMessage)
}
