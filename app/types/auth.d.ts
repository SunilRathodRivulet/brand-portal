import '@nuxt/schema'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    auth?: import('@sidebase/nuxt-auth').ModuleOptions
  }
  interface NuxtOptions {
    auth?: import('@sidebase/nuxt-auth').ModuleOptions
  }
}

declare module '#app' {
  interface NuxtApp {
    $api: $Fetch
    $cancelAllRequests: () => void
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $api: $Fetch
    $cancelAllRequests: () => void
  }
}
