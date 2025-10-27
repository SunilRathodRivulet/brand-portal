// plugins/auth-cookies.client.ts
export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  
  const COOKIE_OPTIONS = {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    sameSite: 'lax' as const,
    secure: import.meta.env.PROD,
    path: '/'
  }

  // Initialize cookies
  const userCookie = useCookie<any>('auth_user', COOKIE_OPTIONS)
  const tokenCookie = useCookie<string>('auth_token', COOKIE_OPTIONS)

  // Load from cookies on mount
  if (userCookie.value) {
    authStore.setUser(userCookie.value)
  }
  if (tokenCookie.value) {
    authStore.setToken(tokenCookie.value)
  }

  // Watch store changes and sync to cookies
  watch(() => authStore.user, (newUser) => {
    userCookie.value = newUser
  }, { deep: true })

  // Watch the internal token ref for changes
  watch(() => authStore.accessToken, (newToken) => {
    tokenCookie.value = newToken
    console.log('🔄 Token synced to cookie:', newToken ? 'Token present' : 'No token')
  })
})
