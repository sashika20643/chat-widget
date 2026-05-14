import type { IdTokenClaims } from '@logto/react'
import { applyLogtoSessionToCustomerDetail } from '@/utils/chatWidgetCustomerId'
import { saveLogtoUserDetails } from '@/utils/chatWidgetLogtoStorage'

const CLAIMS_RETRY_ATTEMPTS = 24
const CLAIMS_RETRY_DELAY_MS = 100

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

async function getIdTokenClaimsWithRetry(
  getIdTokenClaims: () => Promise<IdTokenClaims | undefined>,
): Promise<IdTokenClaims | undefined> {
  for (let i = 0; i < CLAIMS_RETRY_ATTEMPTS; i++) {
    const claims = await getIdTokenClaims()
    if (claims && typeof claims === 'object') {
      const o = claims as Record<string, unknown>
      if (typeof o.sub === 'string' || typeof o.email === 'string' || Object.keys(o).length > 0) {
        return claims
      }
    }
    await new Promise((r) => setTimeout(r, CLAIMS_RETRY_DELAY_MS))
  }
  return undefined
}

export type LogtoPersistDeps = {
  getIdTokenClaims: () => Promise<IdTokenClaims | undefined>
  fetchUserInfo: () => Promise<unknown>
  /** Raw JWT string (optional fallback when claims API returns empty). */
  getIdToken?: () => Promise<string | undefined | null>
}

/**
 * Writes `chatWidget_logtoIdTokenClaims` and merges into `chatWidget_customerDetail`.
 * Uses retries, optional raw ID token JWT decode if claims helper returns empty.
 */
export async function persistLogtoSessionToWidgetStorage(deps: LogtoPersistDeps): Promise<void> {
  let claims = await getIdTokenClaimsWithRetry(deps.getIdTokenClaims)

  if (!claims && deps.getIdToken) {
    try {
      const raw = await deps.getIdToken()
      if (typeof raw === 'string' && raw.length > 0) {
        const payload = decodeJwtPayload(raw)
        if (payload && Object.keys(payload).length > 0) {
          claims = payload as unknown as IdTokenClaims
        }
      }
    } catch {
      // ignore
    }
  }

  let userInfo: Record<string, unknown> | undefined
  try {
    const ui = await deps.fetchUserInfo()
    if (ui && typeof ui === 'object') {
      userInfo = ui as Record<string, unknown>
    }
  } catch {
    userInfo = undefined
  }

  if (claims) {
    saveLogtoUserDetails(claims)
  }

  applyLogtoSessionToCustomerDetail(
    claims ? (claims as Record<string, unknown>) : undefined,
    userInfo,
  )
}
