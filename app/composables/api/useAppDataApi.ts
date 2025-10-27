import { useNuxtApp } from '#imports'

export interface BrandDetails {
  id: number
  name: string
  logo?: string
  workspace?: {
    url_slug: string
  }
  [key: string]: any
}

export const useAppDataApi = () => {
  const { $api } = useNuxtApp()

  const verifyDomain = async (brandName: string) => {
    try {
      const config = useRuntimeConfig()
      const apiUrl = config.public.apiBaseUrl ?
        `${config.public.apiBaseUrl}verify-domain` :
        '/api/verify-domain'
      const response = await $api<{ data: BrandDetails }>(apiUrl, {
        method: 'POST',
        body: { url: brandName },
        skipAuth: true
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] verifyDomain - Error:', error)
      throw error
    }
  }

  const getDashboardData = async () => {
    try {
      const response = await $api('dashboard', {
        method: 'GET'
      })
      return response
    } catch (error: any) {
      console.error('[AppDataAPI] getDashboardData - Error:', error)
      throw error
    }
  }

  const getFolders = async () => {
    try {
      const response = await $api('folders', {
        method: 'GET'
      })
      return response
    } catch (error: any) {
      console.error('[AppDataAPI] getFolders - Error:', error)
      throw error
    }
  }

  const getOrderAlerts = async () => {
    try {
      const response = await $api('order-alerts', {
        method: 'GET'
      })
      return response
    } catch (error: any) {
      console.error('[AppDataAPI] getOrderAlerts - Error:', error)
      throw error
    }
  }

  return {
    verifyDomain,
    getDashboardData,
    getFolders,
    getOrderAlerts
  }
}
