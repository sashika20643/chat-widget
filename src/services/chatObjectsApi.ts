import { IMAGE_BASE_URL, OBJECTS_API_URL } from '@/config/env'

/** Base URL for resolving relative image_url from the objects API */
export { IMAGE_BASE_URL }

/** Resolve image URL: use as-is if absolute, otherwise prepend IMAGE_BASE_URL */
export function resolveImageUrl(url: string | null | undefined): string | null {
  // Runtime safety: some API payloads may contain unexpected non-string values.
  if (!url || typeof url !== 'string') return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = IMAGE_BASE_URL.replace(/\/$/, '')
  const path = url.startsWith('/') ? url : `/${url}`
  return `${base}${path}`
}

export interface ChatBotObject {
  fca_object_id: string
  shop: string
  object_id: number
  name: string
  price: string
  displayed_price: string
  discount: string | null
  designer_name: string | null
  manufacturer_name: string | null
  image_url: string | null
  /** Product page URL from API */
  product_url?: string | null
  /** Long product description HTML/text from source */
  web_text_a?: string | null
  /** Additional product image URLs for slideshow */
  images?: string[] | null
}

export interface ChatBotObjectsResponse {
  success: boolean
  data: ChatBotObject[]
  count: number
  status: number
}

export async function fetchChatBotObjects(
  objectFcaIds: string[]
): Promise<ChatBotObject[]> {
  const res = await fetch(OBJECTS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ object_fca_ids: objectFcaIds }),
  })
  if (!res.ok) throw new Error(`Objects API error: ${res.status}`)
  const json: ChatBotObjectsResponse = await res.json()
  if (!json.success || !Array.isArray(json.data)) return []
  return json.data
}
