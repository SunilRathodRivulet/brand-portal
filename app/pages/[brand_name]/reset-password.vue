<template>
  <v-app>
    <v-main class="d-flex align-center justify-center fill-height">
      <v-container class="pa-0" v-if="loadingForm">
        <v-card rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8 text-center">
          <v-progress-circular indeterminate size="40" />
          <p class="mt-4">Loading...</p>
        </v-card>
      </v-container>
      <v-card v-if="error" rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8 text-center">

        <v-img
          v-if="logo"
          :src="logo"
          height="48"
          contain
          class="mx-auto mb-6"
        />
        <v-img
          v-else
          src="~/assets/img/lariat-marketing-hub.svg"
          height="48"
          contain
          class="mx-auto mb-6"
        />
        <div class="error-text">
          <h3 class="text-h6 mb-2">{{ message }}</h3>
          <p class="text-body-2 text-medium-emphasis">This URL is not valid to reset Password.</p>
        </div>
      </v-card>
      <v-card v-else rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <NuxtLink :to="`/${form.brand_url}/login`">
            <v-img
              v-if="logo"
              :src="logo"
              height="48"
              contain
              class="mx-auto"
            />
            <h2 v-else class="text-h5 font-weight-bold">{{ form.company_name }}</h2>
          </NuxtLink>
        </div>
        <div class="text-center mb-6">
          <h3 class="text-h6 mb-1">Reset Password</h3>
          <p class="text-body-2 text-medium-emphasis">You’re resetting password for {{ form.email }}</p>
        </div>
        <v-form class="mt-10" @submit.prevent="handleSubmit">
          <v-row no-gutters>
            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="form.password"
                type="password"
                variant="solo"
                density="compact"
                placeholder="Password"
                autofocus
                @input="validatePassword"
              />
              <div v-if="passwordError" class="form-controls-error">{{ passwordError }}</div>
            </v-col>
            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Confirm Password</label>
              <v-text-field
                v-model="form.confirm_password"
                type="password"
                variant="solo"
                density="compact"
                placeholder="Confirm Password"
                @input="validateConfirmPassword"
              />
              <div v-if="confirmPasswordError" class="form-controls-error">{{ confirmPasswordError }}</div>
            </v-col>
            <v-col cols="12" class="form-group">
              <v-btn
                size="large"
                :ripple="false"
                class="btn-primary w-100"
                :disabled="disableSubmitBtn"
                :loading="loading"
                type="submit"
              >
                Submit
              </v-btn>
            </v-col>
          </v-row>
        </v-form>
        <div class="text-center mt-6 text-caption text-medium-emphasis">
          <a href="https://www.marketinghub.com/terms-conditions/" target="_blank" class="text-decoration-none mx-1">Term of use.</a>
          <a href="https://www.marketinghub.com/privacy-policy/" target="_blank" class="text-decoration-none mx-1">Privacy policy</a>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useAuthApi } from '~/composables/api/useAuthApi'
import { onMounted } from 'vue'

dayjs.extend(utc)
dayjs.extend(timezone)

interface FormData {
  email: string
  password: string
  confirm_password: string
  company_name?: string
  brand_logo?: string
  brand_url?: string
  primary_color?: string
  secondary_color?: string
  brand_name?: string
  email_token?: string
  token?: string
  brand_favicon?: string
}

/* ======================
   Reactive Data
====================== */
const route = useRoute()
const snackbar = useSnackbar()
const authApi = useAuthApi()

const form = ref<FormData>({
  email: '',
  password: '',
  confirm_password: '',
})
const loading = ref(false)
const loadingForm = ref(true)
const error = ref(false)
const message = ref('')
const passwordError = ref<string | null>(null)
const confirmPasswordError = ref<string | null>(null)

/* ======================
   Brand Details
====================== */
const { brandDetail } = useHelpers()
const logo = ref('')

/* ======================
   Custom Validation
====================== */
const validatePassword = () => {
  if (!form.value.password.trim()) {
    passwordError.value = 'Password is required'
    return false
  }
  if (form.value.password.length < 6) {
    passwordError.value = 'Password must be at least 6 characters'
    return false
  }
  passwordError.value = null
  return true
}

const validateConfirmPassword = () => {
  if (!form.value.confirm_password.trim()) {
    confirmPasswordError.value = 'Confirm Password is required'
    return false
  }
  if (form.value.confirm_password !== form.value.password) {
    confirmPasswordError.value = 'Password and Confirm Password did not match.'
    return false
  }
  confirmPasswordError.value = null
  return true
}

const disableSubmitBtn = computed(() => {
  return (
    loading.value ||
    !!passwordError.value ||
    !!confirmPasswordError.value ||
    !form.value.password.trim() ||
    !form.value.confirm_password.trim()
  )
})

/* ======================
   Color Styles Helper
====================== */
const customStyles = () => {
  const brandInfo = brandDetail.value
  if (!brandInfo?.branding) return ''

  return `:root {
    --primary: ${hexToRgb(brandInfo.branding.primary_color)} !important;
    --secondary: ${hexToRgb(brandInfo.branding.secondary_color)} !important;
  }`
}

const hexToRgb = (hex: string) => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return null
  let c = hex.substring(1).split('')
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]]
  const num = parseInt('0x' + c.join(''), 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(',')
}

/* ======================
   Fetch Page Data
====================== */
const { data } = await useAsyncData('reset-password-details', async () => {
  const query = route.query
  const token = query.token as string

  if (!token) {
    throw createError({ statusCode: 404, statusMessage: 'Token not provided' })
  }

  try {
    const response = await authApi.getResetPasswordDetails(token)
    return response
  } catch (err: any) {
    if (err.data?.message?.includes('expired')) {
      error.value = true
      message.value = err.data.message
      return null
    } else {
      throw createError({ statusCode: err.status || 500, statusMessage: err.data?.message || err.message })
    }
  }
})

if (data.value) {
  form.value = { ...form.value, ...data.value, password: '', confirm_password: '' }
  error.value = false
  loadingForm.value = false
} else {
  loadingForm.value = false
}

/* ======================
   Apply custom styles on mount
====================== */
onMounted(async () => {
  if (process.client) {
    const appDataStore = useAppDataStore();
    if (!appDataStore.brand) {
      await appDataStore.fetchBrandDetails(route.params.brand_name as string);
      // Give time for store reactivity to propagate
      await nextTick();
    }
    logo.value = appDataStore.logo || "/Collage-labinc-dark12c.svg";
    const brandInfo = brandDetail.value
    if (brandInfo?.branding) {
      const root = document.documentElement
      root.style.setProperty('--primary', hexToRgb(brandInfo.branding.primary_color))
      root.style.setProperty('--secondary', hexToRgb(brandInfo.branding.secondary_color))
    }
  }
})

/* ======================
   Submit Handler
====================== */
const handleSubmit = async () => {
  const passwordValid = validatePassword()
  const confirmValid = validateConfirmPassword()
  if (!passwordValid || !confirmValid || disableSubmitBtn.value) return

  loading.value = true
  const timezone = dayjs.tz.guess()

  try {
    const response = await authApi.resetPassword(
      form.value.email_token as string,
      form.value.token as string,
      form.value.password,
      timezone
    )

    snackbar.showSuccess(response.message)

    await navigateTo(`/${response.data.user.url}/login`)
  } catch (err: any) {
    const errMessage = err.data?.message || err.message || 'Something went wrong'
    snackbar.showError(errMessage)
  } finally {
    loading.value = false
  }
}

/* ======================
   Page Meta
====================== */
definePageMeta({
  middleware: ['redirect-if-logged-in'],
})

/* ======================
   SEO Head
====================== */
useHead({
  title: () => form.value.brand_name || 'Digital Asset Manager',
  link: [{ rel: 'icon', href: form.value.brand_favicon || '/favicon.ico' }],
})
</script>

<style scoped></style>
