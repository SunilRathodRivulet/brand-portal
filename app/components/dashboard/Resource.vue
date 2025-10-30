<!-- ~/components/FileListItem.vue -->
<template>
  <v-list-item
    :class="[
      'pa-2 rounded-lg',
      selected ? 'bg-primary' : 'bg-surface',
      isVideo ? 'video' : isImage ? 'image' : '',
    ]"
    density="comfortable"
    @click="$emit('click')"
    @mouseenter="isVideo && playVideo()"
    @mouseleave="isVideo && pauseVideo()"
  >
    <!-- PREVIEW COLUMN ----------------------------------------------------->
    <v-list-item-avatar start class="me-3">
      <!-- checkbox -->
      <v-checkbox
        v-if="!shareMode && !hideSelect"
        :model-value="selected"
        hide-details
        density="compact"
        class="mt-0"
        @click.stop="$emit('click:selected', file)"
      />

      <!-- thumbnail / video poster -->
      <v-img
        v-if="!isVideo"
        :src="thumbnailSrc"
        aspect-ratio="1"
        cover
        class="rounded"
        @error="errorHandler"
      >
        <template #placeholder>
          <v-skeleton-loader type="image" />
        </template>
      </v-img>

      <!-- video element (hover autoplay) -->
      <div v-else class="position-relative">
        <video
          ref="videoEl"
          :src="file.video_preview"
          muted
          loop
          playsinline
          preload="metadata"
          class="rounded"
          width="96"
          height="96"
        />
        <v-btn
          icon
          size="x-small"
          class="position-absolute bottom-1 right-1"
          @click.stop="toggleVideoPlay"
        >
          <AsyncIcon
            :name="paused ? 'playIcon' : 'pauseIcon'"
            height="20"
            width="20"
          />
        </v-btn>
      </div>
    </v-list-item-avatar>

    <!-- METADATA COLUMN --------------------------------------------------->
    <v-list-item-header>
      <v-list-item-title class="text-body-2 text-truncate">
        {{ file.display_file_name }}
      </v-list-item-title>
      <v-list-item-subtitle class="text-caption">
        {{ formatDate(file.modified_at) }} ·
        {{ toHumanlySize(file.file_size) }}
      </v-list-item-subtitle>
    </v-list-item-header>

    <!-- ACTIONS COLUMN ---------------------------------------------------->
    <template #append>
      <v-menu location="bottom end" offset-y>
        <template #activator="{ props }">
          <v-btn v-bind="props" icon size="x-small" variant="text" @click.stop>
            <AsyncIcon name="optionIcon" height="20" width="20" />
          </v-btn>
        </template>

        <v-list density="compact">
          <v-list-item
            v-if="!shareMode"
            prepend-icon="mdi-share"
            @click="share"
          >
            <template #prepend>
              <AsyncIcon name="shareIcon" />
            </template>
            <v-list-item-title>Share</v-list-item-title>
          </v-list-item>
          <v-list-item prepend-icon="mdi-download" @click="downloadFile">
            <template #prepend>
              <AsyncIcon name="downloadIcon" />
            </template>
            <v-list-item-title>Download</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
  </v-list-item>
</template>

<script setup lang="ts">
/* ------------------------------------------------------------------ */
/* Type-only imports                                                  */
/* ------------------------------------------------------------------ */
import type { PropType } from "vue";
import { useDownloadStore } from "~/stores/download";

interface DigitalAsset {
  id: string | number;
  display_file_name: string;
  file_type: string;
  file_size: number;
  modified_at: string;
  thumbnail_file?: string;
  video_preview?: string;
  preview_image?: string;
  [key: string]: any;
}

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
const props = defineProps({
  file: { type: Object as PropType<DigitalAsset>, required: true },
  selected: { type: Boolean, default: false },
  shareMode: { type: Boolean, default: false },
  hideSelect: { type: Boolean, default: false },
  mode: { type: String as PropType<"row" | "panalview">, default: "row" },
});

/* ------------------------------------------------------------------ */
/* Emits                                                              */
/* ------------------------------------------------------------------ */
const emit = defineEmits<{
  click: [];
  "click:selected": [file: DigitalAsset];
  share: [file: DigitalAsset];
}>();

/* ------------------------------------------------------------------ */
/* Composables (stub them in ~/composables)                           */
/* ------------------------------------------------------------------ */
const { formatDate, toHumanlySize } = useHelpers();
const { dispatchAnalytics } = useAnalytics();
const { isImage, isVideo } = useFileType(props.file);
const downloadStore = useDownloadStore();
const route = useRoute();
const config = useRuntimeConfig();

/* ------------------------------------------------------------------ */
/* Reactive state                                                     */
/* ------------------------------------------------------------------ */
const videoEl = ref<HTMLVideoElement>();
const paused = ref(true);
const imageLoading = ref(false);

/* ------------------------------------------------------------------ */
/* Computed                                                           */
/* ------------------------------------------------------------------ */


const thumbnailSrc = computed(() => {
  const imagePath = isVideo.value
    ? props.file.video_preview || props.file.preview_image
    : props.file.thumbnail_file || props.file.preview_image;
  if (imagePath) {
    return imagePath;
  }
  return placeholderIcon();
});

/* ------------------------------------------------------------------ */
/* Methods                                                            */
/* ------------------------------------------------------------------ */
function placeholderIcon() {
  /* return a fallback svg or icon depending on file_type */
  return `/_nuxt/assets/img/icon/file/${props.file.file_type.toLowerCase()}.svg`;
}

function errorHandler() {
  /* fallback when thumbnail fails */
}

function toggleVideoPlay() {
  if (!videoEl.value) return;
  paused.value ? videoEl.value.play() : videoEl.value.pause();
  paused.value = !paused.value;
}

function playVideo() {
  if (!videoEl.value || !paused.value) return;
  videoEl.value.play();
  paused.value = false;
}

function pauseVideo() {
  if (!videoEl.value || paused.value) return;
  videoEl.value.pause();
  paused.value = true;
}

function share() {
  emit("share", props.file);
}

const downloadFile = async () => {
      let collectionsId = null
      if (route.name === 'brand_name-collage-id') {
        collectionsId = route.params.id
      }
      if (isImage.value) {
        await downloadStore.downloadImageAsset({
          assetId: String(props.file.id),
          fileName: props.file.display_file_name,
          fileType: props.file.file_type,
        })

        const body =
          route.name === 'brand_name-collage-id'
            ? {
                collection_id: String(route.params.id),
                asset_id: [Number(props.file.id)] as number[],
                event: 'collage',
                sub_event: 'downloaded',
                environment: 'dealer',
              }
            : route.name === 'brand_name-folders'
            ? {
                asset_id: [Number(props.file.id)] as number[],
                event: 'folder',
                sub_event: 'downloaded',
                environment: 'dealer',
              }
            : {
                asset_id: [Number(props.file.id)] as number[],
                event: 'asset',
                sub_event: 'downloaded',
                environment: 'dealer',
              }

        dispatchAnalytics(body)
      } else {
        downloadStore.downloadFile({
          id: String(props.file.id),
          url: props.file.download_url,
          name: props.file.display_file_name,
          callCountApi: !props.shareMode,
          useModernDownload: false,
          collection_id: collectionsId,
        })
        const body =
          route.name === 'brand_name-collage-id'
            ? {
                asset_id: [Number(props.file.id)] as number[],
                collection_id: String(route.params.id),
                event: 'collage',
                sub_event: 'downloaded',
                environment: 'dealer',
              }
            : route.name === 'brand_name-folders'
            ? {
                asset_id: [Number(props.file.id)] as number[],
                event: 'folder',
                sub_event: 'downloaded',
                environment: 'dealer',
              }
            : {
                asset_id: [Number(props.file.id)] as number[],
                event: 'asset',
                sub_event: 'downloaded',
                environment: 'dealer',
              }
        dispatchAnalytics(body)
      }
    }
</script>

<style scoped>
/* optional – only if you need custom tweaks */
.video .v-img,
video {
  max-width: 96px;
  max-height: 96px;
}
</style>
