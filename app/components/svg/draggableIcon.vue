<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 5C16.5523 5 17 4.55228 17 4C17 3.44772 16.5523 3 16 3C15.4477 3 15 3.44772 15 4C15 4.55228 15.4477 5 16 5Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 13C16.5523 13 17 12.5523 17 12C17 11.4477 16.5523 11 16 11C15.4477 11 15 11.4477 15 12C15 12.5523 15.4477 13 16 13Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M16 21C16.5523 21 17 20.5523 17 20C17 19.4477 16.5523 19 16 19C15.4477 19 15 19.4477 15 20C15 20.5523 15.4477 21 16 21Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 5C7.55228 5 8 4.55228 8 4C8 3.44772 7.55228 3 7 3C6.44772 3 6 3.44772 6 4C6 4.55228 6.44772 5 7 5Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 13C7.55228 13 8 12.5523 8 12C8 11.4477 7.55228 11 7 11C6.44772 11 6 11.4477 6 12C6 12.5523 6.44772 13 7 13Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M7 21C7.55228 21 8 20.5523 8 20C8 19.4477 7.55228 19 7 19C6.44772 19 6 19.4477 6 20C6 20.5523 6.44772 21 7 21Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
