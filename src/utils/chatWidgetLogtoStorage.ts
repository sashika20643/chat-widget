import type { IdTokenClaims } from '@logto/react'
import { getWidgetBrowserStorage, setWidgetBrowserStorage } from '@/utils/widgetBrowserStorage'

/** ID token claims after Logto sign-in (magic link → callback). */
const STORAGE_KEY_CLAIMS = 'chatWidget_logtoIdTokenClaims'

export function saveLogtoUserDetails(claims: IdTokenClaims): void {
  setWidgetBrowserStorage(STORAGE_KEY_CLAIMS, JSON.stringify(claims))
}

export function getLogtoUserDetailsFromStorage(): IdTokenClaims | null {
  try {
    const raw = getWidgetBrowserStorage(STORAGE_KEY_CLAIMS)
    if (!raw) return null
    return JSON.parse(raw) as IdTokenClaims
  } catch {
    return null
  }
}

export function clearLogtoUserDetailsStorage(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(STORAGE_KEY_CLAIMS)
  } catch {
    // ignore
  }
  try {
    window.sessionStorage.removeItem(STORAGE_KEY_CLAIMS)
  } catch {
    // ignore
  }
}
