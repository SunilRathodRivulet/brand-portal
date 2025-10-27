import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import type { Ref } from 'vue'
import { useNotificationApi } from '~/composables/api/useNotificationApi'

// Types
interface Announcement {
  id: number
  read_at: string | null
  [key: string]: any
}

interface BadgesCountResponse {
  dam_badges_count: number
}

interface AnnouncementListResponse {
  data: Announcement[]
  last_page: number
  total_unread_announcement: number
}

interface ReadAnnouncementResponse {
  total_unread_notification: number
}

// Extend NuxtApp interface for Laravel Echo
declare module '#app' {
  interface NuxtApp {
    $echo?: any
  }
}

export function useDamNotification(props?: { navCollapsed?: boolean }) {
  // State used by Notification.vue component
  const initialLoading_ = ref<boolean>(false)
  const loadMoreLoading_ = ref<boolean>(false)
  const page_ = ref<number>(1)
  const lastPage_ = ref<number>(1)
  const announcements = ref<Announcement[]>([])
  const unreadAnnouncements = ref<number>(0)
  const isMenuOpen = ref<boolean>(false)
  const dialog = ref<boolean>(false)
  const selectedAnnouncement = ref<Announcement | null>(null)
  const workspaceModule = ref<any>(null)
  const showLast30DaysMsg_ = ref<boolean>(false)
  const authStore = useAuthStore()
  const notificationApi = useNotificationApi()

  // Computed used by Notification.vue component
  const displayBatchCount = computed(() => {
    const badgesCount = authStore.user?.dam_badges_count || 0
    return {
      show: badgesCount >= 1,
      count_: badgesCount > 9 ? `9+` : `${badgesCount}`,
    }
  })

  const announcementComputed = computed(() => announcements.value)

  const showMarkAllAsReadAnnouncement = computed(() => {
    const data = announcements.value.filter(({ read_at }) => read_at === null)
    return data.length > 0
  })

  // Methods used by Notification.vue component
  const readAllAnnouncements = async (): Promise<void> => {
    announcements.value = announcements.value.map((data) => {
      return { ...data, read_at: 'read' }
    })
    unreadAnnouncements.value = 0
    try {
      await notificationApi.markAllAnnouncementsAsRead()
    } catch (e: any) {
      console.log(e)
    }
  }

  const readUnreadAnnouncement = async (aId: number): Promise<void> => {
    const findIndex = announcements.value.findIndex(
      ({ id }) => parseInt(id.toString()) === parseInt(aId.toString())
    )
    if (findIndex !== -1) {
      const read_at = announcements.value[findIndex].read_at ? null : 'read'
      announcements.value[findIndex].read_at = read_at
      const currentCount = unreadAnnouncements.value
      unreadAnnouncements.value = announcements.value[findIndex].read_at
        ? currentCount - 1
        : currentCount + 1
    }
    try {
      const response = await notificationApi.readUnreadAnnouncement(aId)
      console.log(response)
    } catch (e: any) {
      console.log(e)
    }
  }

  const onScroll = async (): Promise<void> => {
    if (showLast30DaysMsg_.value) {
      return
    }
    try {
      await fetchAnnouncements('loadMore')
    } catch (e: any) {
      loadMoreLoading_.value = false
      initialLoading_.value = false
      // Use toast notification if available
      console.error('Error loading more announcements:', e)
    }
  }

  const fetchAnnouncements = async (flag: string): Promise<void> => {
    try {
      if (flag === 'loadMore') {
        if (page_.value > lastPage_.value) return
        loadMoreLoading_.value = true
      } else {
        initialLoading_.value = true
        // Reset announcements and page when initially loading
        announcements.value = []
        page_.value = 1
        lastPage_.value = 0
      }

      const response = await notificationApi.getAnnouncements(page_.value)
      console.log('Announcements response:', response)
      lastPage_.value = response.last_page
      announcements.value.push(...response.data)
      unreadAnnouncements.value = response.total_unread_announcement
      initialLoading_.value = false
      if (page_.value < lastPage_.value) {
        page_.value += 1
      } else {
        showLast30DaysMsg_.value = true
      }
      loadMoreLoading_.value = false
    } catch (e: any) {
      initialLoading_.value = false
      console.error('Error in initialLoadAnnouncements:', e)
    }
  }

  const openModal = (anno: Announcement): void => {
    selectedAnnouncement.value = anno
    dialog.value = true
  }

  const closeDialog = (): void => {
    dialog.value = false
    selectedAnnouncement.value = null
  }

  const getFirstCharClass = (name: string): string => {
    return name ? name.charAt(0).toUpperCase() : ''
  }

  // Watchers
  watch(isMenuOpen, (newValue) => {
    if (newValue && announcements.value.length === 0) {
      fetchAnnouncements('initial')
    }
  })

  // Lifecycle
  onMounted(() => {
    // Real-time updates via WebSocket for badge count
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$echo && authStore.user?.id) {
      nuxtApp.$echo
        .private(`user.${authStore.user.id}.DAMFrontendAnnouncementNotification`)
        .listen('.DAMFrontendAnnouncement', (e: any) => {
          // Badge count updates are handled by displayBatchCount computed
        })
    }
  })

  onUnmounted(() => {
    const nuxtApp = useNuxtApp()
    if (nuxtApp.$echo && authStore.user?.id) {
      nuxtApp.$echo.leave(
        `user.${authStore.user.id}.DAMFrontendAnnouncementNotification`
      )
    }
  })

  return {
    // State used by Notification.vue
    initialLoading_,
    loadMoreLoading_,
    page_,
    lastPage_,
    announcements,
    unreadAnnouncements,
    isMenuOpen,
    dialog,
    selectedAnnouncement,
    workspaceModule,

    // Computed used by Notification.vue
    displayBatchCount,
    announcementComputed,
    showMarkAllAsReadAnnouncement,

    // Methods used by Notification.vue
    readAllAnnouncements,
    readUnreadAnnouncement,
    onScroll,
    openModal,
    closeDialog,
    getFirstCharClass,
  }
}

// Helper function for checking empty objects (replacement for lodash isEmpty)
function isEmpty(obj: any): boolean {
  if (obj == null) return true
  if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}
