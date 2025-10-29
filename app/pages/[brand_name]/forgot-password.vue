<template>
  <v-app :style="{ backgroundColor: primaryColor }">
    <v-main class="d-flex align-center justify-center fill-height">
      <v-card rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <NuxtLink :to="`/${brandName}/login`">
            <v-img
              v-if="logo"
              :src="logo"
              height="48"
              contain
              class="mx-auto"
            />
            <h2 v-else class="text-h5 font-weight-bold">
              {{ brand.name }}
            </h2>
          </NuxtLink>
        </div>

        <div class="text-center mb-6">
          <h3 class="text-h6 mb-1">Forgot Password?</h3>
          <p class="text-body-2 text-medium-emphasis">
            Enter your email and we send you a password reset link.
          </p>
        </div>

        <v-form class="mt-10" @submit.prevent="handleSubmit">
          <v-row no-gutters>
            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Email</label>
              <v-text-field
                v-model="form.email"
                type="email"
                variant="solo"
                density="compact"
                autofocus
                @input="validateEmail"
              />
              <div v-if="emailError" class="form-controls-error">
                {{ emailError }}
              </div>
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
                Send Password Reset Link
              </v-btn>
            </v-col>

            <v-col cols="12" class="form-group">
              <div class="forgotLink mt-4">
                <NuxtLink :to="`/${brandName}/login`" class="btn-link">
                  <AsyncIcon
                    name="tableFilterArrow"
                    width="18"
                    height="18"
                    color="#6473FF"
                  />
                  Back to Login
                </NuxtLink>
              </div>
            </v-col>
          </v-row>
        </v-form>

        <div class="text-center mt-6 text-caption text-medium-emphasis">
          <a
            href="https://www.marketinghub.com/terms-conditions/"
            target="_blank"
            class="text-decoration-none mx-1"
            >Term of use.</a
          >
          <a
            href="https://www.marketinghub.com/privacy-policy/"
            target="_blank"
            class="text-decoration-none mx-1"
            >Privacy policy</a
          >
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { useAuthApi } from "~/composables/api/useAuthApi";
import { ref, computed, onMounted, watch } from "vue";
import { useNuxtApp } from "#app";
import { useAppDataStore } from "~/stores/appData";

interface FormData {
  email: string;
}

interface BrandConfig {
  name?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

interface AppConfig {
  brand?: BrandConfig;
}

/* ======================
   Route & Brand
====================== */
const route = useRoute();
const snackbar = useSnackbar();
const authApi = useAuthApi();
const appDataStore = useAppDataStore();

const brandName = computed(
  () =>
    (route.params.brand_name as string) || (route.query.brand_name as string)
);

const app = useAppConfig() as AppConfig;
const brand = computed(() => ({
  name: app.brand?.name || brandName.value || "Collage.Inc",
  primary: app.brand?.primaryColor || "#1976d2",
  secondary: app.brand?.secondaryColor || "#424242",
}));

/* ======================
   Form & Error States
====================== */
const form = ref<FormData>({
  email: "",
});

const loading = ref(false);
const emailError = ref<string | null>(null);
const logo = ref("");

const primaryColor = ref("#ffffff");

const secondaryColor = ref("#424242");

/* ======================
   Custom Validation
====================== */
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email.trim()) {
    emailError.value = "Email address is required";
    return;
  }
  if (!emailRegex.test(form.value.email)) {
    emailError.value = "Please enter valid email address.";
    return;
  }
  emailError.value = null;
};

const disableSubmitBtn = computed(() => {
  const hasError = !!emailError.value;
  const emptyEmail = !form.value.email.trim();
  return hasError || emptyEmail || loading.value;
});

/* ======================
   Apply custom styles on mount
====================== */
onMounted(async () => {
  /* ======================
   Initialize logo from store
====================== */
  if (process.client) {
    try {
      const appDataStore = useAppDataStore();
      if (!appDataStore.brand) {
        await appDataStore.fetchBrandDetails(route.params.brand_name as string);
        // Give time for store reactivity to propagate
        await nextTick();
        primaryColor.value =
          appDataStore.brand?.branding?.primary_color || "#ffffff";
        secondaryColor.value =
          appDataStore.brand?.branding?.secondary_color || "#424242";
      }
      logo.value = appDataStore.logo || "/Collage-labinc-dark12c.svg";
    } catch (error) {
      console.error("Failed to load logo from store:", error);
    }
  }
});
/* ======================
   Submit Handler
====================== */
const handleSubmit = async () => {
  validateEmail();
  if (disableSubmitBtn.value) return;

  loading.value = true;

  try {
    await authApi.forgotPassword(form.value.email, brandName.value);

    snackbar.showSuccess(
      "You will receive a link to reset your password to your email!"
    );

    await navigateTo(`/${brandName.value}/login`);
  } catch (err: any) {
    const message = err.data?.message || err.message || "Something went wrong";
    snackbar.showError(message);
  } finally {
    loading.value = false;
  }
};

/* ======================
   Page Meta
====================== */
definePageMeta({
  middleware: ["check-url"],
});

/* ======================
   SEO Head
====================== */
useHead({
  title: () => `${brand.value.name} – Forgot Password`,
  link: [{ rel: "icon", href: app.brand?.favicon || "/favicon.ico" }],
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
