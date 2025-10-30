<template>
  <div class="tile-item">
    <div class="preview-img">
      <div class="categary-image">
        <v-btn
          :href="tile.url"
          target="_blank"
          variant="text"
          class="img-link pa-0"
        >
          <v-img :src="tileImage" :alt="'Image of ' + tile.title" />
        </v-btn>
      </div>
    </div>
    <div class="categary-name">
      <div class="top-column">
        <v-btn
          :href="tile.url"
          target="_blank"
          variant="text"
          class="text-none"
        >
          {{ tile.title }}
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tile {
  url: string;
  image: string;
  title: string;
  image_name?: string;
}

const props = defineProps<{
  tile: Tile;
}>();

const config = useRuntimeConfig();

const tileImage = computed(() => {
  if (props.tile.image && config.public.backendUrl) {
    return `${config.public.backendUrl}${props.tile.image}`;
  }
  return '';
});

</script>

<style scoped>
/* Add your styles here */
</style>
