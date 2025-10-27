import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

declare global {
  interface Window {
    Echo: Echo<any>
    Pusher: typeof Pusher
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  // Initialize Pusher
  window.Pusher = Pusher

  // Initialize Laravel Echo
  window.Echo = new Echo({
    broadcaster: 'pusher',
    key: config.public.pusherKey || 'your-pusher-key',
    cluster: config.public.pusherCluster || 'mt1',
    wsHost: process.env.PUSHER_HOST || `ws-${process.env.PUSHER_APP_CLUSTER}.pusherapp.com`,
    wsPort: Number(process.env.PUSHER_PORT) || 6001,
    wssPort: Number(process.env.PUSHER_PORT) || 6001,
    forceTLS: (process.env.PUSHER_SCHEME || 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
    authorizer: (channel: any, options: any) => {
      return {
        authorize: (socketId: string, callback: any) => {
          $fetch(`${config.public.pusherAuthEndpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${useCookie('auth_token').value}`,
            },
            body: {
              socket_id: socketId,
              channel_name: channel.name,
            },
          })
            .then((data: any) => callback(false, data))
            .catch((error: any) => callback(true, error))
        },
      }
    },
  })

  // Make Echo available globally
  return {
    provide: {
      echo: window.Echo,
    },
  }
})
