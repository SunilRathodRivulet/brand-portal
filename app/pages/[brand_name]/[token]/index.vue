<template>
  <div></div>
</template>
<script setup lang="ts">
const { $api } = useNuxtApp()
const route = useRoute()
const { setCurrentWorkspace, getBrandName } = useHelpers()
const authStore = useAuthStore()
const appStore = useAppDataStore()
const { $workspaceApi } = useNuxtApp() // assuming it's injected, or use useWorkspaceApi()

const params = route.params
const brand_name = params.brand_name as string
const token = params.token as string

const allowedDomains = [
  'localhost:3001',
  'localhost:3004',
  'devdealer.collage.inc',
  'devfront.collage.inc',
  'devdealer82.collage.inc',
  'devfront82.collage.inc',
  'uatdealer.collage.inc',
  'uatfront.collage.inc',
  'dam.collage.inc',
  'app.collage.inc',
]

const getHostName = () => {
  const hostName = process.server ? (useRequestHeaders() as any).headers?.host : location.host
  return allowedDomains.includes(hostName) ? brand_name : hostName.split(':')[0]
}

const handleLogin = async (email: string, password: string, workspace_id: string) => {
  await authStore.login(email, password, workspace_id)
  setCurrentWorkspace(authStore.user!.workspace_id)
  appStore.setSubscriptionFeatures(authStore.user!.subscription_features)
  await navigateTo({ name: 'brand_name' })
}

const handlePasswordLessLogin = async () => {
  try {
    await authStore.loginWithToken(token)
    const workspace_id = authStore.user!.workspace_id
    setCurrentWorkspace(workspace_id)
    await navigateTo({ name: 'brand_name' })
  } catch (e) {
    console.error('Password-less login failed:', e)
  }
}

const checkPublicPortal = async () => {
  try {
    const response = await $api('check-public-portal', {
      method: 'POST',
      body: { url: brand_name }
    })
    if (response.code === 200) {
      const { workspace_id, email, password } = response.data
      if (!workspace_id || !email || !password) {
        await navigateTo({
          name: 'index',
          params: { brand_name: getBrandName() }
        })
        return
      }
      await handleLogin(email, password, workspace_id)
    } else {
      await handlePasswordLessLogin()
    }
  } catch (error) {
    console.error('checkPublicPortal error:', error)
    throw error
  }
}

onMounted(async () => {
  try {
    if (!authStore.isAuthenticated) {
      await checkPublicPortal()
    } else {
      await checkPublicPortal()
    }
  } catch (err) {
    console.error('Error during login flow:', err)
    await handlePasswordLessLogin()
  }
})
</script>
