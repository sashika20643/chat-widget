export const CHAT_WIDGET_INACTIVITY_EVENT = 'chat-widget-inactivity'
export const CHAT_WIDGET_PRODUCT_DWELL_EVENT = 'chat-widget-product-dwell'
export const CHAT_WIDGET_WEBFORM_ABANDONMENT_EVENT = 'chat-widget-webform-abandonment'
export const CHAT_WIDGET_SCROLL_INDECISION_EVENT = 'chat-widget-scroll-indecision'
export const CHAT_WIDGET_THANK_YOU_EVENT = 'chat-widget-thank-you'
const DEFAULT_PRODUCT_DWELL_MS = 15_000

export interface ProductDwellEventDetail {
  productName: string
  dwellMs?: number
}

export interface WebFormAbandonmentEventDetail {
  source?: 'back_button' | 'browser_back' | 'close_attempt' | 'unknown'
}

export interface ScrollIndecisionEventDetail {
  upCount?: number
  downCount?: number
}

export interface ThankYouEventDetail {
  productTitles?: string[]
}

export function triggerInactivityNotification() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(CHAT_WIDGET_INACTIVITY_EVENT))
}

export function triggerProductDwellNotification(detail: ProductDwellEventDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CHAT_WIDGET_PRODUCT_DWELL_EVENT, {
      detail,
    }),
  )
}

export function triggerWebFormAbandonmentNotification(detail?: WebFormAbandonmentEventDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CHAT_WIDGET_WEBFORM_ABANDONMENT_EVENT, {
      detail,
    }),
  )
}

export function triggerScrollIndecisionNotification(detail?: ScrollIndecisionEventDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CHAT_WIDGET_SCROLL_INDECISION_EVENT, {
      detail,
    }),
  )
}

export function triggerThankYouNotification(detail?: ThankYouEventDetail) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(
    new CustomEvent(CHAT_WIDGET_THANK_YOU_EVENT, {
      detail,
    }),
  )
}

/**
 * Start a page-level dwell timer and dispatch the product-dwell notification event.
 * Returns a cleanup function so pages can cancel on unmount or route change.
 */
export function startProductDwellTimer(productName: string, dwellMs = DEFAULT_PRODUCT_DWELL_MS) {
  if (typeof window === 'undefined') return () => {}

  const timeoutId = window.setTimeout(() => {
    triggerProductDwellNotification({ productName, dwellMs })
  }, dwellMs)

  return () => window.clearTimeout(timeoutId)
}

