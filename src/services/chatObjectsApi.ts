const OBJECTS_API_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OBJECTS_API_URL) ||
  'https://getbutik-getbutik-db-service.ceilu9.easypanel.host/api/chat_bot/objects'

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
