<!-- layouts/outer-layout.vue -->
<template>
  <v-app>
    <div class="main">
      <!-- decorative sticky illustrations -->
      <div v-if="loginElement" class="stickyElimants">
        <div class="loginElement d-flex align-start">
          <AsyncIcon name="loginElementLeft" class="w-100" />
        </div>
        <div class="loginElement d-flex align-end">
          <AsyncIcon name="loginElementRight" class="w-100" />
        </div>
      </div>

      <!-- scrollable login card -->
      <div class="signin-screen px-10 customscrollbar">
        <div class="signin-screen-table px-10">
          <div class="signin-screen-table-cell">
            <div
              class="signin-screen-content py-10"
            >
              <div class="signin-screen-title">
                <v-skeleton-loader
                  v-if="contentLoading"
                  type="image"
                  class="logoSkeleton"
                />
                <AsyncIcon v-else name="logoIcon" />
              </div>

              <!-- page injected by Nuxt -->
              <NuxtPage />
            </div>

            <!-- Powered by Collage -->
            <div v-if="contentLoading" class="powered-by-collage center">
              <v-skeleton-loader type="image" />
              <v-skeleton-loader type="list-item" />
            </div>

          </div>
        </div>
      </div>
    </div>
  </v-app>
</template>

<script setup lang="ts">
/* ------------------------------------------------------------------ */
/* imports                                                            */
/* ------------------------------------------------------------------ */
import { nextTick, onMounted, ref, computed } from 'vue'
import { useRoute } from '#app'

const AsyncIcon = defineAsyncComponent(() => import('~/components/AsyncIcon.vue'))

const contentLoading = ref(true)

const route = useRoute()


const loginElement = computed(() =>
  [
    'brand_name-forgot-password',
    'brand_name-generate-password',
    'brand_name-reset-password',
    'brand_name-login'
  ].includes(String(route.name))
)


/* ------------------------------------------------------------------ */
/* lifecycle                                                          */
/* ------------------------------------------------------------------ */
onMounted(() => {
  nextTick(() => (contentLoading.value = false))
})
</script>
