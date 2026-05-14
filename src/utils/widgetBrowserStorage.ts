/**
 * Prefer localStorage; fall back to sessionStorage when quota / private mode blocks writes.
 * Same keys so reads can land in either store.
 */
export function setWidgetBrowserStorage(key: string, value: string): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, value)
    return
  } catch {
    // quota / disabled
  }
  try {
    window.sessionStorage.setItem(key, value)
  } catch {
    // ignore
  }
}

export function getWidgetBrowserStorage(key: string): string | null {
  if (typeof window === 'undefined') return null
  try {
    const fromLocal = window.localStorage.getItem(key)
    if (fromLocal != null) return fromLocal
  } catch {
    // ignore
  }
  try {
    return window.sessionStorage.getItem(key)
  } catch {
    return null
  }
}
