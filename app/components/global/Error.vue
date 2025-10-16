<template>
  <div class="error-text h-100">
    <h1 class="mt-n10">{{ error?.statusCode || "Error" }}</h1>
    <h4 v-if="error?.statusCode != 401">{{ errorMessage }}</h4>
    <h4 v-if="error?.statusCode == 401 && errorMessage != 'Unauthenticated'">
      {{ errorMessage }}
    </h4>
    <h4 v-if="error?.statusCode == 401 && errorMessage == 'Unauthenticated'">
      Session is expired.
    </h4>
    <v-btn large :ripple="false" class="btn-primary" @click="backToHome">
      Back to Home
    </v-btn>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useAppDataStore } from "~/stores";
import { useRoute } from "vue-router";

const props = defineProps({
  error: {
    type: Object,
    required: true,
  },
});

const route = useRoute();
const appDataStore = useAppDataStore();

const errorMessage = computed(() => {
  if (!props.error) return "Woops! something went wrong";

  const statusCode = parseInt(props.error.statusCode || 500);
  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction || statusCode === 404) {
    return props.error.message || "Woops! something went wrong";
  }

  return statusCode === 401
    ? props.error.message || "Woops! something went wrong"
    : "Woops! something went wrong";
});

const backToHome = async () => {
  const brandName = route.params.brand_name;
  if (!brandName) {
    await navigateTo(`/`);
  } else {
    let workspace_id = appDataStore.brand?.workspace?.url_slug || null;
    if (workspace_id) await navigateTo(`/${brandName}`);
    else await navigateTo(`/${brandName}/login`); // Redirect to login if brand not found
  }
};
</script>

<style scoped src="@/assets/scss/collage-login.scss"></style>
