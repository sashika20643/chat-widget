import { IMGBB_API_KEY } from '@/config/env'

const IMGBB_UPLOAD_URL = 'https://api.imgbb.com/1/upload'

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

function stripDataUrlPrefix(dataUrl: string): string {
  // "data:image/png;base64,AAAA..." -> "AAAA..."
  const idx = dataUrl.indexOf('base64,')
  return idx >= 0 ? dataUrl.slice(idx + 'base64,'.length) : dataUrl
}

/**
 * Uploads an image to ImgBB and returns the public URL.
 */
export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = IMGBB_API_KEY

  if (file.size > 32 * 1024 * 1024) {
    throw new Error('Image exceeds 32MB limit')
  }

  const base64DataUrl = await fileToBase64(file)
  const base64 = stripDataUrlPrefix(base64DataUrl)

  const body = new FormData()
  body.append('key', apiKey)
  body.append('image', base64)
  body.append('name', file.name)

  const res = await fetch(IMGBB_UPLOAD_URL, {
    method: 'POST',
    body,
  })

  if (!res.ok) {
    throw new Error(`ImgBB upload failed: ${res.status} ${res.statusText}`)
  }

  const json: any = await res.json()
  if (!json?.success) {
    throw new Error(json?.error?.message || 'ImgBB upload failed')
  }

  return String(json?.data?.url)
}

