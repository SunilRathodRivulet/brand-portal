import { defineStore } from 'pinia'

export interface User {
  id: number
  email: string
  name?: string
  [key: string]: any
}

interface AuthState {
  user: User | null
  accessToken: string | null
  loading: boolean
}

export const useAuthStore = defineStore('auth', () => {
  const state = reactive<AuthState>({
    user: null,
    accessToken: null,
    loading: false
  })

  const config = useRuntimeConfig()

  // Getters
  const isAuthenticated = computed(() => !!state.accessToken && !!state.user)

  // Actions
  const setUser = (user: User) => {
    state.user = user
  }

  const setToken = (token: string) => {
    state.accessToken = token
  }

  const clearAuth = () => {
    state.user = null
    state.accessToken = null
  }

  const login = async (email: string, password: string, workspaceUrlSlug?: string) => {
    state.loading = true
    try {
      const loginUrl = config.public.apiBaseUrl ? `${config.public.apiBaseUrl}login` : '/api/login'

      const body: any = { email, password }

      // Add workspace_id if provided (for brand-specific login)
      if (workspaceUrlSlug) {
        body.workspace_id = workspaceUrlSlug
      }

      const response: any = await $fetch(loginUrl, {
        method: 'POST',
        body
      })

      if (response?.data?.user) {
        setUser(response.data.user)
        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.data.user))
        }
      }

      if (response?.data?.access_token) {
        setToken(response.data.access_token)

        // Store in localStorage for persistence
        if (process.client) {
          localStorage.setItem('auth_token', response.data.access_token)
        }

        if (response?.data?.instance?.url) await navigateTo(`/${response.data.instance.url}`)
        else await navigateTo('/')
        return { success: true }
      } else {
        throw new Error('Invalid response')
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      return { success: false, error: error.message || 'Login failed' }
    } finally {
      state.loading = false
    }
  }

  const loginWithToken = async (token: string) => {
    state.loading = true
    try {
      const loginUrl = config.public.apiBaseUrl ? `${config.public.apiBaseUrl}login-with-id` : '/api/login-with-id'

      const response: any = await $fetch(loginUrl, {
        method: 'POST',
        body: { token }
      })

      if (response?.data?.user && response?.data?.access_token) {
        setUser(response.data.user)
        setToken(response.data.access_token)

        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.data.user))
          localStorage.setItem('auth_token', response.data.access_token)
        }

        await navigateTo('/')
        return { success: true }
      } else if (response?.user && response?.access_token) {
        setUser(response.user)
        setToken(response.access_token)

        if (process.client) {
          localStorage.setItem('auth_user', JSON.stringify(response.user))
          localStorage.setItem('auth_token', response.access_token)
        }

        await navigateTo('/')
        return { success: true }
      } else {
        throw new Error('Invalid response')
      }
    } catch (error: any) {
      console.error('Token login failed:', error)
      return { success: false, error: error.message || 'Token login failed' }
    } finally {
      state.loading = false
    }
  }

  const logout = async () => {
    try {
      const logoutUrl = config.public.apiBaseUrl ? `${config.public.apiBaseUrl}logout` : '/api/logout'

      await $fetch(logoutUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${state.accessToken}`
        }
      })
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      clearAuth()

      if (process.client) {
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_token')
      }

      navigateTo('/login')
    }
  }

  const checkAuth = () => {
    if (!process.client) return

    const storedUser = localStorage.getItem('auth_user')
    const storedToken = localStorage.getItem('auth_token')

    if (storedUser && storedToken) {
      try {
        state.user = JSON.parse(storedUser)
        state.accessToken = storedToken
      } catch (error) {
        console.error('Error parsing stored auth data:', error)
        clearAuth()
      }
    }
  }

  const getUser = async () => {
    if (!state.accessToken) return null

    try {
      const userUrl = config.public.apiBaseUrl ? `${config.public.apiBaseUrl}user` : '/api/user'

      const response: any = await $fetch(userUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${state.accessToken}`
        }
      })

      if (response?.data?.user) {
        setUser(response.data.user)
        return response.data.user
      } else if (response?.user) {
        setUser(response.user)
        return response.user
      }
    } catch (error) {
      console.error('Error fetching user:', error)
      clearAuth()
      navigateTo('/login')
    }

    return null
  }

  // Initialize auth on client side
  if (process.client) {
    checkAuth()
  }

  return {
    // State
    user: state.user,
    accessToken: state.accessToken,
    loading: state.loading,

    // Getters
    isAuthenticated,

    // Actions
    setUser,
    setToken,
    clearAuth,
    login,
    loginWithToken,
    logout,
    checkAuth,
    getUser
  }
})
