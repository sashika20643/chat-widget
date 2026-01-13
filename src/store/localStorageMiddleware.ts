import type { Middleware } from '@reduxjs/toolkit'

const STORAGE_KEY = 'chat-widget-redux-state'

export const localStorageMiddleware: Middleware = (store) => (next) => (action: unknown) => {
  const typedAction = action as { type?: string }
  console.log('[Redux] Action dispatched:', typedAction.type, action)
  
  const result = next(action)
  
  const state = store.getState()
  console.log('[Redux] State after action:', state)
  
  try {
    const serializedState = JSON.stringify(state)
    localStorage.setItem(STORAGE_KEY, serializedState)
    console.log('[Redux] State saved to localStorage')
  } catch (error) {
    console.error('[Redux] Error saving to localStorage:', error)
  }
  
  return result
}

export function loadStateFromLocalStorage(): any {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY)
    if (serializedState === null) {
      console.log('[Redux] No saved state found in localStorage')
      return undefined
    }
    const state = JSON.parse(serializedState)
    console.log('[Redux] State loaded from localStorage:', state)
    return state
  } catch (error) {
    console.error('[Redux] Error loading from localStorage:', error)
    return undefined
  }
}

