<template>
  <v-app>
    <v-main class="d-flex align-center justify-center fill-height">
      <v-card rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <v-img
            v-if="logo"
            :src="logo"
            height="48"
            contain
            class="mx-auto"
          />
          <h2 v-else class="text-h5 font-weight-bold">
            {{ brandName }}
          </h2>
        </div>

        <div class="text-center mb-6">
          <p class="text-body-1 mb-1">Please login to your account</p>
        </div>

        <v-form class="mt-10" @submit.prevent="login">
          <v-row no-gutters>
            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Email</label>
              <v-text-field
                v-model="form.email"
                type="email"
                variant="solo"
                density="compact"
                autofocus
                data-lpignore="true"
                @input="validateEmail"
              />
              <div v-if="emailError" class="form-controls-error">{{ emailError }}</div>
            </v-col>

            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="form.password"
                type="password"
                variant="solo"
                density="compact"
                data-lpignore="true"
                @input="validatePassword"
              />
              <div v-if="passwordError" class="form-controls-error">{{ passwordError }}</div>
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
                Login
              </v-btn>
            </v-col>

            <v-col cols="12" class="form-group">
              <div class="text-right mt-4">
                <NuxtLink
                  :to="`/${route.params.brand_name}/forgot-password`"
                  class="text-decoration-none text-primary"
                >
                  Forgot Password
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
          >
            Term of use.
          </a>
          |
          <a
            href="https://www.marketinghub.com/privacy-policy/"
            target="_blank"
            class="text-decoration-none mx-1"
          >
            Privacy policy
          </a>
        </div>
      </v-card>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAppDataStore } from "~/stores/appData";
import { useHead } from "nuxt/app";
import { useHelpers } from "~/composables/core/common/useHelpers";
import { useSnackbar } from "~/composables/useSnackbar";

definePageMeta({
  middleware: ["check-url"],
});

// Reactive data
const route = useRoute();
const form = ref({
  email: "",
  password: "",
});

const loading = ref(false);
const logo = ref("");
const emailError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const appDataStore = useAppDataStore();
const snackbar = useSnackbar();

// Getters
const brandName = computed(() => {
  return (route.params.brand_name as string) || "Brand Portal";
});

const disableSubmitBtn = computed(() => {
  return !!emailError.value || !!passwordError.value || !form.value.email.trim() || !form.value.password.trim() || loading.value;
});

const { brandDetail } = useHelpers();

// Methods
const customStyles = () => {
  return `:root {
    --primary: ${hexToRgb("#1976d2")} !important;
    --secondary: ${hexToRgb("#424242")} !important;
  }`;
};

const hexToRgb = (hex: string) => {
  if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? parseInt(result[1], 16) +
          "," +
          parseInt(result[2], 16) +
          "," +
          parseInt(result[3], 16)
      : null;
  }
  return "25, 118, 210"; // Default primary blue
};

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

const validatePassword = () => {
  if (!form.value.password.trim()) {
    passwordError.value = "Password is required";
    return;
  }
  passwordError.value = null;
};

const login = async () => {
  validateEmail();
  validatePassword();

  if (disableSubmitBtn.value) return;

  loading.value = true;

  try {
    const authStore = useAuthStore();
    const brandName = route.params.brand_name as string;
    // Pass workspace URL slug from route params as workspace_id
    let workspace_id = appDataStore.brand?.workspace?.url_slug || null;
    if (!workspace_id) {
      const response = await appDataStore.fetchBrandDetails(brandName);
      workspace_id = response?.workspace?.url_slug || null;
    }

    const result = await authStore.login(
      form.value.email,
      form.value.password,
      workspace_id
    );
    console.log("Login result:", result);

    if (result.success) {
      // Fetch user details to ensure store is updated with complete user data
      await authStore.getUser();

      // After successful login and user details fetch, redirect
      await navigateTo(`/${brandName}`);
    } else {
      // Show error for login failure
      snackbar.showError(result.error || "Login failed");
    }
  } catch (error: any) {
    snackbar.showError(error.data?.message || error.message || "An error occurred during login");
  } finally {
    loading.value = false;
  }
};

// Lifecycle
onMounted(async () => {
  // TODO: Load brand logo from appDataStore when implemented
  if (!appDataStore.brand) {
    await appDataStore.fetchBrandDetails(route.params.brand_name as string);
    // Give time for store reactivity to propagate
    await nextTick();
  }
  logo.value = appDataStore.logo || "/Collage-labinc-dark12c.svg";
});

// SEO
useHead({
  title: () => `${brandName.value} Brand Portal by Collage Inc`,
  meta: [
    {
      property: "og:image",
      content: logo.value || "/Collage-labinc-dark12c.svg",
    },
    {
      property: "og:image:width",
      content: "1200",
    },
    {
      property: "og:image:height",
      content: "630",
    },
    {
      property: "og:image:alt",
      content: `${brandName.value} Logo`,
    },
    {
      property: "og:title",
      content: `${brandName.value} Brand Portal by Collage Inc`,
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/x-icon",
      href: "/favicon.png", // TODO: Add brand favicon from appDataStore
    },
  ],
});
</script>

<style scoped>
.fill-height {
  height: 100vh !important;
}

.sign-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.brand-logo {
  max-height: 80px;
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
