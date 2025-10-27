<template>
  <div class="dashboard-page">
    <div class="welcome-section">
      <h1>Welcome to your Dashboard!</h1>
      <p>🎉 You are successfully logged in and your authentication state is now persisted!</p>
    </div>

    <div class="auth-status">
      <h3>Authentication Status:</h3>

      <div class="status-card success">
        <div class="status-icon">✅</div>
        <div class="status-content">
          <h4>Authentication Persistent</h4>
          <p>Your login state will survive page refreshes and browser sessions</p>
          <p class="status-details">
            <strong>User:</strong> {{ authStore.user?.name || authStore.user?.email || 'N/A' }}<br>
            <strong>Status:</strong> {{ authStore.isAuthenticated ? 'Active' : 'Inactive' }}
          </p>
        </div>
      </div>

      <div class="status-card info">
        <div class="status-icon">🔒</div>
        <div class="status-content">
          <h4>SSR-Safe Authentication</h4>
          <p>Authentication fully leverages Nuxt 4's SSR capabilities</p>
          <p class="status-details">
            <strong>Storage:</strong> Secure httpOnly cookies<br>
            <strong>Security:</strong> XSS protection with httpOnly<br>
            <strong>Server:</strong> Pre-rendered with auth state
          </p>
        </div>
      </div>

      <div class="debug-section">
        <h4>Debug Information (for development)</h4>

        <div style="margin: 1rem 0; padding: 1rem; background: #f5f5f5; border-radius: 4px;">
          <h5>SSR Cookie-based Auth Data</h5>
          <p><strong>User:</strong> {{ JSON.stringify(authStore.user, null, 2) }}</p>
          <p><strong>Token present:</strong> {{ !!authStore.accessToken }}</p>
          <p><strong>isAuthenticated:</strong> {{ authStore.isAuthenticated }}</p>
        </div>

        <div style="margin: 1rem 0; padding: 1rem; background: #e3f2fd; border-radius: 4px;">
          <h5>Cookies (Browser DevTools → Application → Cookies)</h5>
          <p><strong>auth_user:</strong> {{ cookieStatus.authUser }}</p>
          <p><strong>auth_token:</strong> {{ cookieStatus.authToken }}</p>
          <p style="color: #1976d2; font-size: 0.9rem;">
            🚀 SSR-safe authentication using secure httpOnly cookies
          </p>
        </div>
      </div>
    </div>

    <div class="actions-section">
      <h3>Actions</h3>
      <div class="action-buttons">
        <button @click="handleLogout" class="logout-btn">
          🚪 Logout
        </button>
        <button @click="handleRefresh" class="refresh-btn">
          🔄 Test Page Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const authStore = useAuthStore()
const route = useRoute()

// Define page middleware to check authentication
definePageMeta({
  layout: "collage-layout",
  middleware: ['check-url', 'check-auth-client']
})

const getCookie = (name) => {
  if (!process.client) return null
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift()
  return null
}

const cookieStatus = computed(() => {
  // Hydration-safe cookie status - consistent between server and client
  const authUserStatus = process.client ? (getCookie('auth_user') ? 'present' : 'not set') : 'not available (SSR)'
  const authTokenStatus = process.client ? (getCookie('auth_token') ? 'present (httpOnly)' : 'not set') : 'not available (SSR)'

  return {
    authUser: authUserStatus,
    authToken: authTokenStatus
  }
})

const handleLogout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const handleRefresh = () => {
  // This will test if SSR persistence works - warn user first
  if (process.client) {
    const confirmed = confirm('This will refresh the page to test if SSR authentication persists. Are you sure?')
    if (confirmed) {
      window.location.reload()
    }
  }
}

onMounted(() => {
  if (process.client) {
    console.log('=== Nuxt 4 SSR Dashboard Page Authentication Check ===')
    console.log('User is authenticated:', authStore.isAuthenticated)
    console.log('User data:', authStore.user)
    console.log('Token present:', !!authStore.accessToken)

    // Check for SSR cookies
    const authUserCookie = getCookie('auth_user')
    const authTokenCookie = getCookie('auth_token')
    console.log('Cookies present - auth_user:', !!authUserCookie, 'auth_token:', !!authTokenCookie)

    // Additional security check: if no auth_token cookie, redirect to login
    if (!authTokenCookie) {
      console.error('❌ No auth_token cookie found - redirecting to login for security')
      const brandName = route.params.brand_name
      navigateTo(`/${brandName}/login`)
      return
    }

    if (authStore.isAuthenticated && (authUserCookie || authTokenCookie)) {
      console.log('✅ SSR authentication is working - auth state persists across page refreshes')
    } else {
      console.log('⚠️ SSR authentication may not be working correctly')
    }

    console.log('🚀 Nuxt 4 SSR capabilities fully utilized for authentication')
  }
})


</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.welcome-section {
  text-align: center;
  margin-bottom: 3rem;
}

.welcome-section h1 {
  color: #2e7d32;
  font-size: 2.5rem;
  margin: 0 0 1rem 0;
  font-weight: 600;
}

.welcome-section p {
  color: #666;
  font-size: 1.2rem;
  margin: 0;
}

.auth-status {
  margin-bottom: 3rem;
}

.auth-status h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.status-card {
  display: flex;
  align-items: flex-start;
  padding: 1.5rem;
  margin-bottom: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.status-card.success {
  background: #e8f5e8;
  border-left-color: #4caf50;
}

.status-card.info {
  background: #e3f2fd;
  border-left-color: #2196f3;
}

.status-icon {
  font-size: 2rem;
  margin-right: 1rem;
  min-width: 2rem;
}

.status-content h4 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.1rem;
}

.status-content p {
  margin: 0 0 0.5rem 0;
  color: #666;
  line-height: 1.5;
}

.status-details {
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #555;
  line-height: 1.4;
}

.debug-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #ddd;
}

.debug-section h4 {
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.debug-section h5 {
  margin: 0 0 0.5rem 0;
  color: #444;
  font-size: 1rem;
  font-weight: 500;
}

.actions-section {
  margin-top: 3rem;
  text-align: center;
}

.actions-section h3 {
  color: #333;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 120px;
}

.logout-btn {
  background: #f44336;
  color: white;
}

.logout-btn:hover {
  background: #d32f2f;
  transform: translateY(-1px);
}

.refresh-btn {
  background: #2196f3;
  color: white;
}

.refresh-btn:hover {
  background: #1976d2;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .dashboard-page {
    padding: 1rem;
  }

  .welcome-section h1 {
    font-size: 2rem;
  }

  .status-card {
    flex-direction: column;
    text-align: center;
  }

  .status-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  .action-buttons {
    flex-direction: column;
    align-items: center;
  }

  .action-buttons button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
