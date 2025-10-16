<template>
    <v-app-bar flat color="surface">
      <v-text-field
        v-model="search"
        variant="solo"
        density="compact"
        hide-details
        single-line
        placeholder="Search…"
        append-inner-icon="mdi-magnify"
        @keyup.enter="onSearch"
      />
    </v-app-bar>
</template>

<script setup>
import { ref } from 'vue'

const search = ref('')

function onSearch () {
  console.log('Search:', search.value)
  // TODO: emit, store, navigate, etc.
}
</script>