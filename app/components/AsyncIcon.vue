<script setup>
import { defineAsyncComponent, computed, ref } from 'vue'

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: '#3D3D3D',
  },
})

const error = ref(false)

const AsyncComp = computed(() => {
  if (error.value) {
    // Return a fallback component if there was an error
    return defineAsyncComponent(() => import('~/components/svg/fileIcon.vue'))
  }
  
  return defineAsyncComponent({
    loader: () => import(`~/components/svg/${props.name}.vue`).catch((err) => {
      console.error(`Failed to load icon: ${props.name}`, err)
      error.value = true
      // Return fallback component
      return import('~/components/svg/fileIcon.vue')
    }),
    delay: 200,
    timeout: 3000,
  })
})
</script>

<template>
  <component :is="AsyncComp" v-bind="$props" />
</template>
