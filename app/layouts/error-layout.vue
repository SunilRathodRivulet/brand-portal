<template>
  <v-app>
    <Error :error="error" />
  </v-app>
</template>

<script setup>
import { defineProps } from 'vue'
import Error from '~/components/global/Error'

// Props
const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
})

</script>
