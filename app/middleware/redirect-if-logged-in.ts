export default defineNuxtRouteMiddleware(async (to, from) => {
  const authStore = useAuthStore()

  // If navigating TO login page, check if user is already authenticated
  if (to.path.includes('/login') || to.name === 'brand_name-login') {
    // If user is authenticated, redirect away from login page to the brand page
    if (authStore.isAuthenticated) {
      const brandName = to.params.brand_name as string
      return brandName ? navigateTo(`/${brandName}`) : navigateTo('/')
    }
    // If not authenticated, allow access to login page
    return
  }

  // First run check-auth middleware (auto-login for public portals)
  const checkAuthResult = await runCheckAuthMiddleware(to, from)
  if (checkAuthResult) return checkAuthResult

  // Then run check-url middleware (URL validation)
  const checkUrlResult = await runCheckUrlMiddleware(to, from)
  if (checkUrlResult) return checkUrlResult

  // Finally run the original redirect-if-logged-in logic
  const url = [
    'localhost:3001',
    'localhost:3004',
    'devdealer.collage.inc',
    'devfront.collage.inc',
    'devdealer82.collage.inc',
    'devfront82.collage.inc',
    'uatdealer.collage.inc',
    'uatfront.collage.inc',
    'dam.collage.inc',
    'app.collage.inc',
  ]

  const hostName = typeof window !== 'undefined' ? window.location.host : useRequestHeaders()['host']

  // For allowed URLs (main app)
  if (url.includes(hostName)) {
    if (authStore.isAuthenticated) {
      // User is logged in, redirect to their brand
      const firstBrand = authStore.user?.accessibleInstances?.[0]?.workspace_id
      return firstBrand ? navigateTo(`/${firstBrand}`) : navigateTo('/')
    }

    // Allow access to main app when not logged in (landing page behavior)
    return
  }

  // Handle subdomain-based routing (brand-specific routes)

  // Skip for reset password
  if (to.name === 'reset-password') {
    return
  }

  // If user is logged in with appropriate brand access, allow
  if (authStore.isAuthenticated) {
    const brandNameFromRoute = to.params.brand_name as string
    const hasAccess = authStore.user?.accessibleInstances?.some(
      inst => inst.workspace_id === brandNameFromRoute || inst.brand_name === brandNameFromRoute
    )

    if (hasAccess) {
      return // Allow access
    } else {
      // User doesn't have access to this brand, redirect to their first accessible brand
      const firstBrand = authStore.user?.accessibleInstances?.[0]?.workspace_id
      return firstBrand ? navigateTo(`/${firstBrand}`) : navigateTo('/')
    }
  }

  // If has custom query param, allow (for domain verification)
  if (to.query.custom === 'true') {
    return
  }

  // User is not logged in - redirect to login for this brand
  if (to.params.brand_name && !to.path.includes('/login') && !to.path.includes('/forgot-password')) {
    console.log('Redirecting unauthenticated user to brand login:', `/${to.params.brand_name}/login`)
    return navigateTo(`/${to.params.brand_name}/login`)
  }

  // Default fallback - this shouldn't normally be reached, but redirect to root if nothing else matches
  console.log('Default fallback redirect to root')
  return navigateTo('/')
})

// Import and run check-auth middleware logic inline
async function runCheckAuthMiddleware(to: any, from: any) {
  const authStore = useAuthStore()

  // If user is not logged in, attempt auto-login for public portal
  if (!authStore.isAuthenticated) {
    const brandName = to.params.brand_name as string

    if (brandName) {
      try {
        const config = useRuntimeConfig()
        const apiUrl = config.public.apiBaseUrl ?
          `${config.public.apiBaseUrl}check-public-portal` :
          '/api/check-public-portal'

        const response: any = await $fetch(apiUrl, {
          method: 'POST',
          body: { url: brandName }
        })

        const { workspace_id, email, password } = response?.data || response

        if (!workspace_id || !email || !password) {
          console.error('Invalid response from check-public-portal API')
          return // Continue to next middleware
        }

        // Auto-login with public credentials
        const loginResult = await authStore.login(email, password, workspace_id)

        if (loginResult.success) {
          // Redirect to the original route
          return navigateTo(to.fullPath)
        }
      } catch (error: any) {
        console.error('Error during public login:', error?.message)
        // Continue to next middleware (will redirect to login)
      }
    }
  }

  return // Continue to next middleware
}

// Import and run check-url middleware logic inline
async function runCheckUrlMiddleware(to: any, from: any) {
  const authStore = useAuthStore()
  const route = to

  // Handle authenticated user checking different brand
  if (authStore.isAuthenticated) {
    const brandNameFromRoute = route.params.brand_name as string
    const brandNameFromUser = authStore.user?.accessibleInstances?.[0]?.workspace_id

    if (brandNameFromUser && brandNameFromRoute && brandNameFromUser !== brandNameFromRoute) {
      // Logout from current session and try to access new brand
      await authStore.logout()

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
          // Redirect back to current user's brand
          return navigateTo(`/${brandNameFromUser}`)
        }

        // Auto-login with public credentials for new brand
        const loginResult = await authStore.login(email, password, workspace_id)

        if (loginResult.success) {
          // Redirect to the intended route
          return navigateTo(route.fullPath)
        } else {
          // Redirect to login if auto-login fails
          return navigateTo(`/${brandNameFromRoute}/login`)
        }
      } catch (error: any) {
        console.error('Error switching brands:', error?.message)
        return navigateTo(route.fullPath)
      }
    }
  }

  // URL validation handled elsewhere, continue
  return
}
