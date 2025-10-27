import { useNuxtApp } from '#imports'

export const useCommonApis = () => {
  const { $api } = useNuxtApp()

  const getUserProfile = async (userId?: string) => {
    try {
      const response = await $api('user/profile', {
        method: 'GET',
        params: userId ? { user_id: userId } : {}
      })
      return response
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      throw error
    }
  }

  const updateUserProfile = async (profileData: any) => {
    try {
      const response = await $api('user/profile', {
        method: 'PUT',
        body: profileData
      })
      return response
    } catch (error) {
      console.error('Failed to update user profile:', error)
      throw error
    }
  }

  const getNotifications = async (params?: { page?: number; limit?: number; unread?: boolean }) => {
    try {
      const response = await $api('notifications', {
        method: 'GET',
        params
      })
      return response
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      throw error
    }
  }

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      const response = await $api(`notifications/${notificationId}/read`, {
        method: 'POST'
      })
      return response
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
      throw error
    }
  }

  const getSystemSettings = async () => {
    try {
      const response = await $api('system/settings', {
        method: 'GET'
      })
      return response
    } catch (error) {
      console.error('Failed to fetch system settings:', error)
      throw error
    }
  }

  return {
    getUserProfile,
    updateUserProfile,
    getNotifications,
    markNotificationAsRead,
    getSystemSettings
  }
}
