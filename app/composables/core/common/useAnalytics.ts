// composables/useCommonFunction.ts
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useAnalyticStore } from '@/stores/analytics'
import { useHelpers } from './useHelpers'

// Type definitions
interface AnalyticsPayload {
    workspace_id?: number | string;
    collection_id?: number | string;
    category_id?: number[];
    asset_id?: number[];
    event: string;
    sub_event: string;
    environment: string;
    [key: string]: any;
}

interface UserAgentAndLocation {
    location: string;
    agent: string;
}

interface BrowserOsResponse {
    userLocation: string;
    userAgent: string;
}

interface TransactionResponse {
    data: any;
    message?: string;
}

export function useAnalytics() { // Renamed function
    const route = useRoute()
    const analyticsStore = useAnalyticStore()
    const { $api } = useNuxtApp() as any
    const { getWorkspaceId } = useHelpers()

    const dispatchAnalytics = async (payload: AnalyticsPayload): Promise<void> => {
        try {
            if (process.client) {
                let userAgentAndLocation: UserAgentAndLocation = (analyticsStore.userAgentAndLocation as UserAgentAndLocation) || { location: '', agent: '' }

                if (!Object.keys(userAgentAndLocation).length) {
                    const data: BrowserOsResponse = await $api('/api/browser-os', {
                        useApiBase: false,
                    })

                    userAgentAndLocation = {
                        location: data.userLocation,
                        agent: data.userAgent,
                    }

                    analyticsStore.setUserAgentAndLocation(userAgentAndLocation)
                }

                const transactionData = JSON.stringify({
                    ...payload,
                    userAgentAndLocation,
                })

                const encodedTransactionData = btoa(transactionData)
                const obfuscatedEncodedTransactionData = encodedTransactionData
                    .split('')
                    .reverse()
                    .join('')

                const workspace_id = payload.workspace_id || getWorkspaceId()

                const data: TransactionResponse = await $api(
                    `digital/add-transaction-activity`,
                    {
                        method: 'POST',
                        query: { workspace_id: workspace_id },
                        body: {
                            workspace_id: workspace_id,
                            data: obfuscatedEncodedTransactionData,
                        }
                    }
                )
            }
        } catch (error: any) {
            console.error('Error in dispatchAnalytics:', error)
        }
    }

    const dispatchAnalyticsShare = async (payload: AnalyticsPayload): Promise<void> => {
        try {
            if (process.client) {
                let userAgentAndLocation: UserAgentAndLocation = (analyticsStore.userAgentAndLocation as UserAgentAndLocation) || { location: '', agent: '' }

                if (!Object.keys(userAgentAndLocation).length) {
                    const data: BrowserOsResponse = await $api('/api/browser-os', {
                        useApiBase: false,
                    })

                    userAgentAndLocation = {
                        location: data.userLocation,
                        agent: data.userAgent,
                    }

                    analyticsStore.setUserAgentAndLocation(userAgentAndLocation)
                }

                const transactionData = JSON.stringify({
                    ...payload,
                    userAgentAndLocation,
                })

                const encodedTransactionData = btoa(transactionData)
                const obfuscatedEncodedTransactionData = encodedTransactionData
                    .split('')
                    .reverse()
                    .join('')

                const workspace_id = payload.workspace_id || getWorkspaceId()

                const transactionResponse: TransactionResponse = await $api(
                    `transaction-activity`,
                    {
                        method: 'POST',
                        body: {
                            workspace_id: workspace_id,
                            data: obfuscatedEncodedTransactionData,
                        }
                    }
                )
            }
        } catch (error: any) {
            console.error('Error in dispatchAnalyticsShare:', error)
        }
    }

    return {
        dispatchAnalytics,
        dispatchAnalyticsShare,
    }
}
