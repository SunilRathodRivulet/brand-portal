<template>
  <div class="logged-in-page">
    <h1>You are logged in!</h1>
  </div>
</template>

<script setup>
// Define page middleware to check authentication
definePageMeta({
  middleware: ['check-url', 'check-auth']
})
</script>

<style scoped>
.logged-in-page {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: green;
  font-size: 2rem;
  margin: 0;
}
</style>
