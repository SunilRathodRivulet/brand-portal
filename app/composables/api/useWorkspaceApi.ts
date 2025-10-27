import { useNuxtApp } from '#imports'

export interface CheckPublicPortalResponse {
  code: number
  data?: {
    workspace_id?: string
    email?: string
    password?: string
  }
}

export interface UpdateUserInstanceResponse {
  [key: string]: any
}

export const useWorkspaceApi = () => {
  const { $api } = useNuxtApp()

  const checkPublicPortal = async (url: string) => {
    try {
      const response = await $api<CheckPublicPortalResponse>('check-public-portal', {
        method: 'POST',
        body: { url }
      })
      return response
    } catch (error: any) {
      console.error('[WorkspaceAPI] checkPublicPortal - Error:', error)
      throw error
    }
  }

  const updateUserInstance = async (formData: FormData) => {
    try {
      const response = await $api<UpdateUserInstanceResponse>('digital/instance/update-user', {
        method: 'POST',
        body: formData
      })
      return response
    } catch (error: any) {
      console.error('[WorkspaceAPI] updateUserInstance - Error:', error)
      throw error
    }
  }

  return {
    checkPublicPortal,
    updateUserInstance
  }
}
