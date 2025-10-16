<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.1779 8C23.274 8 23.274 16 18.1779 16C13.0829 16 11.0448 8 5.4388 8C0.853733 8 0.853733 16 5.4388 16C11.0448 16 13.083 8 18.179 8H18.1779Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
