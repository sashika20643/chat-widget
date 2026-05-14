import { useLogto } from '@logto/react'
import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

const CALLBACK_PATH = '/callback'

/**
 * Same flow as test_auth_new MagicLinkLanding: read `token` + `email` from the
 * magic-link redirect URL, then delegate to Logto with one_time_token + login_hint.
 */
export default function LogtoMagicLinkLanding() {
  const { signIn } = useLogto()
  const [searchParams] = useSearchParams()

  const oneTimeToken = searchParams.get('token')
  const email = searchParams.get('email')

  const queryError = useMemo(() => {
    if (!oneTimeToken || !email) {
      return 'Invalid magic link — missing token or email.'
    }
    return null
  }, [oneTimeToken, email])

  useEffect(() => {
    if (queryError) return

    const dedupeKey = `logto-magic-link:${oneTimeToken}`
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(dedupeKey)) {
      return
    }
    sessionStorage.setItem(dedupeKey, '1')

    const callbackUri = `${window.location.origin}${CALLBACK_PATH}`

    void signIn({
      redirectUri: callbackUri,
      clearTokens: false,
      extraParams: {
        one_time_token: oneTimeToken!,
        login_hint: email!,
      },
    })
  }, [queryError, oneTimeToken, email, signIn])

  if (queryError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full rounded-xl border border-destructive/30 bg-card p-8 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">Invalid link</h1>
          <p className="mt-3 text-sm text-destructive">{queryError}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6 gap-3">
      <h1 className="text-lg font-semibold text-foreground">Signing you in…</h1>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Please wait while we verify your magic link with Logto.
      </p>
      <div
        className="mt-4 h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-foreground"
        aria-hidden
      />
    </div>
  )
}
