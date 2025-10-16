export const useHelpers = () => {
  const authStore = useAuthStore()
  const appDataStore = useAppDataStore()

  const setCurrentWorkspace = (workspaceId: string) => {
    if (!authStore.user?.accessibleInstances) return

    const workspace = authStore.user.accessibleInstances.find(
      ({ workspace_id }) => parseInt(workspace_id) === parseInt(workspaceId)
    )

    if (workspace && process.client) {
      localStorage.setItem('currentWorkspace', JSON.stringify(workspace))
    }
  }

  const _auth = () => {
    if (authStore.isAuthenticated && process.client) {
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
    set: (value) => {} // readonly, ignore sets
  })

  return {
    setCurrentWorkspace,
    _auth,
    getBrandName,
    brandName,
    brandDetail
  }
}
