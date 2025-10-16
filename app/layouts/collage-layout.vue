<template>
  <v-app v-if="authStore.isAuthenticated">
    <Header />
    <SideBar />
    <!-- ------------------------------------------------------------------ -->
    <!-- MAIN CONTENT -->
    <!-- ------------------------------------------------------------------ -->
    <v-main>
      <v-container fluid>
        <NuxtPage />
      </v-container>
    </v-main>
  </v-app>
  <div v-else>
    <NuxtPage />
  </div>
</template>

<script setup>
import Header from '~/components/global/Header.vue'
import SideBar from '~/components/global/SideBar.vue'

const authStore = useAuthStore()
</script>
