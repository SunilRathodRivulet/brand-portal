// /composables/core/layouts/useCollageSidebar.ts
import { ref, computed, onMounted, onBeforeUnmount, watch, toRaw, type Ref, type ComputedRef } from 'vue'
import { useRoute, useRouter, useRuntimeConfig } from '#imports'
import { useNuxtApp } from '#app'

// Type definitions
interface MenuRoute {
  title: string;
  name: string;
  icon: string;
  requireAccess?: boolean;
}

interface CreateNewRoute {
  title: string;
  icon: string;
  route?: { name: string };
  replace?: boolean;
  clickEvent?: string;
}


interface Workspace {
  id: number;
  name: string;
  is_suspended: boolean;
  is_trial_account: boolean;
  trial_expire: string;
  is_payment_added: boolean;
  [key: string]: any;
}


export default function useCollageSidebar() {
  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const runtimeConfig = useRuntimeConfig()
  const authStore = useAuthStore()
  const appStore = useAppDataStore()
  const { setCurrentWorkspace, _auth, getBrandName } = useHelpers()

  // state - initialize consistently for SSR
  const drawer: Ref<boolean> = ref(true)
  const mini: Ref<boolean> = ref(false)
  const oldMini: Ref<boolean> = ref(false)
  const selectedItem: Ref<any> = ref(null)
  const contentLoading: Ref<boolean> = ref(true)
  const userBrandName: Ref<string> = ref('')
  const userLogo: Ref<string> = ref('')
  const authInstanceId = ref<number | null>(null)

  const menuRoutes: Ref<MenuRoute[]> = ref([
    { title: 'Dashboard', name: 'brand_name', icon: 'homeIcon' },
    { title: 'Collages', name: 'brand_name-collage', icon: 'gridIcon' },
    { title: 'Folders', name: 'brand_name-folders', icon: 'folderIcon' },
    { title: 'Shared URLs', name: 'brand_name-sharing', icon: 'shareIcon' },
  ])

  const targetRoutes: string[] = [
    'brand_name-files-id',
  ]

  // computed
  const accessibleWorkspaces: ComputedRef<Workspace[]> = computed(() => authStore.user.accessibleInstances || [])


  // workspaceId is now provided by useWorkspaceId composable

  // watchers
  watch(mini, (val: boolean) => {
    appStore.setLeftMenuState(val)
  })

  watch(
    () => route.name,
    (to: string, from: string) => {
      if (targetRoutes.includes(to)) {
        if (!oldMini.value) oldMini.value = mini.value
        mini.value = true
      }
      if (targetRoutes.includes(from) && !targetRoutes.includes(to) && mini.value) {
        mini.value = oldMini.value
      }
    },
    { immediate: true }
  )

  // lifecycle
  onMounted(async () => {
    userBrandName.value = route.params.brand_name as string || ''
    const userWpId = authStore.user?.workspace_id
    console.log('User:', authStore.user)
    const workspace = authStore.user.accessibleInstances.find(
      ({ workspace_id }) =>
        parseInt(workspace_id) === parseInt(userWpId)
    )
    authInstanceId.value = authStore.user?.instance_id || null
    userLogo.value = workspace.logo
    contentLoading.value = false
  })

  // methods

  const handleClick = (item: MenuRoute): void => {
    selectItem(item)
  }

  const selectItem = (item: MenuRoute): void => {
    selectedItem.value = item
  }

  const closeSearchBar = (): void => {

  }

  const changeWorkspace = async (wp: Workspace): Promise<void> => {
    try {
      const userWpId = authStore.user?.workspace_id
      const workspace = authStore.user.accessibleInstances.find(
        ({ workspace_id }) =>
          parseInt(workspace_id) === parseInt(userWpId)
      )

      if (!workspace) return

      /* ---------- helpers ---------- */
      const handleLogin = async (
        email: string,
        password: string,
        workspace_id: string
      ) => {
        const result = await authStore.login(
          email,
          password,
          workspace_id
        );
        setCurrentWorkspace(authStore.user!.workspace_id)
        appStore.setSubscriptionFeatures(authStore.user!.subscription_features)
        await navigateTo(`/${workspace.url}`)
      }

      const checkPublicPortal = async () => {
        const runtimeConfig = useRuntimeConfig()
        const apiUrl = runtimeConfig.public.apiBaseUrl ?
          `${runtimeConfig.public.apiBaseUrl}check-public-portal` :
          '/api/check-public-portal'

        const response: any = await $fetch(apiUrl, {
          method: 'POST',
          body: { url: workspace.url },
        })

        if (response.code === 200) {
          const { workspace_id, email, password } = response.data
          if (!workspace_id || !email || !password) {
            await navigateTo({
              name: 'index',
              params: { brand_name: getBrandName() },
            })
            return
          }
          await handleLogin(email, password, workspace_id)
        }
      }

      /* ---------- routing logic ---------- */
      const currentWorkspace = _auth()
      if (currentWorkspace?.is_domain === workspace.is_domain) {
        if (workspace.is_domain === 1) {
          await authStore.logout()
          await navigateTo(
            `http://${workspace.url}/${workspace.workspace_id}`,
            { external: true }
          )
          return
        }

        // same domain, sub-path workspace
        const formData = new FormData()
        formData.append('id', authStore.user!.id.toString())
        formData.append('instance_id', wp.instance_id.toString())
        // Note: Need to implement user model or get from store
        formData.append('name', authStore.user!.name || '')
        formData.append('phone', '')

        await $fetch('digital/instance/update-user', {
          method: 'POST',
          body: formData,
        })

        await authStore.getUser()
        setCurrentWorkspace(wp.workspace_id)
        userLogo.value = workspace.logo
        userBrandName.value = getBrandName() ?? ''
        authInstanceId.value = authStore.user?.instance_id || null
        await callOnce(checkPublicPortal)
        await navigateTo(`/${wp.url}`)
        return
      }

      /* ---------- cross-domain ---------- */
      await authStore.logout()
      const runtimeConfig = useRuntimeConfig()
      const target =
        workspace.is_domain === 1
          ? `http://${workspace.url}/${workspace.workspace_id}`
          : `${runtimeConfig.public.baseUrl}/${workspace.url}`

      await navigateTo(target, { external: true })
    } catch (e) {
      // no-op
    }
  }

  const logoutApp = async (): Promise<void> => {
    const brandName = route.params.brand_name || ''
    try {
      await authStore.logout()
    } catch (error: any) {
    } finally {
      if (brandName) await navigateTo(`/${brandName}`)
      else window.location.replace('/')
    }
  }

  const toggleDrawer = (): void => {
    mini.value = !mini.value
  }


  return {
    drawer,
    mini,
    contentLoading,
    menuRoutes,
    accessibleWorkspaces,
    handleClick,
    closeSearchBar,
    changeWorkspace,
    logoutApp,
    toggleDrawer,
    userBrandName,
    userLogo,
    authInstanceId,
  }
}
