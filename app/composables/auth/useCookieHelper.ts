import { useCookie } from '#app'

export const useCookieHelper = () => {
  const setAuthCookies = (token: string, user: any) => {
    const tokenCookie = useCookie('auth_token', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
    })
    tokenCookie.value = token

    const userCookie = useCookie('auth_user', {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      secure: process.env.NODE_ENV === 'production',
    })
    userCookie.value = user
  }

  const clearAuthCookies = () => {
    const tokenCookie = useCookie('auth_token')
    const userCookie = useCookie('auth_user')
    const currentWorkspaceCookie = useCookie('currentWorkspace')

    tokenCookie.value = null
    userCookie.value = null
    currentWorkspaceCookie.value = null
  }

  const getAuthToken = (): string | null => {
    const tokenCookie = useCookie('auth_token')
    return tokenCookie.value
  }

  const getAuthUser = (): any | null => {
    const userCookie = useCookie('auth_user')
    return userCookie.value
  }

  return {
    setAuthCookies,
    clearAuthCookies,
    getAuthToken,
    getAuthUser,
  }
}
