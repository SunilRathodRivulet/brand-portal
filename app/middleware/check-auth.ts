// ~/middleware/check-auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  /* ------------------------------------------------------------------ */
  /* 2.  Now the store is correct on both server and client             */
  /* ------------------------------------------------------------------ */
  if (authStore.isAuthenticated) return

  /* ------------------------------------------------------------------ */
  /* 2.1 Check if we have token but no user - fetch user data           */
  /* ------------------------------------------------------------------ */
  if (authStore.accessToken && !authStore.user) {
    console.log('[Auth Middleware] Token present but no user data, fetching user...')
    try {
      await authStore.getUser(false) // Don't force redirect during middleware auth check
      if (authStore.isAuthenticated) {
        console.log('[Auth Middleware] User data fetched successfully')
        return
      }
    } catch (error) {
      console.error('[Auth Middleware] Failed to fetch user data:', error)
      // Don't clear auth during middleware check - let user try again or handle elsewhere
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3.  Anonymous visitor – redirect to login for protected pages      */
  /* ------------------------------------------------------------------ */
  const brandName = to.params.brand_name as string
  const token = (to.params.token as string) || (to.params as any).token // for [token] route
  console.log('Route:', to.path, 'isAuthenticated:', authStore.isAuthenticated, 'brandName:', brandName, 'token:', token)

  // Skip auth check for login page, token-based access, or if already authenticated
  if (!brandName || to.path.endsWith('/login') || token || authStore.isAuthenticated) {
    return
  }

  console.log('[Auth Middleware] Not authenticated on protected page, redirecting to login')
  return navigateTo(`/${brandName}/login`)
})

/* -------------------------------------------------------------------- */
/* helpers                                                              */
/* -------------------------------------------------------------------- */
function parseCookie(raw = '', name: string): string | null {
  const m = raw.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]*)'))
  return (m ? decodeURIComponent(m[1]) : null)
}

function safeJsonParse(str: string | null): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}
