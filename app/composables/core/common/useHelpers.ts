import dayjs from "dayjs"
import { useAuthStore } from '~/stores/auth'
import { useAppDataStore } from '~/stores/appData'
import { useRoute } from '#app'
import { computed } from 'vue'

export const useHelpers = () => {
  const authStore = useAuthStore()
  const appDataStore = useAppDataStore()

  const setCurrentWorkspace = (workspaceId: string) => {
    if (!authStore.user?.accessibleInstances) return

    const workspace = authStore.user.accessibleInstances.find(
      ({ workspace_id }) => parseInt(workspace_id) === parseInt(workspaceId)
    )

    if (workspace && import.meta.client) {
      localStorage.setItem('currentWorkspace', JSON.stringify(workspace))
    }
  }

  const _auth = () => {
    if (authStore.isAuthenticated && import.meta.client) {
      const storedWorkspace = localStorage.getItem('currentWorkspace')
      return storedWorkspace ? JSON.parse(storedWorkspace) : null
    }
    return null
  }

  const getBrandName = () => {
    const route = useRoute()
    const currentWorkspace = _auth()

    if (currentWorkspace?.is_domain === 1) {
      return currentWorkspace?.workspace_id || route.params.brand_name
    } else {
      return currentWorkspace?.url || route.params.brand_name
    }
  }

  const brandName = () => {
    const route = useRoute()
    const currentWorkspace = _auth()

    return currentWorkspace?.brand_name || route.params.brand_name
  }

  // Use reactive value to track store changes
  const brandDetail = computed({
    get: () => appDataStore.brand,
    set: (_value) => { } // readonly, ignore sets
  })

  const getWorkspaceId = () => {
    if (authStore.isAuthenticated) {
      return _auth()?.workspace_id || authStore.user.workspace_id
    }
    return null
  }

  const toHumanlySize = (size: number | string) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
    size = Number(size)
    let index = 0
    while (size > 900) {
      size /= 1024
      index += 1
    }

    return (
      Number(Math.round(size * 100) / 100).toLocaleString() + ' ' + sizes[index]
    )
  }

  const formatDate = (date: string | Date): string => dayjs(date).format("MMM D, YYYY");

  const toQueryString = (obj: Record<string, unknown>) => {
    const params: string[] = []

    if (!obj || typeof obj !== 'object') return ''

    Object.entries(obj).forEach(([key, value]: [string, unknown]) =>
      params.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    )

    return params.join('&')
  }

  const downloadAsset = (attachment_type: string | number, assets_id: string | number) => {
    const downloadURL = `/get_assets?${toQueryString({
      attachment_type,
      assets_id,
      is_backend_download: 0,
    })}`

    const link = document.createElement('a')
    link.href = window.location.origin + downloadURL
    document.body.appendChild(link)
    link.click()
  }
  const downloadCollectionAsset = (
    attachment_type: string | number,
    assets_id: string | number,
    collection_id: string | number
  ) => {
    const downloadURL = `/get_assets?${toQueryString({
      attachment_type,
      assets_id,
      collection_id,
      is_backend_download: 0,
    })}`

    const link = document.createElement('a')
    link.href = window.location.origin + downloadURL
    document.body.appendChild(link)
    link.click()
  }

  const getErrorMessage = (e: any) => {
    if (e) {
      const { data } = e.response || {}
      return (data && data.message) || e.message || e
    }
  }

  const sortBy = (field: string, reverse: boolean, primer?: (x: any) => any, ignoreCase = false) => {
    const key = primer ? (x: any) => primer(x[field]) : (x: any) => x[field]
    const sortOrder: number = reverse ? -1 : 1

    return function (a: any, b: any) {
      a = key(a)
      b = key(b)

      if (a === null) return sortOrder * 1
      else if (b === null) return sortOrder * -1

      if (ignoreCase) {
        a = a && a.toUpperCase()
        b = b && b.toUpperCase()
      }

      // if (typeof a === "number" && typeof b === "number")
      //   return sortOrder * (a - b);

      return sortOrder * (Number(a > b) - Number(b > a))
    }
  }

  return {
    setCurrentWorkspace,
    _auth,
    getBrandName,
    brandName,
    brandDetail,
    getWorkspaceId,
    toHumanlySize,
    formatDate,
    toQueryString,
    downloadAsset,
    downloadCollectionAsset,
    getErrorMessage,
    sortBy,
  }
}
