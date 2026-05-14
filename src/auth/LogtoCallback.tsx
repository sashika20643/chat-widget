import { useHandleSignInCallback, useLogto } from '@logto/react'
import { useNavigate } from 'react-router-dom'
import { persistLogtoSessionToWidgetStorage } from '@/utils/logtoPersistSession'

/**
 * Finish OIDC redirect, persist ID claims + merged `chatWidget_customerDetail`.
 * `LogtoSessionSync` on `/` retries if tokens were not ready on this tick.
 */
export default function LogtoCallback() {
  const navigate = useNavigate()
  const { getIdTokenClaims, fetchUserInfo, getIdToken } = useLogto()

  const { error } = useHandleSignInCallback(() => {
    void (async () => {
      try {
        await persistLogtoSessionToWidgetStorage({
          getIdTokenClaims,
          fetchUserInfo,
          getIdToken,
        })
      } finally {
        navigate('/', { replace: true })
      }
    })()
  })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Sign-in failed</h1>
          <p className="mt-3 text-sm text-destructive">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 gap-3">
      <h1 className="text-lg font-semibold text-foreground">Completing sign in…</h1>
      <p className="text-sm text-muted-foreground">Please wait.</p>
      <div
        className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground"
        aria-hidden
      />
    </div>
  )
}
