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

  // Let individual middleware handle routing logic
  return
})
