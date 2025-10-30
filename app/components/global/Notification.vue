<!-- components/global/DamNotification.vue -->
<template>
  <div>
    <v-menu
      v-model="isMenuOpen"
      offset-x
      rounded="boxShadow"
      :close-on-content-click="false"
    >
      <template #activator="{ props: menuProps }">
        <span v-bind="menuProps" class="link-hover-active">
          <div class="linkIcons">
            <v-badge
              class="d-flex"
              :model-value="displayBatchCount.show && navCollapsed"
              color="#FF5572"
              :content="displayBatchCount.count_"
              overlap
            >
              <AsyncIcon name="ballIcon" />
            </v-badge>
          </div>
          <span class="linkText">
            Notifications
            <v-badge
              v-if="displayBatchCount.show"
              color="#FF5572"
              :content="displayBatchCount.count_"
              inline
            />
          </span>
        </span>
      </template>

      <v-card height="550" width="455" class="collageTabs">
        <v-card-title>Announcements ({{ unreadAnnouncements }})</v-card-title>
        <v-card-text class="px-3 pt-0">
          <v-card flat>
            <v-card-title>
              <strong v-if="unreadAnnouncements">
                {{ unreadAnnouncements }} unread announcement{{
                  unreadAnnouncements > 1 ? "s" : ""
                }}
              </strong>
              <span
                v-if="showMarkAllAsReadAnnouncement"
                class="cursor-pointer"
                @click="readAllAnnouncements"
              >
                Mark all as read
              </span>
            </v-card-title>

            <div class="customscrollbar" @scroll="onScroll">
              <v-card-text>
                <v-list dense class="py-0">
                  <!-- skeleton while first load -->
                  <template v-if="initialLoading_">
                    <v-skeleton-loader
                      v-for="n in 4"
                      :key="`${n}-anno`"
                      class="notificationSkeleton"
                      type="list-item-avatar-two-line"
                    />
                  </template>

                  <!-- announcement list -->
                  <v-list-item
                    v-for="(anno, index) in announcementComputed"
                    :key="`${index}-anno-list`"
                    :ripple="false"
                    class="notification-items"
                    :class="{ unread: !anno.read_at }"
                    @click.stop="openModal(anno)"
                  >
                    <v-list-item-avatar
                      size="32"
                      class="user-avatar my-0 mr-0"
                      :class="
                        getFirstCharClass(
                          anno.announcements_detail.publisher.name
                        )
                      "
                    >
                      <v-img
                        v-if="anno.announcements_detail.publisher.profile_image"
                        :src="
                          anno.announcements_detail.publisher
                            .display_profile_image
                        "
                      />
                      <span v-else>
                        {{
                          anno.announcements_detail.publisher.name[0].toUpperCase()
                        }}
                      </span>
                    </v-list-item-avatar>

                    <v-list-item-title>
                      {{ anno.announcements_detail.title }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      {{ anno.created_date }}
                    </v-list-item-subtitle>

                    <v-list-item-action class="my-0 ml-0">
                      <v-tooltip bottom content-class="custom-tooltip-vuetify">
                        <template #activator="{ props: tooltipProps }">
                          <v-btn
                            v-bind="tooltipProps"
                            :ripple="false"
                            class="notification-read-unread rippleNone"
                            @click.capture.prevent.stop="
                              readUnreadAnnouncement(anno.id)
                            "
                          />
                        </template>
                        <span>
                          {{ anno.read_at ? "Mark as unread" : "Mark as read" }}
                        </span>
                      </v-tooltip>
                    </v-list-item-action>
                  </v-list-item>

                  <!-- load-more skeleton -->
                  <template v-if="loadMoreLoading_">
                    <v-skeleton-loader
                      v-for="n in 4"
                      :key="`${n}-load-anno`"
                      class="notificationSkeleton"
                      type="list-item-avatar-two-line"
                    />
                  </template>

                  <!-- last-page info -->
                  <div
                    v-if="
                      !loadMoreLoading_ &&
                      announcementComputed.length &&
                      page_ === lastPage_
                    "
                    class="no-data py-4 mt-4"
                  >
                    <p>That's all your announcements till now.</p>
                  </div>

                  <!-- empty state -->
                  <div
                    v-if="
                      !announcementComputed.length &&
                      !initialLoading_ &&
                      !loadMoreLoading_
                    "
                    class="no-data mt-5 py-4 h-100"
                  >
                    <p>You have no announcements available.</p>
                  </div>
                </v-list>
              </v-card-text>
            </div>
          </v-card>
        </v-card-text>

        <v-card-actions class="justify-end mt-2 mx-1 px-3 py-0">
          <v-btn
            v-if="workspaceModule"
            :ripple="false"
            class="rippleNone btn-link h-auto"
            elevation="0"
            size="small"
            :to="{ name: 'profile', params: { activeTab: 'notification' } }"
          >
            Notification Settings
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-menu>

    <!-- detail dialog -->
    <v-dialog v-model="dialog" max-width="560" persistent>
      <v-card class="v-dialog-global">
        <v-card-title>
          <h4>{{ selectedAnnouncement?.announcements_detail?.title }}</h4>
          <v-btn
            icon
            :ripple="false"
            class="closeIcon h-bg-purple-light"
            @click.capture.stop="closeDialog"
          >
            <AsyncIcon name="closeIcon" width="20" height="20" />
          </v-btn>
        </v-card-title>
        <v-card-text class="v-dialog-body customscrollbar">
          <p class="mb-4">
            <strong>Announced By:</strong>
            {{ selectedAnnouncement?.announcements_detail?.publisher?.name }}
          </p>
          <p class="mb-4">
            <strong>Announced Date:</strong>
            {{ selectedAnnouncement?.created_date }}
          </p>
          <div
            v-html="selectedAnnouncement?.announcements_detail?.description"
          />
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import AsyncIcon from "~/components/AsyncIcon.vue";
import { useDamNotification } from "~/composables/core/components/useDamNotification";

/* ---------- props ---------- */
interface Props {
  navCollapsed?: boolean;
}
const props = withDefaults(defineProps<Props>(), {
  navCollapsed: false,
});

/* ---------- composable ---------- */
const {
  isMenuOpen,
  displayBatchCount,
  unreadAnnouncements,
  showMarkAllAsReadAnnouncement,
  readAllAnnouncements,
  announcementComputed,
  initialLoading_,
  loadMoreLoading_,
  page_,
  lastPage_,
  onScroll,
  openModal,
  closeDialog,
  dialog,
  selectedAnnouncement,
  readUnreadAnnouncement,
  getFirstCharClass,
  workspaceModule,
} = useDamNotification(props);
</script>
