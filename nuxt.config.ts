// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  css: [
    'vuetify/styles',
    '@mdi/font/css/materialdesignicons.css',
  ],
  // Configure srcDir to point to the app directory
  srcDir: 'app/',

  // TypeScript configuration
  typescript: {
    strict: false,
    typeCheck: false
  },

  // Auto-imports configuration for TypeScript
  imports: {
    dirs: [
      'composables/**',
      'utils/**',
      'stores/**',
      'types/**',
      'constants/**'
    ]
  },
  $schema: undefined,  


  components: [
    { path: '~/components', pathPrefix: false }, // Auto-import all components
  ],
  build: {
    transpile: ['vuetify'],
  },
  plugins: [
    // '~/plugins/fetch.ts',
    '~/plugins/pinia.ts',
    '~/plugins/vuetify.ts',
  ],
  runtimeConfig: {
    // Private (server-only) keys
    typesenseHost: process.env.TYPESENSE_HOST,
    typesensePort: process.env.TYPESENSE_PORT,
    typesenseProtocol: process.env.TYPESENSE_PROTOCOL,
    typesenseApiKey: process.env.TYPESENSE_API_KEY,
    typesenseConnectionTimeout: process.env.TYPESENSE_CONNECTION_TIMEOUT,
    zipDownloadUrl: process.env.ZIP_DOWNLOAD_URL,
    // Auth secret for NextAuth
    authSecret: process.env.AUTH_SECRET,
    // Secure cookie flag
    secureCookie: process.env.SECURE_AUTH_COOKIE === 'true',
    public: {
      appName: process.env.APP_NAME,
      baseUrl: process.env.BASE_URL,
      apiBaseUrl: process.env.API_BASE_URL,
      backendUrl: process.env.BACKEND_URL,
      userPlaceHolderImg: process.env.USER_PLACEHOLDER_IMG,
      googleAuthUrl: process.env.GOOGLE_AUTH_URL,
      damBackendBaseUrl: process.env.ADMIN_FRONTEND_URL,
    },
  }
})
