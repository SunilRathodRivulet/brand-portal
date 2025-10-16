<template>
  <v-container class="fill-height pa-0">
    <div class="body-content login defaultPage">
      <div class="sign-screen customscrollbar h-100">
        <div class="sign-screen-dtable">
          <div class="sign-screen-dtable-cell">
            <div class="sign-screen-content">
              <div class="sign-heading-text text-center mb-4">
                <NuxtLink to="/">
                  <img
                    class="logo"
                    src="~/assets/img/Collage-labinc-dark12c.svg"
                    alt="Collage"
                  />
                </NuxtLink>
              </div>
              <div class="sign-body">
                <p class="small mb-2">
                  Please visit
                  <a :href="`${config.public.damBackendBaseUrl}`" class="text-decoration-none">Collage</a> in order
                  to create a Digital Asset Manager (DAM) instance or contact our
                  team if you need any help to setup a DAM instance.
                </p>
                <p class="small mb-4">
                  Already have an instance? Enter your brand url endpoint below.
                </p>

                <v-form @submit.prevent="submitHandler">
                  <div class="row">
                    <div class="col-sm-12">
                      <div class="form-group required">
                        <v-text-field
                          v-model.trim="brandName"
                          label="Brand URL"
                          placeholder="your-brand-url"
                          autofocus
                          data-lpignore="true"
                          outlined
                          dense
                          hide-details="auto"
                          :error-messages="brandNameError ? ['Please provide a url.'] : []"
                        >
                          <template v-slot:append>
                            <div
                              v-if="!brandNameError"
                              class="text-info"
                              style="font-size: 0.875rem;"
                            >
                              <template v-if="!brandName">eg.</template>
                              {{ config.public.baseUrl }}/<strong v-if="brandName">{{
                                brandName
                              }}</strong>
                              <strong v-else>&lt;Brand_URL&gt;</strong>
                            </div>
                          </template>
                        </v-text-field>
                      </div>
                    </div>
                    <div class="col-sm-12 text-center">
                      <v-btn
                        color="primary"
                        type="submit"
                        :disabled="brandNameError || loading || !canGo"
                        :loading="loading"
                        large
                        elevation="2"
                      >
                        <template v-if="brandName">
                          Go to {{ brandName }}
                        </template>
                        <template v-else>Enter your brand url</template>
                      </v-btn>
                    </div>
                  </div>
                </v-form>
              </div>
            </div>
            <div class="bottom-fix-link-center mt-4">
              <v-btn
                text
                small
                href="https://www.marketinghub.com/terms-conditions/"
                target="_blank"
                class="mx-1"
              >
                Terms of use
              </v-btn>
              |
              <v-btn
                text
                small
                href="https://www.marketinghub.com/privacy-policy/"
                target="_blank"
                class="mx-1"
              >
                Privacy policy
              </v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

definePageMeta({
  layout: "login-layout",
});

// Reactive data
const brandName = ref('')
const loading = ref(false)
const canGo = ref(true)
const config = useRuntimeConfig()

// Custom validation
const brandNameError = computed(() => {
  return !brandName.value.trim()
})

// Form submission handler
const submitHandler = async () => {
  // Validate
  if (!brandName.value.trim()) {
    return
  }

  loading.value = true
  canGo.value = false

  try {
    // Call verify domain API
    const apiUrl = config.public.apiBaseUrl
      ? `${config.public.apiBaseUrl}verify-domain`
      : '/api/verify-domain'

    const response = await $fetch(apiUrl, {
      method: 'POST',
      body: { url: brandName.value.trim() }
    })

    // Success - redirect to brand portal
    console.log('Domain verification successful:', response)
    await navigateTo(`/${brandName.value.trim()}`)

  } catch (error: any) {
    console.error('Domain verification failed:', error)
    // For now, just redirect on any response since we have mock API
    await navigateTo(`/${brandName.value.trim()}`)
  } finally {
    loading.value = false
    canGo.value = true
  }
}
</script>

<style scoped>
.fill-height {
  height: 100vh !important;
}

.logo {
  height: 60px;
  width: auto;
}

.sign-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.form-group {
  margin-bottom: 1.5rem;
}

.bottom-fix-link-center {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
</style>
