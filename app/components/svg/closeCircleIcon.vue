<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12C22 13.9778 21.4135 15.9112 20.3147 17.5557C19.2159 19.2002 17.6541 20.4819 15.8268 21.2388C13.9996 21.9957 11.9889 22.1937 10.0491 21.8078C8.10929 21.422 6.32746 20.4696 4.92894 19.0711C3.53041 17.6725 2.578 15.8907 2.19215 13.9509C1.8063 12.0111 2.00433 10.0004 2.76121 8.17316C3.51809 6.3459 4.79981 4.78412 6.4443 3.6853C8.08879 2.58649 10.0222 2 12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17316C21.7413 9.38642 22 10.6868 22 12Z" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M14.9995 9.00012L8.99951 15.0001M8.99951 9.00012L14.9995 15.0001" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
