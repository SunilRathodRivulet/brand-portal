<template>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 6.47388L10.1651 12.1739C10.5679 12.5107 11.0248 12.7752 11.5159 12.9559C11.8336 13.0348 12.1654 13.0348 12.4831 12.9559C12.9742 12.7752 13.4311 12.5107 13.8339 12.1739L22 6.47388" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M13.1456 19H7.333C6.15439 19.1068 4.96639 19.0087 3.82052 18.71C3.2284 18.4833 2.71977 18.0775 2.36391 17.5479C2 16.9799 2 16.2349 2 14.7449V7.29988C2 5.80987 2 5.06586 2.36292 4.49986C2.71783 3.96803 3.22657 3.56009 3.81953 3.33185C4.9654 3.03312 6.1534 2.93503 7.33201 3.04185H16.665C17.8436 2.93501 19.0316 3.0331 20.1775 3.33185C20.7696 3.55855 21.2783 3.9643 21.6341 4.49386C21.998 5.06286 21.998 5.80787 21.998 7.29388V12.2309" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21.7775 15L15.8442 21M15.8442 15L21.7775 21" :stroke="color" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
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
