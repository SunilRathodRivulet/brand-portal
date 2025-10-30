import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { useAuthApi } from '~/composables/api/useAuthApi'

export interface User {
  id: number
  email?: string
  name?: string
  accessibleInstances?: any[]
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const authApi = useAuthApi()
  const { brandName } = useHelpers()

  /* ---------- Computed ---------- */
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  /* ---------- Actions ---------- */
  const setUser = (u: User | null) => {
    user.value = u
  }

  const setToken = (t: string | null) => {
    token.value = t
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
  }

  const login = async (email: string, password: string, workspaceUrlSlug?: string) => {
    clearAuth()
    loading.value = true
    try {
      const response = await authApi.login(email, password, workspaceUrlSlug)
      console.log('[AuthStore] login - Response:', response)

      // Handle different possible response structures
      let userData = null
      let accessToken = null

      if (response.data) {
        if (response.data.user && response.data.access_token) {
          userData = response.data.user
          accessToken = response.data.access_token
        } else if (response.data.dealer_user_id && response.data.access_token) {
          userData = {
            id: response.data.dealer_user_id,
            email: response.data.email || '',
            name: response.data.name || '',
            workspace_id: response.data.workspace_id,
            ...response.data
          }
          accessToken = response.data.access_token
        }
      } else if (response.access_token) {
        userData = {
          id: response.dealer_user_id || response.user_id || 0,
          email: response.email || '',
          ...response
        }
        accessToken = response.access_token
      }
      setUser(userData)
      setToken(accessToken)

      return { success: true }
    } catch (e: any) {
      console.error('[AuthStore] login - Error:', e)
      clearAuth()
      return { success: false, error: e.message || 'Login failed' }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        await authApi.logout(token.value)
      }
    } catch {
      /* ignore */
    } finally {
      clearAuth()
      // Navigate to login without using route in this context
      await navigateTo('/login')
    }
  }

  const getUser = async (forceRedirectOnError: boolean = true) => {
    if (!token.value) return null
    try {
      const userData = await authApi.getUser(token.value)
      setUser(userData)
      return userData
    } catch (e) {
      console.error('getUser failed', e)
      // Only clear auth and redirect if explicitly requested (not during page refresh)
      if (forceRedirectOnError) {
        clearAuth()
        await navigateTo('/login')
      }
      return null
    }
  }

  const loginWithToken = async (oneTimeToken: string) => {
    loading.value = true
    try {

      const data = await authApi.loginWithToken(oneTimeToken)
      setUser({
        id: data.user_id,
        workspace_id: data.workspace_id,
        is_slider: data.is_slider,
        dealer_user_id: data.dealer_user_id,
        instance_id: data.instance_id,
        name: brandName().replace("-", " ")
          .replace(/^./, (c: string) => c.toUpperCase()),
      })
      setToken(data.access_token)

      // await navigateTo('/')
      return { success: true }
    } catch (e: any) {
      console.error('Token login failed', e)
      return { success: false, error: e.message || 'Token login failed' }
    } finally {
      loading.value = false
    }
  }

  const checkAuth = () => {
    console.log('[AuthStore] checkAuth ── isAuthenticated:', isAuthenticated.value,
      'hasUser:', !!user.value,
      'hasToken:', !!token.value,
      'tokenLength:', token.value?.length)
  }

  return {
    user: readonly(user),
    accessToken: readonly(token),
    loading: readonly(loading),
    isAuthenticated,
    setUser,
    setToken,
    clearAuth,
    login,
    logout,
    getUser,
    checkAuth,
    loginWithToken
  }
})
