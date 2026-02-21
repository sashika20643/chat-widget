import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { Message as MessageType, MessageContent } from '@/types/chat'

/** Serializable message for Redux/localStorage (timestamp as ISO string) */
export interface SerializedMessage {
  id: string
  content: string | MessageContent
  role: 'user' | 'assistant'
  timestamp: string
}

function toSerialized(m: MessageType): SerializedMessage {
  return {
    ...m,
    timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : (m.timestamp as string),
  }
}

export function toMessage(m: SerializedMessage): MessageType {
  return {
    ...m,
    timestamp: new Date(m.timestamp),
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
    setMessages(state, action: PayloadAction<MessageType[]>) {
      state.messages = action.payload.map(toSerialized)
    },
    clearMessages(state) {
      state.messages = []
    },
  },
})

export const { addMessage, setMessages, clearMessages } = chatSlice.actions
export default chatSlice.reducer
