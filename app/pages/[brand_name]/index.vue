<template>
  <v-container class="brand-index" fluid>
    <v-carousel
      v-if="bannerData.length"
      v-model="heroNavigateTo"
      class="hero-section mainBannerSlider"
      height="auto"
      show-arrows="hover"
      hide-delimiters
    >
      <v-carousel-item
        v-for="banner in bannerData"
        :key="banner.id"
      >
        <v-card
          class="d-flex align-center justify-center"
          height="100%"
        >
          <nuxt-link :href="banner.url" external>
            <v-img
              :src="banner.image"
              :alt="banner.title"
              height="400"
              class="banner-image"
            >
              <div v-if="banner.description" class="content">
                <div class="content-wrapper">
                  <h1 class="text-center">{{ banner.description }}</h1>
                </div>
              </div>
            </v-img>
          </nuxt-link>
        </v-card>
      </v-carousel-item>
    </v-carousel>

    <section v-if="!user?.is_slider && tileData && tileData.length" class="trending-sec resource-wrapper tiles-list">
      <v-card class="common-box">
        <v-row class="table-list-view">
          <v-col
            v-for="tile in tileData"
            :key="tile.id"
            cols="12"
            sm="6"
            md="4"
            lg="3"
          >
            <Tile :tile="tile" />
          </v-col>
        </v-row>
      </v-card>
    </section>

    <section
      v-if="user?.is_slider && tileData && tileData.length"
      class="trending-sec resource-wrapper tiles-list"
      :class="{ 'carousel-no-padding': tileData.length === 4 }"
    >
      <v-card class="common-box">
        <v-carousel
          class="table-list-view tiles-carousel fourSlide"
          height="auto"
          show-arrows="hover"
        >
          <v-carousel-item
            v-for="(tiles, index) in tileSlides"
            :key="index"
          >
            <v-row>
              <v-col
                v-for="tile in tiles"
                :key="tile.id"
                cols="12"
                sm="6"
                md="3"
              >
                <Tile :tile="tile" />
              </v-col>
            </v-row>
          </v-carousel-item>
        </v-carousel>
      </v-card>
    </section>

    <template
      v-if="
        showTrending &&
        dashboardData &&
        dashboardData.trending_data &&
        dashboardData.trending_data.length
      "
    >
      <v-card ref="trending" class="section-title">
        <v-card-title>
          <h4>Trending</h4>
        </v-card-title>
      </v-card>
      <section class="trending-sec resource-wrapper">
        <v-card class="common-box">
          <v-carousel
            class="table-list-view tiles-carousel fourSlide"
            height="auto"
            show-arrows="hover"
          >
            <v-carousel-item
              v-for="(files, index) in trendingSlides"
              :key="index"
            >
              <v-row>
                <v-col
                  v-for="file in files"
                  :key="file.id"
                  cols="12"
                  sm="6"
                  md="3"
                >
                  <Resource
                    :file="file as any"
                    emit-share
                    hide-select
                    @share="onShareFile"
                  />
                </v-col>
              </v-row>
            </v-carousel-item>
          </v-carousel>
        </v-card>
      </section>
    </template>

    <template v-if="dashboardData && showRecentUploads">
      <v-card
        v-if="
          dashboardData.recent_uploads.images.length ||
          dashboardData.recent_uploads.documents.length ||
          dashboardData.recent_uploads.videos.length ||
          dashboardData.recent_uploads.audios.length
        "
        ref="recent"
        class="section-title"
      >
        <v-card-title>
          <h4>Recent Uploaded</h4>
        </v-card-title>
      </v-card>

      <template v-for="(files, key) in dashboardData.recent_uploads" :key="key">
        <template v-if="files.length">
          <v-row :key="key" class="mini-title align-center mb-2">
            <v-col>
              <v-label>{{ keytoTitle(key) }}</v-label>
            </v-col>
            <v-col cols="auto">
              <v-btn
                :to="{
                  name: 'brand_name-folders',
                  params: { brand_name: getBrandName() },
                  hash: `#${normalizedForNavitor(key)}`,
                }"
                variant="text"
                class="browse-box"
              >
                Browse {{ dashboardData[`total_${key}`] }} {{ keytoTitle(key) }}
              </v-btn>
            </v-col>
          </v-row>
          <section
            :key="`files-${key}`"
            class="recentuploads-sec resource-wrapper"
            :class="{
              'mb-2': key === Object.keys(dashboardData.recent_uploads).pop(),
            }"
          >
            <v-card class="common-box">
              <v-carousel
                class="table-list-view tiles-carousel fourSlide"
                height="auto"
                show-arrows="hover"
              >
                <v-carousel-item
                  v-for="(fileSlides, index) in recentSlides[key]"
                  :key="index"
                >
                  <v-row>
                    <v-col
                      v-for="file in fileSlides"
                      :key="file.id"
                      cols="12"
                      sm="6"
                      md="3"
                    >
                      <Resource
                        :file="file as any"
                        emit-share
                        hide-select
                        @share="onShareFile"
                      />
                    </v-col>
                  </v-row>
                </v-carousel-item>
              </v-carousel>
            </v-card>
          </section>
        </template>
        <template v-else>
          <v-row :key="key" class="mini-title align-center">
            <v-col>
              <v-label>{{ keytoTitle(key) }}</v-label>
            </v-col>
          </v-row>
          <section
            :key="`files-${key}`"
            class="recentuploads-sec resource-wrapper"
          >
            <v-card class="common-box">
              <div class="no-data-found my-5">
                <v-row justify="center">
                  <v-col cols="12" md="6">
                    <v-card-text class="text-center">
                      <v-icon size="150" color="grey-darken-1">mdi-folder-off</v-icon>
                      <p class="mt-2">You don't have files</p>
                    </v-card-text>
                  </v-col>
                </v-row>
              </div>
            </v-card>
          </section>
        </template>
      </template>
    </template>

    <client-only>
      <!-- <ShareFile
        ref="shareDialog"
        :files="(shareFile && [shareFile]) || []"
        type="folder"
        @close="closeShareDialog"
      /> -->
      <!-- DownloadIndicator component import pending -->
    </client-only>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useAppDataStore } from '@/stores/appData'
import { useAuthStore } from '@/stores/auth'
import { useHelpers } from '@/composables/core/common/useHelpers'
import { useHead, useSeoMeta } from '#imports'
import Tile from '@/components/dashboard/Tile.vue'
import Resource from '@/components/dashboard/Resource.vue'

definePageMeta({
  layout: 'collage-layout',
  middleware: ['check-url', 'check-auth'],
})

const appDataStore = useAppDataStore()
const authStore = useAuthStore()
const { getWorkspaceId, getBrandName } = useHelpers()

// Reactive data
const shareFile = ref<null | any>(null)
const heroNavigateTo = ref(0)
const selectedFile = ref<null | any>(null)
const shareDialog = ref(false)

const trendingRef = ref<HTMLElement>()
const recentRef = ref<HTMLElement>()

// Computed properties
const bannerData = computed(() => {
  return [...appDataStore.bannerData].sort(
    ({ position: a }: { position: number }, { position: b }: { position: number }) => a - b
  )
})
const tileData = computed(() => {
  return [...appDataStore.tileData].sort(
    ({ position: a }: { position: number }, { position: b }: { position: number }) => a - b
  )
})
const tileSlides = computed(() => {
  const chunks: any[][] = []
  for (let i = 0; i < tileData.value.length; i += 4) {
    chunks.push(tileData.value.slice(i, i + 4))
  }
  return chunks
})
const dashboardData = computed(() => appDataStore.dashboardData)
const showTrending = computed(() => authStore.user?.settings?.is_trading)
const showRecentUploads = computed(() => authStore.user?.settings?.is_recent_upload)
const user = computed(() => authStore.user)

const trendingSlides = computed(() => {
  const data = dashboardData.value?.trending_data || []
  const chunks: any[][] = []
  for (let i = 0; i < data.length; i += 4) {
    chunks.push(data.slice(i, i + 4))
  }
  return chunks
})

const recentSlides = computed(() => {
  const slides: Record<string, any[][]> = {}
  if (dashboardData.value?.recent_uploads) {
    for (const key in dashboardData.value.recent_uploads) {
      const files = dashboardData.value.recent_uploads[key]
      const chunks: any[][] = []
      for (let i = 0; i < files.length; i += 4) {
        chunks.push(files.slice(i, i + 4))
      }
      slides[key] = chunks
    }
  }
  return slides
})

// Functions
function onShareFile(file: any) {
  shareFile.value = file
  shareDialog.value = true
}

function keytoTitle(key: string) {
  return key[0].toUpperCase() + key.slice(1)
}

function normalizedForNavitor(key: string) {
  if (key === 'documents') return 'application'
  return key.slice(0, key.length - 1)
}

function closeShareDialog() {
  shareDialog.value = false
  shareFile.value = null
}

// Head (meta)
const workspace = computed(() =>
  authStore.user?.accessibleInstances?.find(
    ({ workspace_id }: { workspace_id: any }) =>
      parseInt(workspace_id) === parseInt(getWorkspaceId())
  )
)
const brandName = computed(() => workspace.value?.brand_name || 'Collage Inc')
const userLogo = computed(() =>
  workspace.value?.logo || '/'
)

useHead({
  title: computed(() => `${brandName.value} Brand Portal by Collage Inc`),
  htmlAttrs: { lang: 'en' },
  meta: [
    { charset: 'utf-8' },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/x-icon',
      href: computed(() => authStore.user?.branding?.brand_favicon || '/favicon.png'),
    },
  ],
})

useSeoMeta({
  ogImage: userLogo,
  ogImageAlt: computed(() => `${brandName.value} Logo`),
  ogImageWidth: '1200',
  ogImageHeight: '630',
  ogImageType: 'image/png',
  twitterCard: 'summary_large_image',
  ogTitle: computed(() => `${brandName.value} Brand Portal by Collage Inc`),
  ogLocale: 'en_US',
  ogType: 'website',
  ogUrl: '/',
  ogSiteName: 'Collage',
})

// Lifecycle
onMounted(async () => {
  // Only fetch data if user is authenticated to avoid 401 errors that clear auth
  if (authStore.isAuthenticated) {
    await appDataStore.fetchBannerData()
    await appDataStore.fetchTileData()
    await appDataStore.fetchFolders(false)
    await appDataStore.fetchDashboardData()
  }
})
</script>
