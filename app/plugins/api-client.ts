export default defineNuxtPlugin((nuxtApp) => {
  const abortControllers = new Map()
  const timeouts = []

  // Helper function to get auth token from multiple sources
  const getAuthToken = () => {
    try {
      // First, try to get from auth store
      const authStore = useAuthStore()
      if (authStore.isAuthenticated && authStore.accessToken) {
        return authStore.accessToken
      }
    } catch (e) {
      console.warn('Could not access auth store:', e)
    }

    // Fallback: try to get from cookie
    try {
      const tokenCookie = useCookie('auth_token')
      if (tokenCookie.value) {
        return tokenCookie.value
      }
    } catch (e) {
      console.warn('Could not access auth cookie:', e)
    }

    return null
  }

  // Global API client configuration
  const apiClient = $fetch.create({
    onRequest({ request, options }: any) {
      // Create AbortController for request cancellation
      const controller = new AbortController()
      options.signal = controller.signal

      // Handle request as string for URL checks
      let requestUrl = typeof request === 'string' ? request : request.url || ''
      abortControllers.set(requestUrl, controller)

      // Auto-prepend base URL for internal API calls (unless it's already a full URL or external)
      const config = useRuntimeConfig()

      // Check if this is an external URL (starts with http/https) or if explicitly marked as external
      const isExternalUrl = requestUrl.startsWith('http://') || requestUrl.startsWith('https://') || (options as any).external === true

      // Only try to prepend base URL if we have one configured and it's not an external URL
      if (!isExternalUrl) {
        const apiBaseUrl = config.public?.apiBaseUrl

        if (apiBaseUrl) {
          // Remove leading slash from request if present to avoid double slashes
          const cleanRequestUrl = requestUrl.startsWith('/') ? requestUrl.slice(1) : requestUrl
          const finalUrl = `${apiBaseUrl}${cleanRequestUrl}`

          // ✅ FIXED: Properly update the request parameter
          // This is the correct way to modify the URL in $fetch
          Object.assign(options, { 
            ...options,
            baseURL: apiBaseUrl,
          })
          
          // Update request to be the clean path (without leading slash)
          if (typeof request === 'string') {
            // Modify the request through options
            options.url = cleanRequestUrl
          }
          
          requestUrl = finalUrl
        } else {
          console.warn('⚠️ No apiBaseUrl configured! Please set API_BASE_URL environment variable.')
          console.log('🔧 Runtime config debug:', {
            public: config.public,
            apiBaseUrl: apiBaseUrl,
            requestUrl: requestUrl
          })
        }
      }

      // Check if authentication should be skipped for this request
      const skipAuth = (options as any).skipAuth === true

      // Get auth token from multiple sources (only if auth is not skipped)
      const token = skipAuth ? null : getAuthToken()

      if (token && !skipAuth) {
        // Initialize headers if not present
        if (!options.headers) {
          options.headers = new Headers()
        }

        // Ensure headers is an object we can modify
        if (options.headers instanceof Headers) {
          options.headers.set('Authorization', `Bearer ${token}`)
        } else if (Array.isArray(options.headers)) {
          // Handle array format
          options.headers.push(['Authorization', `Bearer ${token}`])
        } else {
          // Handle plain object format
          (options.headers as Record<string, string>).Authorization = `Bearer ${token}`
        }
      } else if (skipAuth) {
        console.log('🔓 Auth skipped for request:', requestUrl)
      } else {
        console.log('❌ No auth token available for request:', requestUrl)
      }
    },

    onResponse({ request }) {
      // Clean up AbortController
      const requestUrl = typeof request === 'string' ? request : request.url || ''
      if (abortControllers.has(requestUrl)) {
        abortControllers.delete(requestUrl)
      }
    },

    onResponseError({ request, response }) {
      // Clean up AbortController on error
      const requestUrl = typeof request === 'string' ? request : request.url || ''
      if (abortControllers.has(requestUrl)) {
        abortControllers.delete(requestUrl)
      }

      // Handle aborted requests
      if (response.status === 0 && response.statusText === 'AbortError') {
        console.log('Request cancelled:', response.statusText)
      }

      // Handle 401 Unauthorized - token might be expired
      if (response.status === 401) {
        // Optionally trigger logout on client side
        if (process.client) {
          try {
            console.log('401 Unauthorized response - triggering logout')
            const authStore = useAuthStore()
            authStore.logout()
          } catch (e) {
            console.error('Could not logout on 401:', e)
          }
        }
      }
    }
  })

  // Cancel all requests function
  const cancelAllRequests = () => {
    abortControllers.forEach((controller) => {
      controller.abort()
    })
    abortControllers.clear()

    timeouts.forEach((timeoutId) => clearTimeout(timeoutId))
    timeouts.length = 0
  }

  return {
    provide: {
      api: apiClient,
      cancelAllRequests,
      // Provide $api for backward compatibility with existing code
      $api: apiClient
    }
  }
})