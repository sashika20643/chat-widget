/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_API_BASE_URL?: string
  readonly VITE_CHAT_STREAM_API_URL?: string
  readonly VITE_OBJECTS_API_URL?: string
  readonly VITE_IMAGE_BASE_URL?: string
  readonly VITE_IMGBB_API_KEY?: string
  readonly VITE_NEWSLETTER_API_URL?: string
  readonly VITE_CALENDAR_API_BASE_URL?: string
  readonly VITE_LOGTO_ENDPOINT?: string
  readonly VITE_LOGTO_APP_ID?: string
  readonly VITE_LOGTO_MAGIC_LINK_REDIRECT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

