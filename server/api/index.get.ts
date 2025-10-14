import { eventHandler } from 'h3'

export default eventHandler(() => {
  return {
    message: 'API endpoint working',
    endpoints: {
      login: 'POST /server/api/login.post.ts',
      'login-with-id': 'POST /server/api/login-with-id.post.ts',
      user: 'POST /server/api/user.post.ts',
      logout: 'POST /server/api/logout.post.ts'
    }
  }
})
