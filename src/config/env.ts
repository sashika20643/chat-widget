/**
 * Central place for Vite env reads used by API/services.
 * Defaults match previous inline `import.meta.env` fallbacks.
 */

function viteEnv(): ImportMetaEnv | undefined {
  return typeof import.meta !== 'undefined' ? import.meta.env : undefined
}

const e = viteEnv()

/** Chat agent origin (POST /api/chat). */
export const CHAT_API_BASE_URL =
  (e?.VITE_CHAT_API_BASE_URL as string | undefined) || 'https://getagent-chat-agent.ceilu9.easypanel.host'

/** Full URL for SSE chat stream. */
export const CHAT_STREAM_API_URL =
  (e?.VITE_CHAT_STREAM_API_URL as string | undefined) ||
  'https://getagent-chat-agent.ceilu9.easypanel.host/api/chat/stream'

/** Objects API (product details by FCA IDs). */
export const OBJECTS_API_URL =
  (e?.VITE_OBJECTS_API_URL as string | undefined) ||
  'https://getbutik-base-getbutik-db-service.ceilu9.easypanel.host/api/chat_bot/objects'

/**
 * Getbutik / backend origin: relative image paths and REST routes under this host
 * (e.g. `/api/auth/*`, `/api/chat_bot/subscription/create`).
 */
export const IMAGE_BASE_URL =
  (e?.VITE_IMAGE_BASE_URL as string | undefined) ||
  'https://getbutik-base-getbutik-db-service.ceilu9.easypanel.host'

/** Optional legacy newsletter capture POST URL; empty if unset. */
export function getNewsletterLegacyApiUrl(): string {
  const raw = e?.VITE_NEWSLETTER_API_URL != null ? String(e.VITE_NEWSLETTER_API_URL).trim() : ''
  return raw
}

/** Magic-link redirect target (must match app route). */
export const LOGTO_MAGIC_LINK_REDIRECT_URL =
  (e?.VITE_LOGTO_MAGIC_LINK_REDIRECT_URL as string | undefined) ?? 'http://localhost:5173/auth/magic-link'

const IMGBB_API_KEY_FALLBACK = 'ea6f97236e17aead3ade5fe286837cfb'

export const IMGBB_API_KEY = (e?.VITE_IMGBB_API_KEY as string | undefined) ?? IMGBB_API_KEY_FALLBACK

/** Calendar / email agent API (grouped events, create event). Override with `VITE_CALENDAR_API_BASE_URL`. */
export const CALENDAR_API_BASE_URL =
  (e?.VITE_CALENDAR_API_BASE_URL as string | undefined) ||
  'https://getagent-email-agent-server.ceilu9.easypanel.host'
