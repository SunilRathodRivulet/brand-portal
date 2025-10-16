import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'

export interface User {
  id: number
  email: string
  name?: string
  accessibleInstances?: any[]
  [key: string]: any
}

export const useAuthStore = defineStore('auth', () => {
  /* ---------- State ---------- */
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const loading = ref(false)
  const route = useRoute()

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
      const config = useRuntimeConfig()
      const body: any = { email, password }
      if (workspaceUrlSlug) body.workspace_id = workspaceUrlSlug

      const response = await $fetch<any>(
        `${config.public.apiBaseUrl || ''}login`,
        { method: 'POST', body }
      )

      // Handle different possible response structures
      let userData = null
      let accessToken = null

      if (response.data) {
        if (response.data.user && response.data.access_token) {
          userData = response.data.user
          accessToken = response.data.access_token
        }
        else if (response.data.dealer_user_id && response.data.access_token) {
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
    const brandName =  route.params?.brand_name || user.value?.accessibleInstances?.[0]?.url || 'login'
    try {
      const config = useRuntimeConfig()
      if (token.value) {
        await $fetch(`${config.public.apiBaseUrl || ''}logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` }
        })
      }
    } catch {
      /* ignore */
    } finally {
      clearAuth()
      await navigateTo(`/${brandName}/login`)
    }
  }

  const getUser = async () => {
    if (!token.value) return null
    const brandName = route.params?.brand_name || user.value?.accessibleInstances?.[0]?.url || 'login'
    try {
      const config = useRuntimeConfig()
      const { data } = await $fetch<{ data: { user: User } }>(
        `${config.public.apiBaseUrl}user`,
        { headers: { Authorization: `Bearer ${token.value}` } }
      )
      setUser(data.user)
      return data.user
    } catch (e) {
      console.error('getUser failed', e)
      clearAuth()
      await navigateTo(`/${brandName}/login`)
      return null
    }
  }

  const loginWithToken = async (oneTimeToken: string) => {
    loading.value = true
    try {
      const config = useRuntimeConfig()
      const endpoint = `${config.public.apiBaseUrl || ''}login-with-id`

      const { data } = await $fetch<{ data: { user: User, access_token: string } }>(
        endpoint,
        { method: 'POST', body: { token: oneTimeToken } }
      )

      setUser(data.user)
      setToken(data.access_token)

      await navigateTo('/')
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