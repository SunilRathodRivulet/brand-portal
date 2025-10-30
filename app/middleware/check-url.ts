export default defineNuxtRouteMiddleware(async (to, from) => {
  // Ignore asset requests
  if (to.path.startsWith('/_nuxt/') || to.path.includes('.')) {
    return
  }

  const authStore = useAuthStore()
  const route = to as any

  // Handle authenticated user checking different brand
  if (authStore.isAuthenticated) {
    const brandNameFromRoute = route.params?.brand_name as string
    const brandNameFromUser = authStore.user?.accessibleInstances?.[0]?.url

    if (brandNameFromUser && brandNameFromRoute && brandNameFromUser !== brandNameFromRoute) {
      // Logout from current session and try to access new brand
      console.log(`Switching brands from ${brandNameFromUser} to ${brandNameFromRoute}`)
      await authStore.logout()
      clearAuthCookies()

      // Try to auto-login with public portal credentials
      try {
        const config = useRuntimeConfig()
        const apiUrl = config.public.apiBaseUrl ?
          `${config.public.apiBaseUrl}check-public-portal` :
          '/api/check-public-portal'

        const response: any = await $fetch(apiUrl, {
          method: 'POST',
          body: { url: brandNameFromRoute }
        })

        const { workspace_id, email, password } = response?.data || response

        if (!workspace_id || !email || !password) {
          console.error('Invalid response from check-public-portal API')
          return navigateTo(`/${brandNameFromUser}`)
        }

        // Auto-login with public credentials for new brand
        const loginResult = await authStore.login(email, password, workspace_id)

        if (loginResult.success) {
          return navigateTo(`/${brandNameFromRoute}`)
        } else {
          return navigateTo(`/${brandNameFromRoute}/login`)
        }
      } catch (error: any) {
        console.error('Error switching brands:', error?.message)
        return navigateTo(`/${brandNameFromRoute}/login`)
      }
    }
  }

  // Handle URL validation for non-main-app URLs
  try {
    // Skip validation if on login page
    if (route.path.includes('/login')) {
      return
    }

    let isValid = false
    const mainAppUrls = [
      'localhost:3001',
      'localhost:3004',
      'devdealer.collage.inc',
      'devfront.collage.inc',
      'devdealer82.collage.inc',
      'devfront82.collage.inc',
      'uatdealer.collage.inc',
      'uatfront.collage.inc',
      'dam.collage.inc',
      'app.collage.inc'
    ]

    const hostName = typeof window !== 'undefined' ? window.location.host : useRequestHeaders()['host'] || ''
    const isLocalhost = hostName.startsWith('localhost:');
    const isSubdomain =
      (!isLocalhost && !mainAppUrls.includes(hostName)) ||
      route.query?.custom === 'true';

    if (isSubdomain) {
      // For subdomain access, verify domain
      let domainUrl = hostName
      const findIndex = domainUrl.indexOf(':')
      if (findIndex !== -1) {
        domainUrl = domainUrl.substring(0, findIndex)
      }

      const config = useRuntimeConfig()
      const apiUrl = config.public.apiBaseUrl ?
        `${config.public.apiBaseUrl}verify-domain` :
        '/api/verify-domain'

      const response: any = await $fetch(apiUrl, {
        method: 'POST',
        body: { url: domainUrl }
      })

      if (response?.code === 200) {
        // Valid domain - store logo and brand details
        const appDataStore = useAppDataStore()
        appDataStore.assignLogo(response.data.logo)
        appDataStore.brandDetails(response.data)
        isValid = true
      }
    } else {
      // For main app, verify with brand name from route
      const brandName = route.params?.brand_name as string

      if (brandName) {
        const config = useRuntimeConfig()
        const apiUrl = config.public.apiBaseUrl ?
          `${config.public.apiBaseUrl}verify-domain` :
          '/api/verify-domain'

        const response: any = await $fetch(apiUrl, {
          method: 'POST',
          body: { url: brandName }
        })
        console.log('Brand verification response:', response)

        if (response?.code === 200) {
          // Valid brand - would store logo and brand details here
          isValid = true
          const appDataStore = useAppDataStore()
          appDataStore.assignLogo(response.data.logo)
          appDataStore.brandDetails(response.data)
        }
      }
    }

    if (!isValid) {
      const brandName = route.params?.brand_name as string || 'login'

      if (brandName === 'login') {
        throw createError({
          statusCode: 404,
          statusMessage: `Try entering url as <Brand_URL>/login.`
        })
      } else {
        throw createError({
          statusMessage: `Brand with "${brandName}" doesn't exists.`
        })
      }
    }
  } catch (error: any) {
    const isApiError = error?.data?.message?.includes('not available')

    if (isApiError) {
      const brandName = route.params?.brand_name as string || 'login'
      console.log('API Error during URL check:', error?.data?.message, route)

      if (brandName === 'login') {
        throw createError({
          statusCode: 404,
          statusMessage: `Try entering url as <Brand_URL>/login.`
        })
      } else {
        throw createError({
          statusCode: 404,
          statusMessage: `Brand with "${brandName}" doesn't exists.`
        })
      }
    }

    throw error
  }

  return
})

function clearAuthCookies() {
  if (process.client) {
    // Clear auth-related cookies when switching brands
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=Thu, 01 Jan 1970 00:00:00 GMT")
    })
  }
}

/* ------------- helpers (keep at bottom of file) --------------------- */
function parseCookie(raw = '', name: string): string | null {
  const m = raw.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]*)'))
  return m ? decodeURIComponent(m[1]) : null
}
function safeJsonParse(str: string | null): any {
  if (!str) return null
  try { return JSON.parse(str) } catch { return null }
}
