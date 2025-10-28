<template>
  <div class="brand-index">
    <div
      v-if="bannerData.length"
      class="hero-section hero-carousel owl-carousel mainBannerSlider"
    >
      <div v-for="banner in bannerData" :key="banner.id" class="item">
        <a :href="banner.url" target="_blank">
          <img :src="banner.image" :alt="banner.title" />
          <div v-if="banner.description" class="content">
            <div class="content-wepper">
              <h1>
                {{ banner.description }}
              </h1>
            </div>
          </div>
        </a>
      </div>
    </div>

    <div
      v-if="!user?.is_slider && tileData && tileData.length"
      class="trending-sec grid-tile resource-wrapper tiles-list"
    >
      <div class="common-box">
        <div class="table-list-view">
          <ul class="tbody">
            <template v-for="tile in tileData" :key="tile.id">
              <Tile :tile="tile" />
            </template>
          </ul>
        </div>
      </div>
    </div>

    <div
      v-if="user?.is_slider && tileData && tileData.length"
      class="trending-sec grid-tile resource-wrapper tiles-list"
      :class="{ 'carousel-no-padding': tileData.length === 4 }"
    >
      <div class="common-box">
        <div class="table-list-view">
          <ul class="tbody owl-carousel tiles-carousel fourSlide">
            <template v-for="tile in tileData" :key="tile.id">
              <Tile :tile="tile" />
            </template>
          </ul>
        </div>
      </div>
    </div>

    <template
      v-if="
        showTrending &&
        dashboardData &&
        dashboardData.trending_data &&
        dashboardData.trending_data.length
      "
    >
      <div ref="trending" class="section-title">
        <h4>Trending</h4>
      </div>
      <div class="trending-sec grid-tile resource-wrapper">
        <div class="common-box">
          <div class="table-list-view">
            <ul class="tbody fourSlide owl-carousel tiles-carousel">
              <template v-for="file in dashboardData.trending_data" :key="file.id">
                <Resource
                  :file="file as any"
                  emit-share
                  hide-select
                  @share="onShareFile"
                />
              </template>
            </ul>
          </div>
        </div>
      </div>
    </template>
    <template v-if="dashboardData && showRecentUploads">
      <div
        v-if="
          dashboardData.recent_uploads.images.length ||
          dashboardData.recent_uploads.documents.length ||
          dashboardData.recent_uploads.videos.length ||
          dashboardData.recent_uploads.audios.length
        "
        ref="recent"
        class="section-title"
      >
        <h4>Recent Uploaded</h4>
      </div>

      <template v-for="(files, key) in dashboardData.recent_uploads">
        <template v-if="files.length">
          <div :key="key" class="mini-title">
            <!-- <input id="Images" type="checkbox" class="form-check-input" /> -->
            <label>{{ keytoTitle(key) }}</label>
            <nuxt-link
              :to="{
                name: 'brand_name-folders',
                params: { brand_name: getBrandName() },
                hash: `#${normalizedForNavitor(key)}`,
              }"
              class="browse-box"
            >
              <span>
                Browse
                {{ dashboardData[`total_${key}`] }} {{ keytoTitle(key) }}
              </span>
            </nuxt-link>
          </div>
          <div
            :key="`files-${key}`"
            class="recentuploads-sec grid-tile resource-wrapper"
            :class="{
              mb2: key == Object.keys(dashboardData.recent_uploads).pop(),
            }"
          >
            <div class="common-box">
              <div class="table-list-view">
                <ul class="tbody fourSlide owl-carousel tiles-carousel">
                  <template v-for="file in files" :key="file.id">
                    <Resource

                      :file="file as any"
                      emit-share
                      hide-select
                      @share="onShareFile"
                    />
                  </template>
                </ul>
              </div>
            </div>
          </div>
        </template>
        <template v-else>
          <div :key="key" class="mini-title">
            <label for="Images" class="check-label">{{
              keytoTitle(key)
            }}</label>
          </div>
          <div
            :key="`files-${key}`"
            class="recentuploads-sec grid-tile resource-wrapper"
          >
            <div class="common-box">
              <div :key="key" class="no-data-found my-5">
                <div class="inner w-100">
                  <svg
                    id="Layer_1"
                    class="no-record-icon darkgray"
                    style="height: 150px"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    x="0px"
                    y="0px"
                    viewBox="0 0 131.3 156.8"
                    xml:space="preserve"
                  >
                    <g id="Group_4457" transform="translate(-190.348 -177.624)">
                      <path
                        id="Path_3564"
                        class="fill-color"
                        d="M285.2,214.4c-1.5,0-2.6,1.2-2.6,2.6c0,1.5,1.2,2.6,2.6,2.6h4.4v4.4c0,1.5,1.2,2.6,2.6,2.6s2.6-1.2,2.6-2.6l0,0l0,0v-4.4h4.4c1.5,0,2.6-1.2,2.6-2.6s-1.2-2.6-2.6-2.6l0,0h-4.4V210c0-1.5-1.2-2.6-2.6-2.6s-2.6,1.2-2.6,2.6v4.4H285.2z"
                      />
                      <path
                        id="Path_3565"
                        class="fill-color"
                        d="M321.6,199.8c0.3-1.5-9.1-9.6-15.5-16.4c-3.9-3.7-7.4-9-9.5-3.1v15.5c0,3.8,3.1,6.8,6.8,6.8h12.8v95.1c0,0.9-0.7,1.6-1.6,1.6H227c-0.9,0-1.6-0.7-1.6-1.6V184.5c0-0.9,0.7-1.6,1.6-1.6h59.4c1.5,0,2.6-1.2,2.6-2.6s-1.2-2.6-2.6-2.6l0,0H227c-3.8,0-6.8,3.1-6.8,6.8v8.1h-8.1c-3.8,0-6.8,3.1-6.8,6.8v8.1h-8.1c-3.8,0-6.8,3.1-6.8,6.8v113.2c0,3.8,3.1,6.8,6.8,6.8H285c3.8,0,6.8-3.1,6.8-6.8v-8.1h8.1c3.8,0,6.8-3.1,6.8-6.8v-8.1h8.1c3.8,0,6.8-3.1,6.8-6.8V200C321.7,199.9,321.7,199.9,321.6,199.8L321.6,199.8z M301.5,312.6c0,0.9-0.7,1.6-1.6,1.6h-65.2c-1.5,0-2.6,1.2-2.6,2.6s1.2,2.6,2.6,2.6h51.8v8.1c0,0.9-0.7,1.6-1.6,1.6h-87.8c-0.9,0-1.6-0.7-1.6-1.6V214.3c0-0.9,0.7-1.6,1.6-1.6h8.1v99.9c0,3.8,3.1,6.8,6.8,6.8h10.4c1.5,0,2.6-1.2,2.6-2.6s-1.2-2.6-2.6-2.6l0,0h-10.4c-0.9,0-1.6-0.7-1.6-1.6V199.4c0-0.9,0.7-1.6,1.6-1.6h8.1v99.9c0,3.8,3.1,6.8,6.8,6.8h74.4L301.5,312.6L301.5,312.6z M303.5,197.3c-0.9,0-1.6-0.7-1.6-1.6v-9.1l10.7,10.7L303.5,197.3z"
                      />
                    </g>
                  </svg>

                  <p>You don't have files</p>
                </div>
              </div>
            </div>
          </div>
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
  </div>
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
const dashboardData = computed(() => appDataStore.dashboardData)
const showTrending = computed(() => authStore.user?.settings?.is_trading)
const showRecentUploads = computed(() => authStore.user?.settings?.is_recent_upload)
const user = computed(() => authStore.user)

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
onMounted(() => {
  appDataStore.fetchBannerData()
  appDataStore.fetchTileData()
  appDataStore.fetchFolders(false)
  appDataStore.fetchDashboardData()
})
</script>
