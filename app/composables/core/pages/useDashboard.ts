import { onMounted, computed, ref } from 'vue'
import { useAppDataStore } from '@/stores/appData'
import { useAuthStore } from '@/stores/auth'
import { useHelpers } from '@/composables/core/common/useHelpers'
import { useHead, useSeoMeta } from '#imports'

export function useDashboard() {
  const appDataStore = useAppDataStore()
  const authStore = useAuthStore()
  const { getWorkspaceId, getBrandName } = useHelpers()

  // Reactive data
  const shareFile = ref<null | any>(null)
  const heroNavigateTo = ref(0)
  const selectedFile = ref<null | any>(null)
  const shareDialog = ref(false)

  const trendingRef = ref<HTMLElement>()
  const recentRef = ref<HTMLElement>()
  const contentLoading = ref(true)

  // Computed properties
  const bannerData = computed(() => {
    return [...appDataStore.bannerData].sort(
      ({ position: a }: { position: number }, { position: b }: { position: number }) => a - b
    )
  })
  const tileData = computed(() => {
    return [...appDataStore.tileData].sort(
      ({ position: a }: { position: number }, { position: b }: { position: number }) => a - b
    )
  })
  const tileSlides = computed(() => {
    const chunks: any[][] = []
    for (let i = 0; i < tileData.value.length; i += 4) {
      chunks.push(tileData.value.slice(i, i + 4))
    }
    return chunks
  })
  const dashboardData = computed(() => appDataStore.dashboardData)
  const showTrending = computed(() => authStore.user?.settings?.is_trading)
  const showRecentUploads = computed(() => authStore.user?.settings?.is_recent_upload)
  const user = computed(() => authStore.user)

  const trendingSlides = computed(() => {
    const data = dashboardData.value?.trending_data || []
    const chunks: any[][] = []
    for (let i = 0; i < data.length; i += 4) {
      chunks.push(data.slice(i, i + 4))
    }
    return chunks
  })

  const recentSlides = computed(() => {
    const slides: Record<string, any[][]> = {}
    if (dashboardData.value?.recent_uploads) {
      for (const key in dashboardData.value.recent_uploads) {
        const files = dashboardData.value.recent_uploads[key]
        const chunks: any[][] = []
        for (let i = 0; i < files.length; i += 4) {
          chunks.push(files.slice(i, i + 4))
        }
        slides[key] = chunks
      }
    }
    return slides
  })

  // Functions
  function onShareFile(file: any) {
    shareFile.value = file
    shareDialog.value = true
  }

  function keytoTitle(key: string) {
    return key[0].toUpperCase() + key.slice(1)
  }

  function normalizedForNavitor(key: string) {
    if (key === 'documents') return 'application'
    return key.slice(0, key.length - 1)
  }

  function closeShareDialog() {
    shareDialog.value = false
    shareFile.value = null
  }

  // Head (meta)
  const workspace = computed(() =>
    authStore.user?.accessibleInstances?.find(
      ({ workspace_id }: { workspace_id: any }) =>
        parseInt(workspace_id) === parseInt(getWorkspaceId())
    )
  )
  const brandName = computed(() => workspace.value?.brand_name || 'Collage Inc')
  const userLogo = computed(() =>
    workspace.value?.logo || '/'
  )

  useHead({
    title: computed(() => `${brandName.value} Brand Portal by Collage Inc`),
    htmlAttrs: { lang: 'en' },
    meta: [
      { charset: 'utf-8' },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: computed(() => authStore.user?.branding?.brand_favicon || '/favicon.png'),
      },
    ],
  })

  useSeoMeta({
    ogImage: userLogo,
    ogImageAlt: computed(() => `${brandName.value} Logo`),
    ogImageWidth: '1200',
    ogImageHeight: '630',
    ogImageType: 'image/png',
    twitterCard: 'summary_large_image',
    ogTitle: computed(() => `${brandName.value} Brand Portal by Collage Inc`),
    ogLocale: 'en_US',
    ogType: 'website',
    ogUrl: '/',
    ogSiteName: 'Collage',
  })

  // Lifecycle
  onMounted(async () => {
    // Only fetch data if user is authenticated to avoid 401 errors that clear auth
    contentLoading.value = true
    if (authStore.isAuthenticated) {
      await appDataStore.fetchBannerData()
      await appDataStore.fetchTileData()
      await appDataStore.fetchFolders(false)
      await appDataStore.fetchDashboardData()
    }
    contentLoading.value = false
  })

  return {
    shareFile,
    heroNavigateTo,
    selectedFile,
    shareDialog,
    trendingRef,
    recentRef,
    contentLoading,
    bannerData,
    tileData,
    tileSlides,
    dashboardData,
    showTrending,
    showRecentUploads,
    user,
    trendingSlides,
    recentSlides,
    onShareFile,
    keytoTitle,
    normalizedForNavitor,
    closeShareDialog,
    getBrandName,
  }
}
