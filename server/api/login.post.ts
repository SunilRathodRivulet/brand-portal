export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // This is a proxy endpoint to forward login requests to the external API
  // In a real implementation, you would fetch from your actual API

  // For now, return a mock response
  return {
    data: {
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User'
      },
      access_token: 'mock_jwt_token_here'
    }
  }
})
