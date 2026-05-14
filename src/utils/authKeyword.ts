/**
 * Detects login / register intent from free text without calling any API.
 * Matches whole words or common sign-in / sign-up phrases.
 */
export function detectAuthKeywordIntent(text: string): 'login' | 'register' | null {
  const t = text.trim()
  if (!t) return null
  if (/\bregister\b|\bsign[\s-]*up\b/i.test(t)) return 'register'
  if (/\blogin\b|\bsign[\s-]*in\b/i.test(t)) return 'login'
  return null
}
