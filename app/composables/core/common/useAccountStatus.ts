import { ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useAccountApi } from '~/composables/api/useAccountApi'

export const useAccountStatus = () => {
  const authStore = useAuthStore()
  const accountApi = useAccountApi()
  const accountStatusInterval = ref<NodeJS.Timeout | null>(null)

  // Set up account status check interval (every 5 minutes) - only on client side
  const startAccountStatusCheck = () => {
    if (accountStatusInterval.value) {
      clearInterval(accountStatusInterval.value)
    }

    // Only run on client side
    if (process.client) {
      accountStatusInterval.value = setInterval(async () => {
        try {
          if (authStore.isAuthenticated) {
            // Access workspace ID through the auth store
            const workspaceId = authStore.user?.workspace_id
            if (workspaceId) {
              const response = await accountApi.checkAccountStatus(workspaceId)
              if (response?.data?.is_suspended) {
                // Get brand name BEFORE logout while user data is still available
                const brandName = authStore.user?.accessibleInstances?.[0]?.url || 'login'

                await authStore.logout()
                // Clear auth cookies
                const userCookie = useCookie('auth_user')
                const tokenCookie = useCookie('auth_token')
                userCookie.value = null
                tokenCookie.value = null
                // Redirect after logout
                await navigateTo(`/${brandName}/login`)
              }
            }
          }
        } catch (e) {
          console.error('Account status check failed:', e)
        }
      }, 5 * 60 * 1000) // 5 minutes
    }
  }

  const stopAccountStatusCheck = () => {
    if (accountStatusInterval.value) {
      clearInterval(accountStatusInterval.value)
      accountStatusInterval.value = null
    }
  }

  // Start the interval when composable is used
  startAccountStatusCheck()

  return {
    startAccountStatusCheck,
    stopAccountStatusCheck
  }
}
