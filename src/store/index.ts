import { configureStore } from '@reduxjs/toolkit'
import calendarEventsReducer from './slices/calendarEventsSlice'
import { localStorageMiddleware, loadStateFromLocalStorage } from './localStorageMiddleware'

const preloadedState = loadStateFromLocalStorage()

export const store = configureStore({
  reducer: {
    calendarEvents: calendarEventsReducer,
  },
  ...(preloadedState && { preloadedState }),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware) as any,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
