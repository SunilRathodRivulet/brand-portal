import {
  addCancelController,
  addThrottleController,
  removeCancelController,
  removeThrottleController,
} from '@/utils/cancelTokenManager'

// Types for the FetchClient
interface FetchConfig {
  url?: string
  method?: string
  headers?: Record<string, string>
  params?: Record<string, any>
  data?: any
  signal?: AbortSignal
  controller?: AbortController
  useApiBase?: boolean
  baseURL?: string
}

interface FetchResponse<T = any> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
  config: FetchConfig
  request: Response
}

interface RequestInterceptor {
  onFulfilled?: (config: FetchConfig) => FetchConfig | Promise<FetchConfig>
  onRejected?: (error: any) => any
}

interface ResponseInterceptor {
  onFulfilled?: (response: FetchResponse) => FetchResponse | Promise<FetchResponse>
  onRejected?: (error: any) => any
}

interface NuxtContext {
  $config: {
    isLocal: boolean
    baseUrl: string
    apiBaseUrl: string
  }
  route: {
    params: Record<string, any>
  }
  $auth: {
    strategy: {
      token: {
        get(): string | null
      }
    }
  }
  $clearAuthCookies(): void
  error(options: { statusCode: number; path: string; message: string }): void
}

// Rate limiter placeholder - you can implement this separately
const enqueueRequest = async (): Promise<void> => {
  // Implement rate limiting logic here if needed
  return Promise.resolve()
}

class FetchClient {
  private context: NuxtContext
  private config: NuxtContext['$config']
  private defaults: { headers: Record<string, string> }
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []

  constructor(context: NuxtContext) {
    this.context = context
    this.config = context.$config
    this.defaults = {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    }

    this.setupInterceptors()
  }

  private setupInterceptors(): void {
    this.addRequestInterceptor(async (config: FetchConfig) => {
      await enqueueRequest()

      // Check if AbortController is available (client-side or Node.js 15+)
      let controller: AbortController | null = null
      if (typeof AbortController !== 'undefined') {
        controller = new AbortController()
        config.signal = controller.signal
        config.controller = controller
        addCancelController(controller)
      }

      const url = config.url || ''
      if (url.includes('digital-assets/category/get-count/')) {
        addThrottleController(controller!)
      }

      let urlWorkspaceId = this.context.route.params.workspace_id
      if (
        !urlWorkspaceId &&
        config.params &&
        config.params.workspace_id
      ) {
        urlWorkspaceId = config.params.workspace_id
      }
      config.params = config.params || {}
      config.params.workspace_id = urlWorkspaceId

      const token = this.context.$auth.strategy.token.get()
      if (token) {
        config.headers = { ...config.headers, Authorization: `${token}` }
      }

      return config
    })

    // Response interceptor - mirrors Axios response interceptor
    this.addResponseInterceptor(
      (response: FetchResponse) => {
        // Clean up cancel controller (same as Axios)
        if (response.config && response.config.controller) {
          removeCancelController(response.config.controller)
          removeThrottleController(response.config.controller)
        }
        return response
      },
      (error: any) => {
        // Handle cancellation (equivalent to Axios.isCancel)
        if (error.name === 'AbortError') {
          // Return empty promise like Axios does for canceled requests
          return new Promise(() => {})
        }

        // Handle HTTP errors (same logic as Axios)
        const code = parseInt(error.response && error.response.status)
        const message =
          error.response?.data?.message || 'An unexpected error occurred'

        if (code === 401) {
          this.context.$clearAuthCookies()
          this.context.error({
            statusCode: 401,
            path: this.context.route.params.workspace_id || '',
            message: 'Session is expired.',
          })
        }

        const customError = {
          status: code,
          message,
          originalError: error,
        }

        return Promise.reject(customError)
      }
    )
  }

  // Add request interceptor
  addRequestInterceptor(
    onFulfilled?: RequestInterceptor['onFulfilled'],
    onRejected?: RequestInterceptor['onRejected']
  ): void {
    this.requestInterceptors.push({ onFulfilled, onRejected })
  }

  // Add response interceptor
  addResponseInterceptor(
    onFulfilled?: ResponseInterceptor['onFulfilled'],
    onRejected?: ResponseInterceptor['onRejected']
  ): void {
    this.responseInterceptors.push({ onFulfilled, onRejected })
  }

  // Process request interceptors
  private async processRequestInterceptors(config: FetchConfig): Promise<FetchConfig> {
    for (const interceptor of this.requestInterceptors) {
      try {
        if (interceptor.onFulfilled) {
          config = await interceptor.onFulfilled(config)
        }
      } catch (error) {
        if (interceptor.onRejected) {
          return interceptor.onRejected(error)
        }
        throw error
      }
    }
    return config
  }

  // Process response interceptors
  private async processResponseInterceptors(
    response: FetchResponse | null,
    error: any = null
  ): Promise<FetchResponse> {
    for (const interceptor of this.responseInterceptors) {
      try {
        if (error) {
          if (interceptor.onRejected) {
            return interceptor.onRejected(error)
          }
        } else {
          if (interceptor.onFulfilled && response) {
            response = await interceptor.onFulfilled(response)
          }
        }
      } catch (interceptorError) {
        error = interceptorError
      }
    }

    if (error) {
      throw error
    }
    return response!
  }

  // Main request method
  async request<T = any>(config: FetchConfig): Promise<FetchResponse<T>> {
    try {
      // Handle base URL logic
      const shouldUseApiBase = config.useApiBase !== false
      const origin =
        process.client && typeof window !== 'undefined'
          ? window.location.origin
          : this.config.isLocal
          ? 'http://localhost:3003/'
          : this.config.baseUrl // fallback for SSR

      config.baseURL = shouldUseApiBase ? this.config.apiBaseUrl : origin

      // Process request interceptors
      config = await this.processRequestInterceptors(config)

      // Prepare fetch options
      const url = this.buildUrl(config.url!, config.baseURL!, config.params)
      const options = this.buildFetchOptions(config)

      // Make the request
      const response = await fetch(url, options)

      // Create response object similar to Axios
      const axiosLikeResponse = await this.createAxiosLikeResponse(response, config)

      // Process response interceptors
      return await this.processResponseInterceptors(axiosLikeResponse)
    } catch (error) {
      // Process error through response interceptors
      const processedError = await this.processResponseInterceptors(null, error)
      throw processedError
    }
  }

  // Build complete URL with query parameters
  private buildUrl(url: string, baseURL: string, params?: Record<string, any>): string {
    let fullUrl = url

    if (!url.startsWith('http')) {
      const base = baseURL || this.config.apiBaseUrl
      fullUrl = `${base}${url.startsWith('/') ? '' : '/'}${url}`

      // Normalize multiple slashes (excluding protocol)
      fullUrl = fullUrl.replace(/([^:]\/)\/+/g, '$1')
    }

    // Add query parameters
    if (params && Object.keys(params).length > 0) {
      const searchParams = new URLSearchParams()
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, params[key])
        }
      })
      const queryString = searchParams.toString()
      if (queryString) {
        fullUrl += (fullUrl.includes('?') ? '&' : '?') + queryString
      }
    }

    return fullUrl
  }

  // Build fetch options from config
  private buildFetchOptions(config: FetchConfig): RequestInit {
    const options: RequestInit = {
      method: config.method?.toUpperCase() || 'GET',
      headers: { ...this.defaults.headers, ...config.headers },
    }

    // Only add signal if it exists (AbortController is available)
    if (config.signal) {
      options.signal = config.signal
    }

    // Add body for non-GET requests
    if (
      config.data &&
      ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method!)
    ) {
      if (config.data instanceof FormData) {
        options.body = config.data
        delete (options.headers as Record<string, string>)['Content-Type']
      } else if (typeof config.data === 'object') {
        options.body = JSON.stringify(config.data)
      } else {
        options.body = config.data
      }
    }

    return options
  }

  // Create Axios-like response object
  private async createAxiosLikeResponse(response: Response, config: FetchConfig): Promise<FetchResponse> {
    let data: any
    const contentType = response.headers.get('content-type')

    try {
      if (contentType && contentType.includes('application/json')) {
        data = await response.json()
      } else {
        data = await response.text()
      }
    } catch (error) {
      data = null
    }

    const axiosResponse: FetchResponse = {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: this.parseHeaders(response.headers),
      config,
      request: response,
    }

    // Handle non-2xx responses as errors (like Axios)
    if (!response.ok) {
      const error = new Error(`Request failed with status ${response.status}`)
      ;(error as any).response = axiosResponse
      ;(error as any).request = response
      ;(error as any).config = config
      throw error
    }

    return axiosResponse
  }

  // Parse headers to object
  private parseHeaders(headers: Headers): Record<string, string> {
    const parsed: Record<string, string> = {}
    for (const [key, value] of headers.entries()) {
      parsed[key] = value
    }
    return parsed
  }

  // Check if error is cancellation (equivalent to Axios.isCancel)
  isCancel(error: any): boolean {
    return error && error.name === 'AbortError'
  }

  // CancelToken equivalent for compatibility
  CancelToken = {
    source: () => {
      if (typeof AbortController !== 'undefined') {
        const controller = new AbortController()
        return {
          token: controller.signal,
          cancel: (message?: string) => controller.abort(message),
          controller,
        }
      } else {
        // Fallback for server-side or environments without AbortController
        return {
          token: null,
          cancel: () => {},
          controller: null,
        }
      }
    },
  }

  // HTTP method helpers (mirroring Axios API)
  get<T = any>(url: string, config: FetchConfig = {}): Promise<FetchResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url })
  }

  post<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<FetchResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data })
  }

  put<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<FetchResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data })
  }

  patch<T = any>(url: string, data?: any, config: FetchConfig = {}): Promise<FetchResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data })
  }

  delete<T = any>(url: string, config: FetchConfig = {}): Promise<FetchResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url })
  }
}

export default function (context: NuxtContext): FetchClient {
  // Create fetch client instance
  const fetchClient = new FetchClient(context)

  // Inject into context as $fetch (similar to $axios)
  ;(context as any).$fetch = fetchClient

  // Make it available for direct access
  if (process.client) {
    ;(window as any).$fetch = fetchClient
  }

  return fetchClient
}
