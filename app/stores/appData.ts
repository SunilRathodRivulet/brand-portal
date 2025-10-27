import { defineStore } from 'pinia'
import { useAppDataApi } from '~/composables/api/useAppDataApi'

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

  // Actions
  const fetchBannerData = async () => {
    bannerData.value = [
      {
        id: 1,
        title: 'Welcome',
        description: 'Welcome to our DAM',
        image: '/placeholder-banner.jpg',
        url: '#',
        position: 1
      }
    ]
  }

  const fetchTileData = async () => {
    tileData.value = [
      {
        id: 1,
        title: 'Images',
        icon: 'mdi-camera',
        url: '/folders#images',
        position: 1
      },
      {
        id: 2,
        title: 'Documents',
        icon: 'mdi-file-document',
        url: '/folders#documents',
        position: 2
      }
    ]
  }

  const fetchFolders = async () => {
    folders.value = []
  }

  const fetchBrandDetails = async (brandName: string) => {
    const brandDetails = await appDataApi.verifyDomain(brandName)

    brand.value = brandDetails
    logo.value = brandDetails?.logo || ''
    return brandDetails
  }

  const fetchDashboardData = async () => {
    dashboardData.value = {
      trending_data: [],
      recent_uploads: {
        images: [],
        documents: [],
        videos: [],
        audios: []
      },
      total_images: 0,
      total_documents: 0,
      total_videos: 0,
      total_audios: 0
    }
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
