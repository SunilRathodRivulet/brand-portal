<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.6896 18.3396L11.3104 19.7488C10.3944 20.6765 9.15606 21.1957 7.8663 21.1928C6.57655 21.1899 5.34043 20.6652 4.42844 19.7334C3.51644 18.8016 3.00284 17.5386 3.00001 16.2209C2.99719 14.9031 3.50537 13.6379 4.41337 12.702L5.79258 11.2928M18.2074 12.702L19.5866 11.2928C20.4946 10.357 21.0028 9.09172 21 7.77397C20.9972 6.45621 20.4836 5.19325 19.5716 4.26145C18.6596 3.32966 17.4234 2.8049 16.1337 2.80201C14.8439 2.79913 13.6056 3.31835 12.6896 4.24606L11.3094 5.65521M8.58514 15.4854L15.4129 8.5094" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M9.7146 2L14.2841 22" :stroke="color" stroke-width="2" stroke-linecap="round"/>
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