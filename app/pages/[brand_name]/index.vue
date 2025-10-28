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
      v-if="!user.is_slider && tileData && tileData.length"
      class="trending-sec grid-tile resource-wrapper tiles-list"
    >
      <div class="common-box">
        <div class="table-list-view">
          <ul class="tbody">
            <template v-for="tile in tileData">
              <Tile :key="tile.id" :tile="tile" />
            </template>
          </ul>
        </div>
      </div>
    </div>

    <div
      v-if="user.is_slider && tileData && tileData.length"
      class="trending-sec grid-tile resource-wrapper tiles-list"
      :class="{ 'carousel-no-padding': tileData.length === 4 }"
    >
      <div class="common-box">
        <div class="table-list-view">
          <ul class="tbody owl-carousel tiles-carousel fourSlide">
            <template v-for="tile in tileData">
              <Tile :key="tile.id" :tile="tile" />
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
              <template v-for="file in dashboardData.trending_data">
                <Resource
                  :key="file.id"
                  :file="file"
                  emit-share
                  hide-select
                  @share="onShareFile"
                  @emitCart="toggleCart(file)"
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
                params: { brand_name: $getBrandName() },
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
                  <template v-for="file in files">
                    <Resource
                      :key="file.id"
                      :file="file"
                      emit-share
                      hide-select
                      @share="onShareFile"
                      @emitCart="toggleCart(file)"
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

    <DownloadingIndicator />

    <client-only>
      <ShareFile
        ref="shareDialog"
        :files="(shareFile && [shareFile]) || []"
        type="folder"
      />
    </client-only>
    <AddToCartModal
      v-if="selectedFile && orderManagementAllowed"
      ref="cartDialog"
      :file="selectedFile"
    />
  </div>
</template>

<script>
import Tile from '@/components/dam/Tile.vue'
export default {
  components: {
    Tile,
  },
  layout: 'app-sidebar',
  middleware: ['check-url', 'check-auth'],
  data() {
    return {
      shareFile: null,
      heroNavigateTo: 0,
      selectedFile: null,
    }
  },
  computed: {
    orderManagementAllowed() {
      return (
        !!this.$auth.user.subscription_features?.asset_order_management
          ?.enable && this.$auth.user.email !== 'anonymous@collage.inc'
      )
    },
    bannerData() {
      return [...this.$store.state.appData.bannerData].sort(
        ({ postion: a, postions: b }) => a - b
      )
    },
    tileData() {
      return [...this.$store.state.appData.tileData].sort(
        ({ postion: a, postions: b }) => a - b
      )
    },
    dashboardData() {
      return this.$store.state.appData.dashboardData
    },
    showTrending() {
      return this.$auth.user.settings?.is_trading
    },
    showRecentUploads() {
      return this.$auth.user.settings?.is_recent_upload
    },
    user() {
      return this.$auth.user
    },
  },
  watch: {
    '$store.state.appData.leftMenuOpen': {
      handler() {
        this.onHeroChanged()
      },
    },
    '$store.state.appData.scrollTo'(n) {
      switch (n) {
        case 'recent':
          this.scrollToRecent()
          break
        case 'trending':
          this.scrollToTrending()
          break
      }
    },
  },
  mounted() {
    this.$store.dispatch('product/fetchOrderAlertList')
    this.$store.dispatch('appData/fetchBannerData').then(() => {
      this.$nextTick(() => {
        setTimeout(() => {
          this.bannerSliderTrigger()
        }, 100)
      })
    })
    this.$store.dispatch('appData/fetchTileData')
    this.$store.dispatch('appData/fetchFolders')
    this.$store.dispatch('appData/fetchDashboardData').then(() => {
      if (this.$store.state.appData.scrollToRecent) {
        if (this.$store.state.appData.scrollTo === 'recent') {
          this.scrollToRecent()
        } else if (this.$store.state.appData.scrollTo === 'trending') {
          this.scrollToTrending()
        }
      }
      this.$nextTick(() => {
        setTimeout(() => {
          this.otherSliderTrigger()
        }, 100)
      })
    })
  },
  head() {
    // Extract the dynamic workspace and brand name logic
    const workspace = this.$auth?.user?.accessibleInstances?.find(
      ({ workspace_id }) =>
        parseInt(workspace_id) === parseInt(this.$getWorkspaceId())
    )
    const brandName = workspace?.brand_name || 'Collage Inc'
    const userLogo =
      workspace?.logo || this.$config.baseUrl + '/collage-meta-icon.png'

    return {
      title: `${brandName} Brand Portal by Collage Inc`,
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        {
          hid: 'og:image',
          property: 'og:image',
          content: userLogo,
        },
        {
          hid: 'og:image:alt',
          property: 'og:image:alt',
          content: `${brandName} Logo`,
        },
        {
          property: 'og:image:width',
          content: '1200',
        },
        {
          property: 'og:image:height',
          content: '630',
        },
        {
          property: 'og:image:type',
          content: 'image/png',
        },
        {
          name: 'twitter:card',
          content: 'summary_large_image',
        },
        {
          hid: 'og:title',
          property: 'og:title',
          content: `${brandName} Brand Portal by Collage Inc`,
        },
        {
          property: 'og:locale',
          content: 'en_US',
        },
        {
          property: 'og:type',
          content: 'website',
        },
        {
          property: 'og:url',
          content: this.$config.baseUrl,
        },
        {
          property: 'og:site_name',
          content: 'Collage',
        },
      ],
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: this.$auth.user?.branding?.brand_favicon || '/favicon.png',
          hid: 'favicon',
        },
      ],
    }
  },
  methods: {
    toggleCart(file) {
      this.selectedFile = file
      this.$nextTick(() => {
        this.$refs.cartDialog.toggleModel()
      })
    },
    bannerSliderTrigger() {
      const $owl = window.$('.mainBannerSlider')
      const owl = $owl.owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        autoplay: true,
        mouseDrag: false,
        responsiveClass: true,
        autoplayTimeout: 3000,
        speed: 800,
        responsiveBaseElement: '.body-content',
        responsive: {
          0: {
            items: 1,
          },
        },
      })
      window.$(document).on('click', '.menu-show', function () {
        window
          .$('.body-content')
          .one(
            'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
            function (event) {
              // alert('h')
              owl.trigger('refresh.owl.carousel')
            }
          )
      })
    },
    otherSliderTrigger() {
      const $owl = window.$('.fourSlide')
      const owl = $owl.owlCarousel({
        nav: true,
        dots: false,
        responsiveClass: true,
        margin: 0,
        responsiveBaseElement: '.body-content',
        navText: [
          '<span><svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="25.811" height="50.121" viewBox="0 0 25.811 50.121"><path id="Icon_feather-chevron-down" data-name="Icon feather-chevron-down" d="M0,0,24,24,48,0" transform="translate(24.75 1.061) rotate(90)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg></span>',
          '<span><svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="25.811" height="50.121" viewBox="0 0 25.811 50.121"><path id="Icon_feather-chevron-down" data-name="Icon feather-chevron-down" d="M0,0,24,24,48,0" transform="translate(24.75 1.061) rotate(90)" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"/></svg></span>',
        ],
        responsive: {
          0: {
            items: 4,
          },
        },
      })
      window.$(document).on('click', '.menu-show', function () {
        window
          .$('.body-content')
          .one(
            'webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend',
            function (event) {
              // alert('h')
              owl.trigger('refresh.owl.carousel')
            }
          )
      })
    },
    onHeroChanged() {
      // this.$nextTick(() => {
      //   const hero = this.$refs.hero
      //   if (!hero) return
      //   const page = hero.currentPage
      //   if (page === this.bannerData.length - 1) {
      //     this.heroNavigateTo = [page, false]
      //     setTimeout(() => {
      //       this.heroNavigateTo = [0, false]
      //     }, 1500)
      //   }
      // })
    },
    scrollToTrending() {
      this.$refs.trending.scrollIntoView()
      this.resetScrolling()
    },
    scrollToRecent() {
      this.$refs.recent.scrollIntoView()
      this.resetScrolling()
    },
    resetScrolling() {
      const scrollingState = false
      const scrollTo = ''
      this.$store.dispatch('appData/changeScrolling', {
        scrollingState,
        scrollTo,
      })
    },
    onShareFile(file) {
      this.$nextTick(() => this.$refs.shareDialog.toggleModel())
      this.shareFile = file
    },
    keytoTitle(key) {
      return key[0].toUpperCase() + key.slice(1)
    },
    normalizedForNavitor(key) {
      if (key === 'documents') return 'application'

      return key.slice(0, key.length - 1)
    },
  },
}
</script>
