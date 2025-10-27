import { useNuxtApp } from '#imports'

export interface AccountStatusResponse {
  data?: {
    is_suspended?: boolean
  }
}

export const useAccountApi = () => {
  const { $api } = useNuxtApp()

  const checkAccountStatus = async (workspaceId: string | number) => {
    try {
      const response = await $api<AccountStatusResponse>(
        `digital/check-account-status?workspace_id=${workspaceId}`
      )
      return response
    } catch (error: any) {
      console.error('[AccountAPI] checkAccountStatus - Error:', error)
      throw error
    }
  }

  return {
    checkAccountStatus
  }
}
