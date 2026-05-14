/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LOGTO_ENDPOINT?: string
  readonly VITE_LOGTO_APP_ID?: string
  readonly VITE_LOGTO_MAGIC_LINK_REDIRECT_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

