<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 12.5V6.8C19 5.11984 19 4.27976 18.673 3.63803C18.3854 3.07354 17.9265 2.6146 17.362 2.32698C16.7202 2 15.8802 2 14.2 2H7.8C6.11984 2 5.27976 2 4.63803 2.32698C4.07354 2.6146 3.6146 3.07354 3.32698 3.63803C3 4.27976 3 5.11984 3 6.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22H11M13 11H7M9 15H7M15 7H7M13.5 19L15.5 21L20 16.5" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
