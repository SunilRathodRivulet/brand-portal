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
        :src="banner.image"
      >
        <nuxt-link :href="banner.url" external style="display: block; height: 100%; width: 100%;">
          <div v-if="banner.description" class="content">
            <div class="content-wrapper">
              <h1 class="text-center">{{ banner.description }}</h1>
            </div>
          </div>
        </nuxt-link>
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
import Tile from '@/components/dashboard/Tile.vue'
import Resource from '@/components/dashboard/Resource.vue'
import { useDashboard } from '@/composables/core/pages/useDashboard'

definePageMeta({
  layout: 'collage-layout',
  middleware: ['check-url', 'check-auth'],
})

const {
  shareFile,
  heroNavigateTo,
  shareDialog,
  trendingRef,
  recentRef,
  contentLoading,
  bannerData,
  tileData,
  tileSlides,
  dashboardData,
  showTrending,
  showRecentUploads,
  user,
  trendingSlides,
  recentSlides,
  onShareFile,
  keytoTitle,
  normalizedForNavitor,
  closeShareDialog,
  getBrandName,
} = useDashboard()
</script>
