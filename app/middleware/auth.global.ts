// ~/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  if (process.server && !authStore.isAuthenticated) {
    const cookieHeader = useRequestHeaders(['cookie'])['cookie'] || ''
    const token = parseCookie(cookieHeader, 'auth_token')

    if (token) {
      authStore.setToken(token)
    }
  }
})

function parseCookie(raw = '', name: string): string | null {
  const m = raw.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]*)'))
  return (m ? decodeURIComponent(m[1]) : null)
}
