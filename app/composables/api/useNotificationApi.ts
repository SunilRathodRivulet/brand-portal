import { useNuxtApp } from '#imports'

export interface Announcement {
  id: number
  read_at: string | null
  [key: string]: any
}

export interface AnnouncementListResponse {
  data: Announcement[]
  last_page: number
  total_unread_announcement: number
}

export interface ReadAnnouncementResponse {
  total_unread_notification: number
}

export const useNotificationApi = () => {
  const { $api } = useNuxtApp()

  const markAllAnnouncementsAsRead = async () => {
    try {
      const response = await $api('digital/announcement/mark-all-read', {
        method: 'POST'
      })
      return response
    } catch (error: any) {
      console.error('[NotificationAPI] markAllAnnouncementsAsRead - Error:', error)
      throw error
    }
  }

  const readUnreadAnnouncement = async (notificationId: number) => {
    try {
      const response = await $api<ReadAnnouncementResponse>('digital/announcement/read-unread', {
        method: 'POST',
        body: {
          notification_id: notificationId,
        }
      })
      return response
    } catch (error: any) {
      console.error('[NotificationAPI] readUnreadAnnouncement - Error:', error)
      throw error
    }
  }

  const getAnnouncements = async (page: number = 1) => {
    try {
      const response = await $api<AnnouncementListResponse>(
        `digital/announcement/notification-list?page=${page}`
      )
      return response
    } catch (error: any) {
      console.error('[NotificationAPI] getAnnouncements - Error:', error)
      throw error
    }
  }

  return {
    markAllAnnouncementsAsRead,
    readUnreadAnnouncement,
    getAnnouncements
  }
}
