// ~/middleware/check-auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  /* ------------------------------------------------------------------ */
  /* 1.  Server side: hydrate the store from the request cookie header  */
  /* ------------------------------------------------------------------ */
  if (process.server && !authStore.isAuthenticated) {
    // The cookie helpers we created in the store read from document.cookie,
    // but on the server we have to parse the header ourselves.
    const cookieHeader = useRequestHeaders(['cookie'])['cookie'] || ''
    const token = parseCookie(cookieHeader, 'auth_token')
    const user  = safeJsonParse(parseCookie(cookieHeader, 'auth_user'))

    if (token && user) {
      authStore.setToken(token)   // writes nothing on server
      authStore.setUser(user)     // writes nothing on server
    }
  }

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
      await authStore.getUser()
      if (authStore.isAuthenticated) {
        console.log('[Auth Middleware] User data fetched successfully')
        return
      }
    } catch (error) {
      console.error('[Auth Middleware] Failed to fetch user data:', error)
      // Clear invalid token
      authStore.clearAuth()
    }
  }

  /* ------------------------------------------------------------------ */
  /* 3.  Anonymous visitor – try public-portal auto-login               */
  /* ------------------------------------------------------------------ */
  const brandName = to.params.brand_name as string
  if (!brandName || brandName === 'login') {
    // Don't redirect if already on login page or no brand name
    return
  }

  try {
    const { public: { apiBaseUrl } } = useRuntimeConfig()
    const { workspace_id, email, password } = await $fetch<{
      workspace_id: string; email: string; password: string
    }>(`${apiBaseUrl}check-public-portal`, {
      method: 'POST',
      body: { url: brandName }
    })

    if (!workspace_id || !email || !password) throw new Error('Bad portal response')

    const { success } = await authStore.login(email, password, workspace_id)
    if (!success) throw new Error('Auto-login failed')

    // login already redirected on success; if we get here just continue
  } catch {
    // portal does not exist / login failed - redirect to login page
    console.log('[Auth Middleware] Portal login failed, redirecting to login page')
    await navigateTo(`/${brandName}/login`)
    return
  }
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
