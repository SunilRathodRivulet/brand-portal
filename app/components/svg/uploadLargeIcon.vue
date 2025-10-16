<template>
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M62 42V46C62 51.6007 62 54.4007 60.91 56.54C59.9513 58.4216 58.4216 59.9513 56.54 60.91C54.4007 62 51.6007 62 46 62H18C12.3995 62 9.5992 62 7.46011 60.91C5.57847 59.9513 4.04867 58.4216 3.08993 56.54C2 54.4007 2 51.6007 2 46V42M48.6667 18.6667L32 2M32 2L15.3333 18.6667M32 2V42" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
