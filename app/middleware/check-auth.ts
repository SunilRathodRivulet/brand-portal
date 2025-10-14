export default defineNuxtRouteMiddleware(async (to, from) => {
    const authStore = useAuthStore()
    const appDataStore = useAppDataStore()

    // If user is not logged in, attempt auto-login for public portal
    if (!authStore.isAuthenticated) {
        const brandName = to.params.brand_name as string

        if (brandName && brandName !== 'login') {
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
                    const firstBrand = authStore.user?.accessibleInstances?.[0]?.workspace_id
                    return navigateTo(firstBrand ? `/${firstBrand}` : '/')
                }

                // Auto-login with public credentials
                const loginResult = await authStore.login(email, password, workspace_id)

                if (loginResult.success) {
                    // Set current workspace and subscription features
                    // TODO: Implement workspace setting logic when available
                    // TODO: Implement subscription features setting

                    // Redirect to the original route
                    return navigateTo(to.fullPath)
                } else {
                    console.error('Auto-login failed:', loginResult.error)
                }
            } catch (error: any) {

                const firstBrand = authStore.user?.accessibleInstances?.[0]?.workspace_id
                return navigateTo(firstBrand ? `/${firstBrand}/login` : '/login')
            }
        } else if (brandName === 'login') {
            if (from.params.brand_name) return navigateTo(`/${from.params.brand_name}/login`)
            else return navigateTo('/')
        }
    }

    // User is already authenticated, continue
    return
})
