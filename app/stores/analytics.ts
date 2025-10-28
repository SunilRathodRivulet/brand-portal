import { defineStore } from 'pinia'

// Type definitions
interface AnalyticsState {
  InsightsTransaction: Record<string, any>
  InsightsTransactionShare: Record<string, any>
  userAgentAndLocation: Record<string, any>
}

interface UserAgentAndLocation {
  location?: string
  agent?: string
  [key: string]: any
}

export const useAnalyticStore = defineStore('insights', {
  state: (): AnalyticsState => ({
    InsightsTransaction: {},
    InsightsTransactionShare: {},
    userAgentAndLocation: {},
  }),

  getters: {
    getInsightsTransaction: (state): Record<string, any> => state.InsightsTransaction,
    getInsightsTransactionShare: (state): Record<string, any> => state.InsightsTransactionShare,
    getUserAgentAndLocation: (state): Record<string, any> => state.userAgentAndLocation,
  },

  actions: {
    setUserAgentAndLocation(payload: UserAgentAndLocation | null): void {
      if (!payload) return
      this.userAgentAndLocation = payload
    },
  },
})
