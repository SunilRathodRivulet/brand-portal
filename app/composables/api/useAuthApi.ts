import { useNuxtApp } from '#imports'
import type { User } from '~/stores/auth'

export interface LoginResponse {
  data?: {
    user?: any
    access_token?: string
    dealer_user_id?: number
    email?: string
    name?: string
    workspace_id?: string
  }
  access_token?: string
  user_id?: number
  email?: string
}

export const useAuthApi = () => {
  const { $api } = useNuxtApp()

  const login = async (email: string, password: string, workspaceUrlSlug?: string) => {
    try {
      const body: any = { email, password }
      if (workspaceUrlSlug) body.workspace_id = workspaceUrlSlug

      const response = await $api<LoginResponse>('login', {
        method: 'POST',
        body,
        skipAuth: true
      })

      return response
    } catch (error: any) {
      console.error('[AuthAPI] login - Error:', error)
      throw error
    }
  }

  const logout = async (token?: string | null) => {
    try {
      if (token) {
        await $api('logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (error) {
      console.error('[AuthAPI] logout - Error:', error)
      // Don't throw error for logout, just log it
    }
  }

  const getUser = async (token: string) => {
    try {
      const response = await $api<{ data: { user: User } }>('user', {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.user
    } catch (error: any) {
      console.error('[AuthAPI] getUser - Error:', error)
      throw error
    }
  }

  const loginWithToken = async (oneTimeToken: string) => {
    try {
      const response = await $api<{ data: { user: User, access_token: string } }>(
        'login-with-id',
        { method: 'POST', body: { token: oneTimeToken } }
      )
      return response.data
    } catch (error: any) {
      console.error('[AuthAPI] loginWithToken - Error:', error)
      throw error
    }
  }

  return {
    login,
    logout,
    getUser,
    loginWithToken
  }
}
