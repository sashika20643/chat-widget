import { useEffect } from 'react'
import { useLogto } from '@logto/react'
import { persistLogtoSessionToWidgetStorage } from '@/utils/logtoPersistSession'

/**
 * After magic-link redirect, `LogtoCallback` may run before tokens are readable.
 * This effect runs when the session becomes active (including on `/` after navigate),
 * so `chatWidget_logtoIdTokenClaims` and `chatWidget_customerDetail` reliably populate localStorage.
 */
export default function LogtoSessionSync() {
  const { isAuthenticated, isLoading, getIdTokenClaims, fetchUserInfo, getIdToken } = useLogto()

  useEffect(() => {
    if (!isAuthenticated || isLoading) return

    void persistLogtoSessionToWidgetStorage({
      getIdTokenClaims,
      fetchUserInfo,
      getIdToken,
    })
  }, [isAuthenticated, isLoading, getIdTokenClaims, fetchUserInfo, getIdToken])

  return null
}
