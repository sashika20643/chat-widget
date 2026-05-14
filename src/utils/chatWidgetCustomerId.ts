import { getLogtoUserDetailsFromStorage } from '@/utils/chatWidgetLogtoStorage'
import { getWidgetBrowserStorage, setWidgetBrowserStorage } from '@/utils/widgetBrowserStorage'

/** Host / embed may persist signed-in customer payload under this key. */
export const CHAT_WIDGET_CUSTOMER_DETAIL_KEY = 'chatWidget_customerDetail'

/** @deprecated Use {@link CHAT_WIDGET_CUSTOMER_DETAIL_KEY} (singular). */
export const CHAT_WIDGET_CUSTOMER_DETAILS_KEY = CHAT_WIDGET_CUSTOMER_DETAIL_KEY

/** Parsed shape from `chatWidget_customerDetail` (see host / embed). */
export interface ChatWidgetCustomerDetails {
  email?: string
  name?: string | null
  first_name?: string | null
  zip?: string | null
  customer_id?: number | string
  customerId?: number | string
  /** FCA UUID for the customer (not the numeric API `customerId`). */
  fca_customer_id?: string
  logto_user_id?: string
  /** FCA shop UUID for the current session (e.g. BOGEN33). */
  shop_id?: string
}

function parseNumericId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const t = value.trim()
    if (/^\d+$/.test(t)) return parseInt(t, 10)
  }
  return null
}

/** Keys that may hold the numeric customer id (any casing on read). */
const CUSTOMER_ID_KEY_NAMES = new Set([
  'customerid',
  'customer_id',
  'memberid',
  'member_id',
  'userid',
  'user_id',
])

function extractCustomerIdFromObjectShallow(o: Record<string, unknown>): number | null {
  for (const [key, value] of Object.entries(o)) {
    const lower = key.toLowerCase()
    if (CUSTOMER_ID_KEY_NAMES.has(lower)) {
      const n = parseNumericId(value)
      if (n != null) return n
    }
  }
  return null
}

function extractCustomerIdFromObject(o: Record<string, unknown>, depth = 0): number | null {
  if (depth > 6) return null

  const shallow = extractCustomerIdFromObjectShallow(o)
  if (shallow != null) return shallow

  const direct = parseNumericId(o.id)
  if (direct != null) return direct

  for (const k of ['customer', 'user', 'profile', 'data', 'result', 'payload'] as const) {
    const n = o[k]
    if (n && typeof n === 'object' && !Array.isArray(n)) {
      const inner = extractCustomerIdFromObject(n as Record<string, unknown>, depth + 1)
      if (inner != null) return inner
    }
  }
  return null
}

function unwrapJsonValue(parsed: unknown): unknown {
  let v: unknown = parsed
  let guard = 0
  while (typeof v === 'string' && guard++ < 3) {
    try {
      v = JSON.parse(v) as unknown
    } catch {
      break
    }
  }
  return v
}

function readCustomerDetailsJson(raw: string | null): unknown {
  if (!raw) return null
  try {
    return unwrapJsonValue(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

function tryLocalStorageItem(key: string): string | null {
  return getWidgetBrowserStorage(key)
}

function tryParentLocalStorageItem(key: string): string | null {
  try {
    if (window.parent !== window) {
      return window.parent.localStorage.getItem(key)
    }
  } catch {
    // cross-origin iframe: parent storage not readable
  }
  return null
}

function parseCustomerDetailsFromStorage(): unknown {
  const raw = tryLocalStorageItem(CHAT_WIDGET_CUSTOMER_DETAIL_KEY) ?? tryParentLocalStorageItem(CHAT_WIDGET_CUSTOMER_DETAIL_KEY)
  return readCustomerDetailsJson(raw)
}

/**
 * Raw object from `chatWidget_customerDetail` (localStorage, same window or parent).
 */
export function getChatWidgetCustomerDetailsFromStorage(): ChatWidgetCustomerDetails | null {
  if (typeof window === 'undefined') return null
  const parsed = parseCustomerDetailsFromStorage()
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as ChatWidgetCustomerDetails
  }
  return null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** `shop_id` from customer details when it is a UUID string (matches your host payload). */
export function getStoredSubscriptionShopId(): string | null {
  const o = getChatWidgetCustomerDetailsFromStorage()
  if (!o) return null
  const raw = o.shop_id
  if (typeof raw !== 'string') return null
  const sid = raw.trim()
  return UUID_RE.test(sid) ? sid : null
}

/**
 * Numeric API customer id: explicit `customer_id` / `customerId` on
 * `chatWidget_customerDetail`, then generic scan, then Logto claims.
 */
export function getStoredCustomerId(): number | null {
  if (typeof window === 'undefined') return null

  const details = getChatWidgetCustomerDetailsFromStorage()
  if (details) {
    const explicit =
      parseNumericId(details.customer_id) ??
      parseNumericId(details.customerId) ??
      extractCustomerIdFromObject(details as Record<string, unknown>)
    if (explicit != null) return explicit
  }

  const claims = getLogtoUserDetailsFromStorage()
  if (!claims) return null
  return extractCustomerIdFromObject(claims as Record<string, unknown>)
}

/**
 * Merge fields into `chatWidget_customerDetail` (preserves existing keys unless overwritten).
 * Called after magic-link callback so the widget has email / logto_user_id without relying on the host page alone.
 */
export function mergeChatWidgetCustomerDetail(partial: Partial<ChatWidgetCustomerDetails>): void {
  try {
    const existing = getChatWidgetCustomerDetailsFromStorage() ?? {}
    const next: Record<string, unknown> = { ...(existing as Record<string, unknown>) }
    for (const [key, value] of Object.entries(partial)) {
      if (value !== undefined) {
        next[key] = value
      }
    }
    setWidgetBrowserStorage(CHAT_WIDGET_CUSTOMER_DETAIL_KEY, JSON.stringify(next))
  } catch {
    // quota / private mode
  }
}

/**
 * Map OIDC ID token claims + `/me` userinfo into `chatWidget_customerDetail`.
 * Custom claims (`customer_id`, `shop_id`, etc.) are copied when present on either source.
 */
export function applyLogtoSessionToCustomerDetail(
  claims?: Record<string, unknown> | null,
  userInfo?: Record<string, unknown> | null,
): void {
  const partial: Partial<ChatWidgetCustomerDetails> = {}
  const sources = [claims, userInfo].filter((x): x is Record<string, unknown> => Boolean(x && typeof x === 'object'))

  for (const src of sources) {
    if (typeof src.sub === 'string' && partial.logto_user_id == null) partial.logto_user_id = src.sub
    if (typeof src.email === 'string' && partial.email == null) partial.email = src.email
    if (typeof src.name === 'string' && partial.name == null) partial.name = src.name
    if (typeof src.given_name === 'string' && partial.first_name == null) partial.first_name = src.given_name
    if (typeof src.first_name === 'string' && partial.first_name == null) partial.first_name = src.first_name

    const cid = src.customer_id ?? src.customerId
    if (partial.customer_id == null && cid !== undefined && cid !== null) {
      const n = parseNumericId(cid)
      if (n != null) partial.customer_id = n
    }

    const fca = src.fca_customer_id ?? src.fcaCustomerId
    if (typeof fca === 'string' && partial.fca_customer_id == null) partial.fca_customer_id = fca

    const sid = src.shop_id ?? src.shopId
    if (typeof sid === 'string' && partial.shop_id == null) partial.shop_id = sid
  }

  if (Object.keys(partial).length > 0) {
    mergeChatWidgetCustomerDetail(partial)
  }
}
