// /plugins/stream-saver.client.ts
import StreamSaver from 'streamsaver'
import { defineNuxtPlugin } from '#app'

export default defineNuxtPlugin((nuxtApp) => {
  // Expose as $streamSaver
  nuxtApp.provide('streamSaver', StreamSaver)
})

declare module '#app' {
  interface NuxtApp {
    $streamSaver: typeof StreamSaver
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $streamSaver: typeof StreamSaver
  }
}
