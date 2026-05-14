import { getNewsletterLegacyApiUrl } from '@/config/env'
import { DEFAULT_FCA_SHOP_ID, NewsletterSubCategory } from '@/constants/fcaShops'
import { extractErrorMessage, readResponseJson } from '@/lib/apiErrorBody'
import { IMAGE_BASE_URL } from '@/services/chatObjectsApi'
import { getStoredCustomerId, getStoredSubscriptionShopId } from '@/utils/chatWidgetCustomerId'

/**
 * First newsletter step: POST `/api/chat_bot/subscription/create` for BOGEN33 category
 * (`subCategories: [0]`). Uses `customer_id` from `chatWidget_customerDetail` and
 * `shop_id` from the same object when present.
 *
 * Optional: also POST `{ email }` to `VITE_NEWSLETTER_API_URL` when set (legacy parallel capture).
 */
export async function subscribeToNewsletter(email: string): Promise<void> {
  const customerId = getStoredCustomerId() ?? 0
  const shopId = getStoredSubscriptionShopId() ?? DEFAULT_FCA_SHOP_ID

  await createNewsletterSubscription({
    shop_id: shopId,
    customerId,
    status: 'Aktiv',
    subCategories: [NewsletterSubCategory.Bogen33],
  })

  const legacyUrl = getNewsletterLegacyApiUrl()

  if (legacyUrl) {
    const res = await fetch(legacyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    if (!res.ok) {
      throw new Error('Could not subscribe right now. Please try again later.')
    }
  }
}

export type NewsletterSubscriptionStatus = 'Aktiv'

export interface CreateNewsletterSubscriptionPayload {
  shop_id: string
  customerId: number
  status: NewsletterSubscriptionStatus
  subCategories: number[]
}

function subscriptionCreateUrl(): string {
  const base = IMAGE_BASE_URL.replace(/\/$/, '')
  return `${base}/api/chat_bot/subscription/create`
}

/** Stable marker — do not rely on `instanceof` alone (duplicate bundles break it). */
export const NEWSLETTER_CUSTOMER_NOT_FOUND_CODE = 'NEWSLETTER_CUSTOMER_NOT_FOUND' as const

/** Thrown when subscription API responds with 404 (customer not registered). */
export class NewsletterCustomerNotFoundError extends Error {
  readonly code = NEWSLETTER_CUSTOMER_NOT_FOUND_CODE

  constructor() {
    super('You are not registered.')
    this.name = 'NewsletterCustomerNotFoundError'
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

/** Use this instead of `instanceof NewsletterCustomerNotFoundError` in UI layers. */
export function isNewsletterCustomerNotFoundError(err: unknown): boolean {
  if (typeof err !== 'object' || err === null) return false
  const o = err as Record<string, unknown>
  if (o.code === NEWSLETTER_CUSTOMER_NOT_FOUND_CODE) return true
  if (err instanceof NewsletterCustomerNotFoundError) return true
  const name = typeof (err as Error).name === 'string' ? (err as Error).name : ''
  return name === 'NewsletterCustomerNotFoundError'
}

/**
 * POST `/api/chat_bot/subscription/create` on {@link IMAGE_BASE_URL}.
 * Uses the logged-in customer id from Logto claims stored after sign-in.
 */
export async function createNewsletterSubscription(
  payload: Omit<CreateNewsletterSubscriptionPayload, 'customerId'> & { customerId?: number },
): Promise<void> {
  const shopId = payload.shop_id || getStoredSubscriptionShopId() || DEFAULT_FCA_SHOP_ID
  const customerId = payload.customerId ?? getStoredCustomerId() ?? 0
  if (!Number.isFinite(customerId)) {
    throw new Error(
      'We could not find your customer id. Open the shop site signed in, or complete sign-in so chatWidget_customerDetail is available.',
    )
  }

  const body: CreateNewsletterSubscriptionPayload = {
    shop_id: shopId,
    customerId,
    status: payload.status,
    subCategories: payload.subCategories,
  }

  const res = await fetch(subscriptionCreateUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  const data = await readResponseJson(res)

  if (!res.ok) {
    if (res.status === 404) {
      throw new NewsletterCustomerNotFoundError()
    }
    throw new Error(extractErrorMessage(data, res.status, 'Could not update newsletter subscription.'))
  }
}

/** Convenience: default shop id from customer details (or BOGEN33) + Aktiv status. */
export async function createNewsletterSubscriptionForCurrentShop(
  subCategories: number[],
  shopId?: string,
): Promise<void> {
  const resolvedShop = shopId ?? getStoredSubscriptionShopId() ?? DEFAULT_FCA_SHOP_ID
  await createNewsletterSubscription({
    shop_id: resolvedShop,
    status: 'Aktiv',
    subCategories,
  })
}
