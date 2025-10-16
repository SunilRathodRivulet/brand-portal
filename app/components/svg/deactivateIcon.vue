<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M17 3.33812C18.9064 4.43888 20.3964 6.13801 21.2388 8.17196C22.0812 10.2059 22.229 12.461 21.6593 14.5875C21.0895 16.7141 19.8341 18.5931 18.0876 19.9334C16.3412 21.2736 14.2013 22 12 22C9.79866 22 7.65883 21.2736 5.91239 19.9334C4.16595 18.5931 2.91049 16.7141 2.34075 14.5875C1.771 12.461 1.91879 10.2059 2.76121 8.17196C3.60362 6.13801 5.09358 4.43888 7 3.33812M12 11.3688V2" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
