import { defineStore } from 'pinia'
import FileSaver from 'file-saver'
import { useDownloadApi } from '../composables/api/useDownloadApi'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface DownloadItem {
    url: string
    name: string
    progress: number
    loaded: number
    total: number
    downloading: boolean
    source?: any
    errorMessage?: string
    [key: string]: any // extras
}

export interface DownloaderState {
    pinned: boolean
    expanded: boolean
    count: number
    files: Record<string, DownloadItem>
}

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */
export const useDownloadStore = defineStore('download', () => {
    /* ----------------------------------------------------------------
     * State
     * --------------------------------------------------------------*/
    const state = reactive<DownloaderState>({
        pinned: false,
        expanded: true,
        count: 0,
        files: {},
    })

    /* ----------------------------------------------------------------
     * Mutations (kept as tiny helpers for backward compatibility)
     * --------------------------------------------------------------*/
    function setDownloadingItem(
        id: string,
        item: Partial<DownloadItem>
    ) {
        if (!state.files[id]) state.files[id] = { ...item } as DownloadItem
        else Object.assign(state.files[id], item)

        state.count = Object.keys(state.files).length
    }

    function removeDownloadingItem(id: string) {
        delete state.files[id]
        state.count = Object.keys(state.files).length
    }

    /* ----------------------------------------------------------------
     * Actions
     * --------------------------------------------------------------*/
    const nuxtApp = useNuxtApp()
    const snackbar = useSnackbar();
    const { downloadAsset, downloadCollectionAsset, getWorkspaceId, getErrorMessage } = useHelpers()
    const { downloadFile: apiDownloadFile, downloadMultipleFiles: apiDownloadMultipleFiles, downloadImageAsset: apiDownloadImageAsset, finalDownload } = useDownloadApi()

    /**
     * Download a single file (blob) with progress.
     * Mirrors the old `downloadFile` action.
     */
    async function downloadFile(payload: {
        id: string
        url: string
        name: string
        file_type?: string
        collection_id?: string
        callCountApi?: boolean
        useModernDownload?: boolean
        extras?: Record<string, any>
        multiple?: boolean
    }) {
        const {
            id,
            url,
            name,
            callCountApi = true,
            useModernDownload = false,
            extras = {},
            multiple = false,
        } = payload

        if (state.files[id]?.downloading) return

        const item: DownloadItem = {
            url,
            name,
            progress: 0,
            loaded: 0,
            total: 0,
            downloading: true,
            ...extras,
        }

        const controller = new AbortController()
        item.source = { signal: controller.signal } as any // compatibility
        setDownloadingItem(id, item)

        try {
            const result = await apiDownloadFile({ ...payload, onProgress: (progress: number, loaded: number, total: number) => {
                item.progress = progress
                item.loaded = loaded
                item.total = total
                setDownloadingItem(id, item)
            } })

            if (result) {
                const { blob, finalName } = result
                FileSaver.saveAs(blob, finalName)
            }
            removeDownloadingItem(id)
            return item
        } catch (e: any) {
            if (e.name === 'AbortError') {
                item.downloading = false
                item.errorMessage = 'Download cancelled'
            } else {
                item.downloading = false
                item.errorMessage = getErrorMessage(e)
            }
            removeDownloadingItem(id)
            snackbar.showError(item.errorMessage)
        }
    }

    /**
     * Download many files as a ZIP (two endpoints).
     * Mirrors the old `downloadMultipleFiles` action.
     */
    async function downloadMultipleFiles(payload: {
        files?: string[]
        folders?: string[]
        collection_id?: string
        download_name?: string
        shareWorkspaceId?: string
        shareMode?: boolean
    }) {
        const response = await apiDownloadMultipleFiles(payload)

        if (response.status === 'email-notification') {
            snackbar.showSuccess(
                'You will be receiving an email with zip file download link shortly!'
            )
            return { status: 'email-notification', message: 'Email notification sent for download' }
        }

        if (response.status === 'success-direct-link') {
            await downloadFile({
                id: Math.random().toString(36).slice(2),
                name: response.name,
                url: response.url,
                file_type: response.file_type,
                multiple: true,
                extras: {},
            })
            return { status: 'success-direct-link' }
        }

        // Stream-Saver case
        const { res, finalFilename } = await finalDownload(response)

        const fileStream = nuxtApp.$streamSaver.createWriteStream(finalFilename)
        const writer = fileStream.getWriter()
        const reader = res.body!.getReader()

        const pump = async () => {
            while (true) {
                const { done, value } = await reader.read()
                if (done) {
                    await writer.close()
                    break
                }
                await writer.write(value).catch(() => { })
            }
        }

        await pump()
        return { status: 'success', filename: finalFilename }
    }

    /**
     * Download a generated image asset.
     * Mirrors the old `downloadImageAsset` action.
     */
    async function downloadImageAsset(payload: {
        assetId: string
        fileName: string
        fileType: string
    }) {
        const result = await apiDownloadImageAsset(payload)
        const mime: Record<string, string> = {
            apng: 'image/apng',
            avif: 'image/avif',
            gif: 'image/gif',
            png: 'image/png',
            webp: 'image/webp',
            jpg: 'image/jpeg',
        }

        const newBlob = result.blob.slice(0, result.blob.size, mime[payload.fileType] || 'image/jpeg')
        FileSaver.saveAs(newBlob, payload.fileName)
    }

    /* ----------------------------------------------------------------
     * Expose the same interface as the old Vuex module
     * --------------------------------------------------------------*/
    return {
        // state (reactive)
        ...toRefs(state),
        // mutations
        setDownloadingItem,
        removeDownloadingItem,
        // actions
        downloadFile,
        downloadMultipleFiles,
        downloadImageAsset,
    }
})
