<template>
  <svg width="124" height="124" viewBox="0 0 124 124" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M120 81.3333V89.0667C120 99.8946 120 105.308 117.893 109.444C116.039 113.082 113.082 116.039 109.444 117.893C105.308 120 99.8946 120 89.0667 120H34.9333C24.1056 120 18.6918 120 14.5562 117.893C10.9184 116.039 7.96076 113.082 6.1072 109.444C4 105.308 4 99.8946 4 89.0667V81.3333M94.2222 36.2222L62 4M62 4L29.7778 36.2222M62 4V81.3333" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
