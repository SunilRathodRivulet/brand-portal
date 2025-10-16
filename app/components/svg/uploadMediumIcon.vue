<template>
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M34 23.3333V25.4667C34 28.4537 34 29.947 33.4187 31.088C32.9074 32.0915 32.0915 32.9074 31.088 33.4187C29.947 34 28.4537 34 25.4667 34H10.5333C7.54638 34 6.05291 34 4.91206 33.4187C3.90852 32.9074 3.09262 32.0915 2.5813 31.088C2 29.947 2 28.4537 2 25.4667V23.3333M26.8889 10.8889L18 2M18 2L9.11111 10.8889M18 2V23.3333" :stroke="color" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
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
