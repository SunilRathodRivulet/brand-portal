<template>
  <v-app>
    <v-navigation-drawer
      v-model="drawer"
      app
      :width="280"
      class="menu-sidebar"
    >
      <!-- Sidebar content -->
      <div class="sidebar-content">
        <div class="logo-section">
          <v-img
            :src="userLogo"
            height="50"
            contain
          />
        </div>

        <v-divider class="my-4" />

        <v-list nav dense>
          <v-list-item
            v-for="item in menuItems"
            :key="item.key"
            :to="item.to"
            :active="item.active"
          >
            <v-list-item-icon>
              <v-icon>{{ item.icon }}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>

        <div class="sidebar-footer">
          <v-btn
            block
            color="primary"
            @click="logout"
          >
            <v-icon left>mdi-logout</v-icon>
            Logout
          </v-btn>
        </div>
      </div>
    </v-navigation-drawer>

    <v-app-bar app color="primary" dark>
      <v-app-bar-nav-icon @click="drawer = !drawer" />
      <v-toolbar-title>{{ brandName }}</v-toolbar-title>
      <v-spacer />
      <v-btn icon @click="toggleLeftMenu">
        <v-icon>mdi-menu</v-icon>
      </v-btn>
    </v-app-bar>

    <v-main>
      <slot />
    </v-main>
  </v-app>
</template>

<script setup>
const authStore = useAuthStore()
const drawer = ref(false)
const route = useRoute()

const brandName = computed(() => {
  const workspace = authStore.user?.accessibleInstances?.find(
    (inst) => inst.workspace_id === route.params.brand_name
  )
  return workspace?.brand_name || 'Collage Inc'
})

const userLogo = computed(() => {
  const workspace = authStore.user?.accessibleInstances?.find(
    (inst) => inst.workspace_id === route.params.brand_name
  )
  return workspace?.logo || '/collage-meta-icon.png'
})

const menuItems = computed(() => [
  { key: 'home', title: 'Home', icon: 'mdi-home', to: `/${route.params.brand_name}`, active: route.path === `/${route.params.brand_name}` },
  { key: 'folders', title: 'Folders', icon: 'mdi-folder', to: `/${route.params.brand_name}/folders`, active: route.path.startsWith(`/${route.params.brand_name}/folders`) },
  // Add more menu items as needed
])

const logout = async () => {
  await authStore.logout()
}

const toggleLeftMenu = () => {
  // Handle left menu toggle
  console.log('Toggle left menu')
}

definePageMeta({
  layout: 'app-sidebar'
})
</script>

<style scoped>
.menu-sidebar {
  background: #f8f9fa;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
}

.logo-section {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.sidebar-footer {
  margin-top: auto;
}

.v-app-bar .v-toolbar-title {
  font-weight: 600;
}
</style>
