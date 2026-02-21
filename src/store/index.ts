import { configureStore } from '@reduxjs/toolkit'
import calendarEventsReducer from './slices/calendarEventsSlice'
import chatReducer, { type ChatState } from './slices/chatSlice'
import { localStorageMiddleware, loadStateFromLocalStorage } from './localStorageMiddleware'

const defaultChatState: ChatState = { messages: [] }
const rawPreloaded = loadStateFromLocalStorage()
const preloadedState =
  rawPreloaded && typeof rawPreloaded === 'object'
    ? { ...rawPreloaded, chat: rawPreloaded.chat ?? defaultChatState }
    : undefined

export const store = configureStore({
  reducer: {
    calendarEvents: calendarEventsReducer,
    chat: chatReducer,
  },
  ...(preloadedState && { preloadedState }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware) as any,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
