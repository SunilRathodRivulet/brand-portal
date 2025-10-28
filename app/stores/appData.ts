import { defineStore } from 'pinia'
import { useAppDataApi } from '~/composables/api/useAppDataApi'
import { useAuthStore } from '~/stores/auth'
import { useSnackbar } from '~/composables/useSnackbar'
import { useHelpers } from '~/composables/core/common/useHelpers'

export interface Banner {
  id: number
  title: string
  description: string
  image: string
  url: string
  position: number
}

export interface Tile {
  id: number
  title: string
  icon: string
  url: string
  position: number
  image: string
}

export interface File {
  id: number
  name: string
  type: string
  thumbnail: string
  download_url: string
  size?: number
}

export interface DashboardData {
  trending_data: File[]
  recent_uploads: {
    images: File[]
    documents: File[]
    videos: File[]
    audios: File[]
  }
  total_images: number
  total_documents: number
  total_videos: number
  total_audios: number
}

export interface AppDataState {
  bannerData: Banner[]
  tileData: Tile[]
  dashboardData: DashboardData | null
  folders: any[]
  leftMenuOpen: boolean
  scrollTo: string
  scrollToRecent: boolean
  logo: string
  brand: any
  subscriptionFeatures: any
}

export const useAppDataStore = defineStore('appData', () => {
  // Individual refs for proper reactivity
  const bannerData = ref<Banner[]>([])
  const tileData = ref<Tile[]>([])
  const dashboardData = ref<DashboardData | null>(null)
  const folders = ref<any[]>([])
  const leftMenuOpen = ref(false)
  const scrollTo = ref('')
  const scrollToRecent = ref(false)
  const logo = ref('')
  const brand = ref<any>(null)
  const subscriptionFeatures = ref<any>({})
  const appDataApi = useAppDataApi()
  const authStore = useAuthStore()
  const snackbar = useSnackbar()

  const { getWorkspaceId, sortBy } = useHelpers()

  // Actions
  const fetchDashboardData = async () => {
    if (!authStore.isAuthenticated) return

    dashboardData.value = null
    const workspace = authStore.user?.accessibleInstances?.find(
      ({ workspace_id }) =>
        parseInt(workspace_id) === parseInt(getWorkspaceId())
    )

    if (!workspace) return

    try {
      const data = await appDataApi.getDashboardData(getWorkspaceId(), workspace.instance_id)
      dashboardData.value = data
      return data
    } catch (error) {
      snackbar.showError(error)
    }
  }
  const fetchTileData = async () => {
    if (!authStore.isAuthenticated) return

    try {
      const data = await appDataApi.getTiles(getWorkspaceId())
      tileData.value = data
      return data
    } catch (error) {
      snackbar.showError(error)
    }
  }
  const fetchBannerData = async () => {
    if (!authStore.isAuthenticated) return

    const workspace = authStore.user?.accessibleInstances?.find(
      ({ workspace_id }) =>
        parseInt(workspace_id) === parseInt(getWorkspaceId())
    )

    if (!workspace) return

    try {
      const data = await appDataApi.getBanners(getWorkspaceId(), workspace.instance_id)
      bannerData.value = data
      return data
    } catch (error) {
      snackbar.showError(error)
    }
  }

  const fetchFolders = async (subfolderList: boolean) => {
    if (!authStore.isAuthenticated) return

    try {
      const data = await appDataApi.getFolders(getWorkspaceId(), subfolderList)
      const dataSort = data.sort(
        sortBy('folder_name', false, null, true)
      )
      folders.value = dataSort
      return data
    } catch (error) {
      snackbar.showError(error)
    }
  }

  const fetchBrandDetails = async (brandName: string) => {
    const brandDetails = await appDataApi.verifyDomain(brandName)

    brand.value = brandDetails
    logo.value = brandDetails?.logo || ''
    return brandDetails
  }

  const changeScrolling = (payload: { scrollingState: boolean; scrollTo: string }) => {
    Object.assign({
      scrollToRecent: payload.scrollingState,
      scrollTo: payload.scrollTo
    })
  }

  const fetchOrderAlertList = async () => {
    // Mock order alert data
  }

  // Actions for store operations (matching Vuex mutations)
  const assignLogo = (newLogo: string) => {
    logo.value = newLogo
  }

  const brandDetails = (newBrand: any) => {
    brand.value = newBrand
  }

  const setSubscriptionFeatures = (features: any) => {
    subscriptionFeatures.value = features
  }

  const setLeftMenuState = (isOpen: boolean) => {
    leftMenuOpen.value = isOpen
  }

  return {
    // State
    bannerData,
    tileData,
    dashboardData,
    folders,
    leftMenuOpen,
    scrollTo,
    scrollToRecent,
    logo,
    brand,
    subscriptionFeatures,

    // Actions
    fetchBannerData,
    fetchTileData,
    fetchFolders,
    fetchDashboardData,
    changeScrolling,
    fetchOrderAlertList,
    assignLogo,
    brandDetails,
    fetchBrandDetails,
    setSubscriptionFeatures,
    setLeftMenuState,
  }
})
