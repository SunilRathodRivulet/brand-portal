<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16.4444 17.5556L22 12M22 12L16.4444 6.44444M22 12H8.66667M8.66667 2H7.33333C5.46649 2 4.53307 2 3.82003 2.36331C3.19282 2.68289 2.68289 3.19282 2.36331 3.82003C2 4.53307 2 5.46649 2 7.33333V16.6667C2 18.5336 2 19.4669 2.36331 20.18C2.68289 20.8072 3.19282 21.3171 3.82003 21.6367C4.53307 22 5.46649 22 7.33333 22H8.66667" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
