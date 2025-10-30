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
    try {
      authStore.setUser(JSON.parse(userCookie.value))
    } catch (e) {
      console.error('Error parsing user cookie', e)
    }
  }
  if (tokenCookie.value && typeof tokenCookie.value === 'string') {
    authStore.setToken(tokenCookie.value)
  }

  // Watch store changes and sync to cookies
  watch(() => authStore.user, (newUser) => {
    userCookie.value = JSON.stringify(newUser)
  }, { deep: true })

  // Watch the internal token ref for changes
  watch(() => authStore.accessToken, (newToken) => {
    tokenCookie.value = newToken
    console.log('🔄 Token synced to cookie:', newToken ? 'Token present' : 'No token')
  })
})
