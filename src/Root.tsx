import { LogtoProvider } from '@logto/react'
import { Provider } from 'react-redux'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { store } from '@/store'
import App from '@/App'
import LogtoCallback from '@/auth/LogtoCallback'
import LogtoMagicLinkLanding from '@/auth/LogtoMagicLinkLanding'
import LogtoSessionSync from '@/auth/LogtoSessionSync'

const logtoEndpoint = import.meta.env.VITE_LOGTO_ENDPOINT as string | undefined
const logtoAppId = import.meta.env.VITE_LOGTO_APP_ID as string | undefined

const logtoConfig = {
  endpoint: logtoEndpoint ?? '',
  appId: logtoAppId ?? '',
}

export default function Root() {
  return (
    <BrowserRouter>
      <LogtoProvider config={logtoConfig}>
        <LogtoSessionSync />
        <Provider store={store}>
          <Routes>
            <Route path="/auth/magic-link" element={<LogtoMagicLinkLanding />} />
            <Route path="/callback" element={<LogtoCallback />} />
            <Route path="/" element={<App />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Provider>
      </LogtoProvider>
    </BrowserRouter>
  )
}
