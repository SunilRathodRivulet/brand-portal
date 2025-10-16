<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 10.9722L19.9701 13.0833L17.9391 10.9722M20.2184 12.5556C20.2552 12.209 20.2741 11.8568 20.2741 11.5C20.2741 6.2533 16.1833 2 11.1371 2C6.0908 2 2 6.2533 2 11.5C2 16.7467 6.0908 21 11.1371 21C14.0074 21 16.5685 19.6239 18.2437 17.4716M11.1371 6.22222V11.5L14.1827 13.6111" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>

<script setup>
const props = defineProps({
  color: {
    type: String,
    default: '#3D3D3D',
  },
})
</script>

<style scoped></style>
