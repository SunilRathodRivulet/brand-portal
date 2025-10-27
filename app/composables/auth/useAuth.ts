import { useCookie } from "#app";
import { useNuxtApp } from "#imports";
import { useAuthStore } from "~/stores/auth";
import { useAuthApi } from "~/composables/api/useAuthApi";
import { toRaw, ref, computed, type Ref, type ComputedRef } from 'vue';

// Type definitions
interface LoginCredentials {
  email: string;
  password: string;
  userAgentAndLocation?: any;
}

interface LoginOptions {
  isSupport?: Ref<boolean>;
}

interface LoginResponse {
  data: {
    access_token: string;
  };
}

interface UserResponse {
  data: {
    user: User;
  };
}

interface User {
  id: number;
  email: string;
  accessibleWorkspaces?: Workspace[];
  [key: string]: any;
}

interface Workspace {
  id: number;
  name: string;
  [key: string]: any;
}

const user: Ref<User | null> = ref(null);

export const useAuth = () => {
  const authApi = useAuthApi();
  const authToken = useCookie<string | null>("auth_token", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    secure: process.env.NODE_ENV === "production",
  });

  const isAuthenticated: ComputedRef<boolean> = computed(
    () => !!authToken.value && user.value !== null
  );

  const fetchUser = async (): Promise<User | null> => {
    if (!authToken.value) {
      console.warn("[fetchUser] No auth token found");
      return null;
    }

    try {
      const userData = await authApi.getUser(authToken.value);

      if (!userData) {
        console.warn("[fetchUser] No user data in response");
        return null;
      }

      user.value = userData;
      return user.value;
    } catch (err: any) {
      console.error("[fetchUser] Failed:", err?.message || "Unknown error");
      authToken.value = null;
      user.value = null;
      return null;
    }
  };

  const login = async (credentials: LoginCredentials, options: LoginOptions = { isSupport: ref(false) }): Promise<User> => {
    try {
      const loginUrl = options.isSupport?.value ? "/support-login" : "/login";
      const payload = {
        email: credentials.email,
        password: credentials.password,
        ...(credentials.userAgentAndLocation && {
          userAgentAndLocation: credentials.userAgentAndLocation,
        }),
      };
      const response: LoginResponse = await authApi.login(credentials.email, credentials.password);

      if (!response || !response.data || !response.data.access_token) {
        console.error("[login] No access token in response");
        throw new Error("Login failed: Invalid response");
      }

      const token = response.data.access_token;
      authToken.value = token;

      // Fetch user after login
      const newUser = await fetchUser();
      user.value = toRaw(newUser)

      if (!user.value) {
        throw new Error("Login failed: No user data received 0");
      }

      // Only run workspace logic in non-support mode
      const currentWorkspaceCookie = useCookie<Workspace | null>("currentWorkspace");

      if (
        (!currentWorkspaceCookie?.value ||
          !currentWorkspaceCookie?.value?.id) &&
        user.value.accessibleWorkspaces?.length > 0
      ) {
        currentWorkspaceCookie.value = user.value.accessibleWorkspaces[0];
      }

      const workspaceId =
        currentWorkspaceCookie?.value?.id ||
        user.value.accessibleWorkspaces?.[0]?.id;

      if (!workspaceId) {
        throw new Error("Login failed: No workspace ID available");
      }
      const authStore = useAuthStore();
      authStore.setUser(user.value);

      await navigateTo(`/${workspaceId}/dam/dashboard`);

      return user.value;
    } catch (error: any) {
      console.error("[login] Error:", error);
      authToken.value = null;
      user.value = null;
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout(authToken.value);
    } catch (error: any) {
      console.error("[logout] Error:", error);
    } finally {
      // Clear all auth-related cookies
      authToken.value = null;
      user.value = null;
      const currentWorkspaceCookie = useCookie<Workspace | null>("currentWorkspace");
      currentWorkspaceCookie.value = null;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    fetchUser,
  };
};
