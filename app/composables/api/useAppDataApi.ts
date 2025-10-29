import { useNuxtApp } from '#imports'
import type { Banner, Tile, File, DashboardData } from '@/stores/appData'

export interface Folder {
  // Define based on actual response, for now using any
  [key: string]: any
}

export interface BrandDetails {
  // Define based on actual response, assuming similar to auth user or something
  logo?: string
  brand_name?: string
  [key: string]: any
}

export const useAppDataApi = () => {
  const { $api } = useNuxtApp()

  const getDashboardData = async (workspaceId: string | number, instanceId: string | number) => {
    try {
      const response = await $api<{ data: DashboardData }>(`digital/common-data`, {
        method: 'GET',
        query: { workspace_id: workspaceId, instance_id: instanceId }
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] getDashboardData - Error:', error)
      throw error
    }
  }

  const getTiles = async (workspaceId: string | number) => {
    try {
      const response = await $api<{ data: Tile[] }>(`digital/get-tiles`, {
        method: 'GET',
        query: { workspace_id: workspaceId }
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] getTiles - Error:', error)
      throw error
    }
  }

  const getBanners = async (workspaceId: string | number, instanceId: string | number) => {
    try {
      const response = await $api<{ data: Banner[] }>(`digital/get-banners`, {
        method: 'GET',
        query: { workspace_id: workspaceId, instance_id: instanceId }
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] getBanners - Error:', error)
      throw error
    }
  }

  const getFolders = async (workspaceId: string | number, subfolderList: boolean) => {
    try {
      const response = await $api<{ data: Folder[] }>(`digital/category-list`, {
        method: 'GET',
        query: { workspace_id: workspaceId, subfolder_list: subfolderList ? 1 : 0 }
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] getFolders - Error:', error)
      throw error
    }
  }

  const verifyDomain = async (brandName: string) => {
    try {
      // Assuming it's a POST or GET, adjust method as needed
      const response = await $api<{ data: BrandDetails }>(`verify-domain`, {
        method: 'POST',
        body: { url: brandName }
      })
      return response.data
    } catch (error: any) {
      console.error('[AppDataAPI] verifyDomain - Error:', error)
      throw error
    }
  }

  return {
    getDashboardData,
    getTiles,
    getBanners,
    getFolders,
    verifyDomain
  }
}
