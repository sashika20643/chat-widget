import { LOGTO_MAGIC_LINK_REDIRECT_URL } from '@/config/env'
import { DEFAULT_FCA_SHOP_ID } from '@/constants/fcaShops'
import { extractErrorMessage, readResponseJson } from '@/lib/apiErrorBody'
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
  const data = await readResponseJson(res)
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

/** POST {IMAGE_BASE_URL}/api/auth/send-magic-link — email sign-in link. */
export async function sendAuthMagicLink(payload: SendMagicLinkPayload): Promise<unknown> {
  const res = await fetch(sendMagicLinkUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      redirect_url: LOGTO_MAGIC_LINK_REDIRECT_URL,
    }),
  })
  const data = await readResponseJson(res)
  if (!res.ok) {
    throw new Error(extractErrorMessage(data, res.status, 'Could not send magic link'))
  }
  return data
}
