import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Message as MessageType, MessageContent } from '@/types/chat'

/** Serializable message for Redux/localStorage (timestamp as ISO string) */
export interface SerializedMessage {
  id: string
  content: string | MessageContent
  role: 'user' | 'assistant'
  timestamp: string
  responseTimeMs?: number
}

function toSerialized(m: MessageType): SerializedMessage {
  return {
    ...m,
    timestamp: m.timestamp,
  }
}

export function toMessage(m: SerializedMessage): MessageType {
  return {
    ...m,
    timestamp: m.timestamp,
  }
}

export interface ChatState {
  messages: SerializedMessage[]
}

const initialState: ChatState = {
  messages: [],
}

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage(state, action: PayloadAction<MessageType>) {
      state.messages.push(toSerialized(action.payload))
    },
    updateMessage(state, action: PayloadAction<{ id: string; content?: MessageType['content']; responseTimeMs?: number }>) {
      const msg = state.messages.find((m) => m.id === action.payload.id)
      if (msg) {
        if (action.payload.content !== undefined) msg.content = action.payload.content
        if (action.payload.responseTimeMs !== undefined) msg.responseTimeMs = action.payload.responseTimeMs
      }
    },
    setMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload.map(toSerialized)
    },
    clearMessages(state) {
      state.messages = []
    },
    removeMessages(state, action: PayloadAction<{ ids: string[] }>) {
      const drop = new Set(action.payload.ids)
      state.messages = state.messages.filter((m) => !drop.has(m.id))
    },
  },
})

export const { addMessage, updateMessage, setMessages, clearMessages, removeMessages } = chatSlice.actions
export default chatSlice.reducer
