<template>
  <v-container class="fill-height pa-0">
    <div class="body-content login">
      <div class="sign-screen loginPage customscrollbar h-100">
        <div class="sign-screen-dtable">
          <div class="sign-screen-dtable-cell">
            <div class="sign-screen-content">
              <div class="sign-heading-text text-center mb-4">
                <v-img
                  v-if="logo"
                  :src="logo"
                  alt=""
                  class="brand-logo mx-auto mb-4"
                  max-width="200"
                  contain
                />
                <h2 v-else class="text-h5">{{ brandName }}</h2>
              </div>
              <div class="sign-body">
                <p class="text-body-1 mb-4">Please login to your account</p>
                <v-form ref="formRef" @submit.prevent="login">
                  <div class="row">
                    <div class="col-sm-12">
                      <div class="form-group required mb-4">
                        <v-text-field
                          v-model="form.email"
                          label="Email"
                          type="email"
                          outlined
                          dense
                          autofocus
                          data-lpignore="true"
                          hide-details="auto"
                          :error-messages="emailErrors"
                          @input="clearEmailError"
                        />
                      </div>
                    </div>
                    <div class="col-sm-12">
                      <div class="form-group required mb-6">
                        <v-text-field
                          v-model="form.password"
                          label="Password"
                          type="password"
                          outlined
                          dense
                          data-lpignore="true"
                          hide-details="auto"
                          :error-messages="passwordErrors"
                          @input="clearPasswordError"
                        />
                      </div>
                    </div>
                    <div class="col-sm-12">
                      <v-btn
                        color="primary"
                        type="submit"
                        block
                        large
                        :disabled="loading || hasErrors"
                        :loading="loading"
                        elevation="2"
                      >
                        <template #loader>
                          <v-progress-circular
                            indeterminate
                            size="20"
                            width="2"
                            color="white"
                          />
                        </template>
                        Login
                      </v-btn>
                    </div>
                    <div class="col-sm-12">
                      <div class="text-right mt-3">
                        <NuxtLink
                          :to="`/${route.params.brand_name}/forgot-password`"
                          class="text-decoration-none text-primary"
                        >
                          Forgot Password
                        </NuxtLink>
                      </div>
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
import { ref, computed, onMounted } from "vue";
import { useAppDataStore } from "~/stores/appData";
import { useHead } from "nuxt/app";
import { useHelpers } from "~/composables/core/common/useHelpers";

definePageMeta({
  layout: "login-layout",
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
const emailErrors = ref<string[]>([]);
const passwordErrors = ref<string[]>([]);
const appDataStore = useAppDataStore();

// Getters
const brandName = computed(() => {
  return (route.params.brand_name as string) || "Brand Portal";
});

const hasErrors = computed(() => {
  return emailErrors.value.length > 0 || passwordErrors.value.length > 0;
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

const clearEmailError = () => {
  emailErrors.value = [];
};

const clearPasswordError = () => {
  passwordErrors.value = [];
};

const validateForm = () => {
  emailErrors.value = [];
  passwordErrors.value = [];

  // Email validation
  if (!form.value.email.trim()) {
    emailErrors.value.push("Email address is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    emailErrors.value.push("Please enter a valid email address");
  }

  // Password validation
  if (!form.value.password.trim()) {
    passwordErrors.value.push("Password is required");
  }

  return emailErrors.value.length === 0 && passwordErrors.value.length === 0;
};

const login = async () => {
  if (!validateForm()) return;

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
      emailErrors.value = [result.error || "Login failed"];
    }
  } catch (error: any) {
    emailErrors.value = [error.message || "An error occurred during login"];
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
