<template>
  <v-list-item>
    <div class="preview-img">
      <div class="categary-image">
        <v-btn
          :href="tile.url"
          target="_blank"
          variant="text"
          class="img-link pa-0"
        >
          <v-img :src="tile.image" :alt="'Image of ' + tile.title" />
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
  </v-list-item>
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

</script>

<style scoped>
/* Add your styles here */
</style>