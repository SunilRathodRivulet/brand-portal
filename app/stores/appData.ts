import { defineStore } from 'pinia'

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
  const state = reactive<AppDataState>({
    bannerData: [],
    tileData: [],
    dashboardData: null,
    folders: [],
    leftMenuOpen: false,
    scrollTo: '',
    scrollToRecent: false,
    logo: '',
    brand: null,
    subscriptionFeatures: {}
  })

  // Actions
  const fetchBannerData = async () => {
    // Mock data - replace with actual API call
    state.bannerData = [
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
    // Mock data
    state.tileData = [
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
    // Mock folders
    state.folders = []
  }

  const fetchBrandDetails = async (brandName: string) => {
    const config = useRuntimeConfig()
    const apiUrl = config.public.apiBaseUrl ?
      `${config.public.apiBaseUrl}verify-domain` :
      '/api/verify-domain'

    const response: any = await $fetch(apiUrl, {
      method: 'POST',
      body: { url: brandName }
    })
    console.log('fetchBrandDetails', response)

    state.brand = response.data
    state.logo = response.data.logo
    return response.data
  }

  const fetchDashboardData = async () => {
    // Mock dashboard data
    state.dashboardData = {
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
    Object.assign(state, payload)
  }

  const fetchOrderAlertList = async () => {
    // Mock order alert data
  }

  // Actions for store operations (matching Vuex mutations)
  const assignLogo = (logo: string) => {
    state.logo = logo
  }

  const brandDetails = (brand: any) => {
    state.brand = brand
  }

  const subscriptionFeatures = (features: any) => {
    state.subscriptionFeatures = features
  }

  return {
    // State
    bannerData: state.bannerData,
    tileData: state.tileData,
    dashboardData: state.dashboardData,
    folders: state.folders,
    leftMenuOpen: state.leftMenuOpen,
    scrollTo: state.scrollTo,
    scrollToRecent: state.scrollToRecent,
    logo: state.logo,
    brand: state.brand,
    subscriptionFeatures: state.subscriptionFeatures,

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
  }
})
