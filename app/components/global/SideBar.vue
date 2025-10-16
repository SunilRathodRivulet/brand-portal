<template>
  <v-navigation-drawer
    v-model="drawer"
    app
    clipped
    :mini-variant="mini"
    class="leftSidebar customscrollbar"
    :class="{ leftSidebarMini: mini }"
  >
    <!-- Logo -->
    <div v-if="!contentLoading" class="logo-container">
      <NuxtLink class="siteLogo" :to="`/${userBrandName}`">
        <div class="collageIcon">
          <AsyncIcon name="faviconIcon" />
        </div>
        <div class="collageText">
          <AsyncIcon name="logoTextIcon" />
        </div>
      </NuxtLink>
      <v-btn
        icon
        @click="toggleDrawer"
        :ripple="false"
        class="toggle-btn h-bg-purple-light"
      >
        <AsyncIcon name="toggleIcon" width="22" height="22" />
      </v-btn>
    </div>
    <v-skeleton-loader
      v-else
      class="logoSkeleton"
      type="list-item"
      height="44px"
    ></v-skeleton-loader>

    <v-list dense flat nav class="leftSidebarLink">
      <!-- Menus -->
      <template v-if="contentLoading">
        <v-list-item v-for="n in 7" :key="n">
          <v-list-item-title class="pt-0">
            <v-skeleton-loader
              class="menuSkeleton"
              type="list-item"
              height="36px"
            ></v-skeleton-loader>
          </v-list-item-title>
        </v-list-item>
      </template>
      <template v-if="!contentLoading">
        <template v-for="item in menuRoutes" :key="item.name">
          <v-list-item
            
            @click="handleClick(item)"
            :ripple="false"
            :class="['leftSidebarMenuLink link-hover-active']"
            :to="{ name: item.name, params: { brand_name: userBrandName } }"
          >
            <template v-slot:prepend>
              <v-tooltip
                v-if="mini"
                content-class="custom-tooltip-vuetify"
                location="bottom"
                :text="item.title"
              >
                <template #activator="{ props }">
                  <AsyncIcon v-bind="props" :name="item.icon" />
                </template>
              </v-tooltip>
              <AsyncIcon v-else :name="item.icon" />
            </template>

            <v-list-item-title>
              {{ item.title }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </template>
    </v-list>

    <!-- Bottom Start -->
    <template v-slot:append>
      <template v-if="contentLoading">
        <v-list-item v-for="j in 3" :key="j" class="px-2">
          <v-list-item-title class="pt-0">
            <v-skeleton-loader
              class="menuSkeleton"
              type="list-item"
              height="36px"
            ></v-skeleton-loader>
          </v-list-item-title>
        </v-list-item>
        <v-divider class="dashboard-divider"></v-divider>
        <v-skeleton-loader
          class="menuSkeleton helpSkeleton"
          type="list-item"
          height="36px"
        ></v-skeleton-loader>
        <v-skeleton-loader
          class="menuBottomLogoSkeleton"
          type="list-item"
          height="96px"
        ></v-skeleton-loader>
      </template>
      <template v-else>
        <div class="leftmenu-bottom">
          <div class="leftmenu-bottom-link">
            <v-tooltip
              content-class="custom-tooltip-vuetify"
              :disabled="!mini"
              location="bottom"
              text="Notifications"
            >
              <template #activator="{ props }">
                <div v-bind="props">
                  <Notification :navCollapsed="mini" />
                </div>
              </template>
            </v-tooltip>
          </div>
          <div class="leftmenu-bottom-link">
            <v-menu
              offset-x
              rounded="boxShadow10"
              :close-on-content-click="false"
            >
              <template #activator="{ props }">
                <span
                  v-bind="props"
                  class="link-hover-active profileLink"
                  @click="closeSearchBar"
                >
                  <v-tooltip
                    content-class="custom-tooltip-vuetify"
                    location="bottom"
                    :text="user?.name || ''"
                  >
                    <template #activator="{ props }">
                      <v-avatar
                        size="22"
                        :color="
                          !user?.profile_image ? '#b6b6f2' : ''
                        "
                        v-bind="props"
                      >
                        <v-img
                          v-if="user?.profile_image"
                          :src="user?.profile_image"
                          alt=""
                        ></v-img>
                        <span
                          v-else
                          style="
                            position: relative;
                            top: -1px;
                            color: #ffffff;
                            font-weight: 700;
                            font-size: 12px;
                          "
                          >{{
                            user?.name?.charAt(0)?.toUpperCase() || ""
                          }}</span
                        >
                      </v-avatar>
                    </template>
                  </v-tooltip>
                  <span class="linkText">Profile / Settings</span>
                </span>
              </template>
              <v-list dense rounded class="optionMenuList min-w-220">
                <v-list-item
                  v-for="wp in accessibleWorkspaces"
                  :key="wp.id"
                  link
                  :ripple="false"
                  @click="changeWorkspace(wp)"
                  class="optionMenuLink link-hover-active"
                >
                  <template v-slot:prepend>
                    <AsyncIcon name="workspaceIcon" />
                  </template>
                  <v-list-item-title>{{ wp.brand_name }}</v-list-item-title>
                  <template #append>
                    <div
                      class="ml-2 mr-n1"
                      v-if="parseInt(authInstanceId) === parseInt(wp.instance_id)"
                    >
                      <AsyncIcon
                        name="checkCircleIcon"
                        width="20"
                        height="20"
                      />
                    </div>
                  </template>
                </v-list-item>
                <v-list-item
                  nuxt
                  :to="{
                    name: 'brand_name-profile',
                    params: { brand_name: userBrandName },
                  }"
                  :ripple="false"
                  class="optionMenuLink link-hover-active"
                >
                  <template v-slot:prepend>
                    <AsyncIcon name="userIcon" />
                  </template>
                  <v-list-item-title>User Profile</v-list-item-title>
                </v-list-item>
                <v-list-item
                  @click="logoutApp"
                  :ripple="false"
                  class="optionMenuLink link-hover-active"
                >
                  <template v-slot:prepend>
                    <AsyncIcon name="logoutIcon" />
                  </template>
                  <v-list-item-title>Logout</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <v-divider class="dashboard-divider"></v-divider>

        <div class="leftmenu-bottom">
          <div class="leftmenu-bottom-link">
            <v-tooltip
              content-class="custom-tooltip-vuetify"
              location="bottom"
              text="Help / Support"
            >
              <template #activator="{ props }">
                <NuxtLink
                  class="link-hover-active"
                  :to="{
                    name: 'brand_name-support',
                    params: { brand_name: userBrandName },
                  }"
                  replace
                  v-bind="props"
                >
                  <div class="linkIcons">
                    <v-tooltip
                      content-class="custom-tooltip-vuetify"
                      location="bottom"
                      :disabled="!mini"
                      text="Help / Support"
                    >
                      <template #activator="{ props }">
                        <div class="d-flex" v-bind="props">
                          <AsyncIcon name="helpIcon" />
                        </div>
                      </template>
                    </v-tooltip>
                  </div>
                  <span class="linkText">Help / Support</span>
                </NuxtLink>
              </template>
            </v-tooltip>
          </div>
        </div>

        <div class="leftmenu-bottom">
          <div class="leftmenu-bottom-logo">
            <svg
              width="200"
              height="96"
              viewBox="0 0 200 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                class="path1"
                d="M89.2412 92.8377V59.1703C89.2412 57.4238 87.8147 56.0079 86.0551 56.0079L3.18159 56.0079C1.42194 56.0079 -0.00453186 57.4238 -0.00453186 59.1703V92.8377C-0.00453186 94.5843 1.42194 96.0002 3.18159 96.0002H86.0551C87.8147 96.0002 89.2412 94.5843 89.2412 92.8377Z"
                fill="#FFB6C1"
              />
              <path
                class="path2"
                d="M107.248 95.2202H196.818C198.578 95.2202 200.004 93.8043 200.004 92.0578V3.15415C200.004 0.339348 196.579 -1.06805 194.572 0.924352L105.001 89.828C102.994 91.8204 104.421 95.2202 107.248 95.2202Z"
                fill="#B6B6F2"
              />
              <path
                class="path3"
                d="M99.5684 36.4231V71.1164C99.5684 73.9312 102.994 75.3386 105.001 73.3462L139.954 38.6529C141.962 36.6605 140.535 33.2607 137.708 33.2607H102.754C100.995 33.2607 99.5684 34.6766 99.5684 36.4231Z"
                fill="#40E0D0"
              />
            </svg>
          </div>
        </div>
      </template>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { defineAsyncComponent } from "vue";
import useCollageSidebar from "~/composables/core/layouts/useCollageSidebar";

// Lazy components
const AsyncIcon = defineAsyncComponent(() =>
  import("~/components/AsyncIcon.vue")
);
const Notification = defineAsyncComponent(() =>
  import("~/components/global/Notification.vue")
);

// Use your composable and expose its bindings by destructuring
const {
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
  authInstanceId,
  userBrandName,
} = useCollageSidebar();
</script>
