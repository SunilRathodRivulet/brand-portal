<!-- pages/[brand_name]/generate-password.vue -->
<template>
  <v-app v-if="error">
    <v-main class="d-flex align-center justify-center fill-height">
      <v-card rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <NuxtLink :to="`/${brandName}/login`">
            <v-img
              v-if="brand.logo"
              :src="brand.logo"
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
          <h3 class="text-h6 mb-1 text-error">{{ message }}</h3>
          <p class="text-body-2 text-medium-emphasis">
            You might have generated password from this link or Your
            administrator has revoked your invitation. Please contact your
            Administrator for more info.
          </p>
        </div>

        <div class="text-center">
          <NuxtLink :to="`/${brandName}/login`" class="btn-link">
            <AsyncIcon name="playIcon" width="18" height="18" color="#6473FF" />
            Go to Login
          </NuxtLink>
        </div>

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

  <v-app v-else>
    <v-main class="d-flex align-center justify-center fill-height">
      <v-card rounded="xl" elevation="8" width="420" class="pa-6 pa-sm-8">
        <div class="text-center mb-6">
          <NuxtLink :to="`/${brandName}/login`">
            <v-img
              v-if="form.logo"
              :src="form.logo"
              height="48"
              contain
              class="mx-auto"
            />
            <h2 v-else class="text-h5 font-weight-bold">{{ brand.name }}</h2>
          </NuxtLink>
        </div>

        <div class="text-center mb-6">
          <h3 class="text-h6 mb-1">Generate Password</h3>
          <p class="text-body-2 text-medium-emphasis">
            You're generating password for {{ form.email }}
          </p>
        </div>

        <v-form ref="formRef" class="mt-10" @submit.prevent="handleSubmit">
          <v-row no-gutters>
            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Name</label>
              <v-text-field
                v-model="form.name"
                type="text"
                variant="solo"
                density="compact"
                autofocus
                @input="validateName"
              />
              <div v-if="nameError" class="form-controls-error">
                {{ nameError }}
              </div>
            </v-col>

            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Password</label>
              <v-text-field
                v-model="form.password"
                type="password"
                variant="solo"
                density="compact"
                @input="validatePassword"
              />
              <div v-if="passwordError" class="form-controls-error">
                {{ passwordError }}
              </div>
            </v-col>

            <v-col cols="12" class="form-group required mb-4">
              <label class="form-label">Confirm Password</label>
              <v-text-field
                v-model="form.confirm_password"
                type="password"
                variant="solo"
                density="compact"
                @input="validateConfirmPassword"
              />
              <div v-if="confirmPasswordError" class="form-controls-error">
                {{ confirmPasswordError }}
              </div>
            </v-col>

            <v-col cols="12" class="form-group">
              <v-btn
                size="large"
                :ripple="false"
                class="btn-primary w-100"
                :disabled="disableSubmitBtn"
                :loading="submitting"
                type="submit"
              >
                Generate Password
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
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import { onMounted } from "vue";

dayjs.extend(utc);
dayjs.extend(timezone);

interface BrandConfig {
  name?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  favicon?: string;
}

interface AppConfig {
  brand?: BrandConfig;
}

interface FormData {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  logo?: string;
  reset_token?: string;
  invitation_token?: string;
  timezone?: string;
}

interface ApiResponse {
  message: string;
  status: number;
  data?: {
    name: string;
    email: string;
    reset_token: string;
    invitation_token: string;
  };
}

/* ======================
   Route & Brand (same)
====================== */
const route = useRoute();
const { $api } = useNuxtApp();
const snackbar = useSnackbar();

const brandName = computed(
  () =>
    (route.params.brand_name as string) || (route.query.brand_name as string)
);

const app = useAppConfig() as AppConfig;
const brand = computed(() => ({
  name: app.brand?.name || brandName.value || "Collage.Inc",
  logo: app.brand?.logo || "",
  primary: app.brand?.primaryColor || "#1976d2",
  secondary: app.brand?.secondaryColor || "#424242",
}));

/* ======================
   Form & Error States
====================== */
const form = ref<FormData>({
  name: "",
  email: "",
  password: "",
  confirm_password: "",
  logo: "",
  reset_token: "",
  invitation_token: "",
  timezone: dayjs.tz.guess(),
});

const error = ref(false);
const message = ref("");
const submitting = ref(false);

const nameError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const confirmPasswordError = ref<string | null>(null);

/* ======================
   Custom Validation (same as forgot-password)
====================== */
const validateName = () => {
  if (!form.value.name.trim()) return (nameError.value = "Name is required");
  return (nameError.value = null);
};

const validatePassword = () => {
  if (!form.value.password)
    return (passwordError.value = "Password is required");
  if (form.value.password.length < 6)
    return (passwordError.value = "Password must be at least 6 characters");
  return (passwordError.value = null);
};

const validateConfirmPassword = () => {
  if (!form.value.confirm_password)
    return (confirmPasswordError.value = "Confirm Password is required");
  if (form.value.confirm_password !== form.value.password)
    return (confirmPasswordError.value =
      "Password and Confirm Password did not match.");
  return (confirmPasswordError.value = null);
};

const disableSubmitBtn = computed(() => {
  const hasErrors =
    !!nameError.value || !!passwordError.value || !!confirmPasswordError.value;
  const emptyFields =
    !form.value.name.trim() ||
    !form.value.password ||
    !form.value.confirm_password;
  return hasErrors || emptyFields || submitting.value;
});

/* ======================
   Color Styles Helper (kept from original)
====================== */
const customStyles = () => {
  const { brandDetail } = useHelpers();
  const brandInfo = brandDetail.value;
  if (!brandInfo?.branding) return "";

  return `:root {
    --primary: ${hexToRgb(brandInfo.branding.primary_color)} !important;
    --secondary: ${hexToRgb(brandInfo.branding.secondary_color)} !important;
  }`;
};

const hexToRgb = (hex: string) => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return null;
  let c = hex.substring(1).split("");
  if (c.length === 3) c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  const num = parseInt("0x" + c.join(""), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255].join(",");
};

/* ======================
   Fetch Initial Data (useAsyncData instead of asyncData)
====================== */
const { data: invitationData } = await useAsyncData(
  "invitation-data",
  async () => {
    const invitation_token = route.query.invitation_token as string;
    if (!invitation_token) throw createError({ statusCode: 404 });

    try {
      const response = await $api<ApiResponse>("get-invitation-details", {
        method: "POST",
        body: { invitation_token },
        skipAuth: true,
      });

      if (!response.status) {
        throw createError({
          statusCode: 400,
          statusMessage: response.message || "Invalid invitation",
        });
      }

      return response;
    } catch (err: any) {
      const status = err.response?.status || 500;
      if (err.data?.message?.includes("link is expired")) {
        error.value = true;
        message.value = err.data.message;
      } else {
        throw createError({
          statusCode: status,
          statusMessage: err.data?.message || err.message,
        });
      }
    }
  }
);

// Set form data from API
if (invitationData.value && invitationData.value.data) {
  form.value = {
    ...form.value,
    ...invitationData.value.data,
    password: "",
    confirm_password: "",
  };
}

/* ======================
   Apply custom styles on mount
====================== */
onMounted(() => {
  if (process.client) {
    watchImpl();
  }
});

const watchImpl = () => {
  const { brandDetail } = useHelpers();
  const brandInfo = brandDetail.value;

  if (brandInfo?.branding) {
    const root = document.documentElement;
    root.style.setProperty(
      "--primary",
      hexToRgb(brandInfo.branding.primary_color)
    );
    root.style.setProperty(
      "--secondary",
      hexToRgb(brandInfo.branding.secondary_color)
    );
  }
};

// Set logo from store if available
if (process.client && !error.value) {
  try {
    const appDataStore = useAppDataStore();
    if (!appDataStore.brand) {
      await appDataStore.fetchBrandDetails(route.params.brand_name as string);
      // Give time for store reactivity to propagate
      await nextTick();
    }
    form.value.logo = appDataStore.logo || "/Collage-labinc-dark12c.svg";
  } catch {}
}

/* ======================
   Submit Handler
====================== */
const handleSubmit = async () => {
  // Validate all
  validateName();
  validatePassword();
  validateConfirmPassword();

  if (disableSubmitBtn.value) return;

  submitting.value = true;

  try {
    const payload = {
      email_token: form.value.reset_token,
      token: form.value.invitation_token,
      password: form.value.password,
      name: form.value.name,
      timezone: form.value.timezone,
    };

    const response = await $api("generate-password", {
      method: "POST",
      body: payload,
      skipAuth: true,
    });

    const url = response.data?.data?.user?.url;
    const successUrl = url || brandName.value;

    snackbar.showSuccess(
      response.data?.message ||
        response.data?.data?.message ||
        response.message ||
        "Password generated successfully!"
    );

    await navigateTo(`/${successUrl}/login`);
  } catch (err: any) {
    snackbar.showError(err.data?.message || "Something went wrong");

    setTimeout(() => {
      navigateTo(`/${brandName.value}/login`);
    }, 5000);
  } finally {
    submitting.value = false;
  }
};

/* ======================
   SEO Head
====================== */
useHead({
  title: () => `Generate password – ${brand.value.name}`,
  link: [{ rel: "icon", href: app.brand?.favicon || "/favicon.ico" }],
});
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
}
</style>
