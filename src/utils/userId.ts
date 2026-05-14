const STORAGE_KEY = 'chat_widget_user_id'

/**
 * Generates a random email-style string to use as anonymous user id.
 * Stored in localStorage so the same browser/user keeps the same id.
 */
function generateRandomUserId(): string {
  const part = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
  return `guest-${part}@chat.widget`
}

/**
 * Returns the current user id from localStorage, or creates one (random email)
 * and stores it for future visits.
 */
export function getOrCreateUserId(): string {
  if (typeof window === 'undefined' || !window.localStorage) {
    return generateRandomUserId()
  }
  try {
    let id = window.localStorage.getItem(STORAGE_KEY)
    if (!id || !id.trim()) {
      id = generateRandomUserId()
      window.localStorage.setItem(STORAGE_KEY, id)
    }
    return id
  } catch {
    return generateRandomUserId()
  }
}
