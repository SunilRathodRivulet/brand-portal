import { useCookie } from '#app'
import { useAuthStore } from '~/stores/auth'
import { useAuthApi } from '~/composables/api/useAuthApi'

export const useCustomScheme = () => {
  const authStore = useAuthStore()
  const authApi = useAuthApi()

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password)

      if (response?.data?.access_token) {
        authStore.setToken(response.data.access_token)
        if (response.data.user) {
          authStore.setUser(response.data.user)
        }
        return { success: true }
      }

      return { success: false, error: 'Invalid response' }
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' }
    }
  }

  const logout = async () => {
    try {
      if (authStore.accessToken) {
        await authApi.logout(authStore.accessToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      authStore.clearAuth()
    }
  }

  const user = async () => {
    try {
      if (!authStore.accessToken) {
        return null
      }

      const userData = await authApi.getUser(authStore.accessToken)

      if (userData) {
        authStore.setUser(userData)
        return userData
      }

      return null
    } catch (error) {
      console.error('Get user error:', error)
      authStore.clearAuth()
      return null
    }
  }

  return {
    login,
    logout,
    user,
    token: authStore.accessToken,
    isAuthenticated: authStore.isAuthenticated
  }
}
