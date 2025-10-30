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

</script>

<style scoped>
.tile-item {
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-img {
  width: 100%;
  padding-top: 100%; /* 1:1 Aspect Ratio */
  position: relative;
}

.categary-image {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.img-link {
  display: block;
  height: 100%;
  width: 100%;
}

.v-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.categary-name {
  padding: 16px;
  text-align: center;
}
</style>
