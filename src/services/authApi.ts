import { DEFAULT_FCA_SHOP_ID } from '@/constants/fcaShops'
import { IMAGE_BASE_URL } from '@/services/chatObjectsApi'

/** Hardcoded until shop context is wired from embed / session. */
export const HARDCODED_FCA_SHOP = DEFAULT_FCA_SHOP_ID

export interface CreateAuthUserPayload {
  fca_shop: string
  email: string
  first_name: string
  name: string
  zip: string
}

function createUserUrl(): string {
  const base = IMAGE_BASE_URL.replace(/\/$/, '')
  return `${base}/api/auth/create-user`
}

function extractErrorMessage(data: unknown, status: number, fallback: string): string {
  if (data && typeof data === 'object') {
    const o = data as Record<string, unknown>
    const msg = o.message ?? o.error ?? o.detail
    if (typeof msg === 'string' && msg.trim()) return msg.trim()
    if (Array.isArray(o.errors) && o.errors.length > 0) {
      const first = o.errors[0]
      if (typeof first === 'string') return first
      if (first && typeof first === 'object' && 'msg' in first && typeof (first as { msg: unknown }).msg === 'string') {
        return (first as { msg: string }).msg
      }
    }
  }
  return `${fallback} (${status})`
}

export type CreateAuthUserFields = Pick<CreateAuthUserPayload, 'email' | 'first_name' | 'name' | 'zip'>

/** POST {IMAGE_BASE_URL}/api/auth/create-user — register a new user. */
export async function createAuthUser(fields: CreateAuthUserFields): Promise<unknown> {
  const payload: CreateAuthUserPayload = {
    fca_shop: HARDCODED_FCA_SHOP,
    ...fields,
  }
  const res = await fetch(createUserUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  let data: unknown
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status, 'Registration failed'))
  }
  return data
}

function sendMagicLinkUrl(): string {
  const base = IMAGE_BASE_URL.replace(/\/$/, '')
  return `${base}/api/auth/send-magic-link`
}

export interface SendMagicLinkPayload {
  email: string
  name: string
}

/**
 * Must match the app route that starts Logto magic-link sign-in (see `LogtoMagicLinkLanding`).
 * Override with `VITE_LOGTO_MAGIC_LINK_REDIRECT_URL` for other hosts.
 */
const MAGIC_LINK_REDIRECT_URL =
  (import.meta.env.VITE_LOGTO_MAGIC_LINK_REDIRECT_URL as string | undefined) ??
  'http://localhost:5173/auth/magic-link'

/** POST {IMAGE_BASE_URL}/api/auth/send-magic-link — email sign-in link. */
export async function sendAuthMagicLink(payload: SendMagicLinkPayload): Promise<unknown> {
  const res = await fetch(sendMagicLinkUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      redirect_url: MAGIC_LINK_REDIRECT_URL,
    }),
  })
  let data: unknown
  try {
    data = await res.json()
  } catch {
    data = null
  }
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status, 'Could not send magic link'))
  }
  return data
}
