import '@nuxt/schema'

declare module '@nuxt/schema' {
  interface NuxtConfig {
    auth?: import('@sidebase/nuxt-auth').ModuleOptions
  }
  interface NuxtOptions {
    auth?: import('@sidebase/nuxt-auth').ModuleOptions
  }
}