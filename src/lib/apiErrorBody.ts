/**
 * Parse common API error JSON shapes into a user-facing string.
 */
export function extractErrorMessage(data: unknown, status: number, fallback: string): string {
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

/** Safe JSON parse for error bodies; returns `null` if body is not JSON. */
export async function readResponseJson(res: Response): Promise<unknown> {
  try {
    return await res.json()
  } catch {
    return null
  }
}
