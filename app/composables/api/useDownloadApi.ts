export const useDownloadApi = () => {
    const snackbar = useSnackbar()
    const { downloadAsset, downloadCollectionAsset, getWorkspaceId, getErrorMessage } = useHelpers()

    /**
     * Download a single file (blob) with progress.
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
        onProgress?: (progress: number, loaded: number, total: number) => void
    }): Promise<{ blob: Blob, finalName: string } | void> {
        const {
            id,
            url,
            name,
            file_type,
            collection_id,
            callCountApi = true,
            useModernDownload = false,
            extras = {},
            multiple = false,
            onProgress,
        } = payload

        // Legacy collection asset download (non-modern)
        if (!multiple && !useModernDownload) {
            return collection_id
                ? downloadCollectionAsset('Digital Assets', id, collection_id)
                : downloadAsset('Digital Assets', id)
        }

        const controller = new AbortController()

        try {
            const response = await fetch(url, {
                signal: controller.signal,
                headers: multiple
                    ? {}
                    : { 'Cache-Control': 'no-cache', Pragma: 'no-cache', Expires: '0' },
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const contentLength = response.headers.get('Content-Length')
            const total = contentLength ? parseInt(contentLength, 10) : 0

            const reader = response.body!.getReader()
            const chunks: Uint8Array[] = []
            let loaded = 0

            while (true) {
                const { done, value } = await reader.read()
                if (done) break
                if (value) {
                    chunks.push(value)
                    loaded += value.length
                    const progress = total > 0 ? Math.round((loaded * 100) / total) : 0
                    onProgress?.(progress, loaded, total)
                }
            }

            const blob = new Blob(chunks as BlobPart[])
            const headers = Object.fromEntries(response.headers.entries()) as any

            let finalName = name
            if (!/\.[a-zA-Z0-9]+$/.test(finalName)) {
                const ct = headers['content-type'] || file_type
                if (ct) {
                    const ext = '.' + ct.split('/').pop()!.split(';')[0].split('+')[0]
                    finalName += ext
                }
            }

            return { blob, finalName }
        } catch (e: any) {
            throw e
        } finally {
            controller.abort()
        }
    }

    /**
     * Download many files as a ZIP.
     */
    async function downloadMultipleFiles(payload: {
        files?: string[]
        folders?: string[]
        collection_id?: string
        download_name?: string
        shareWorkspaceId?: string
        shareMode?: boolean
    }): Promise<any> {
        const {
            files,
            folders,
            collection_id,
            download_name = '',
            shareWorkspaceId,
            shareMode = false,
        } = payload

        const body: any = {
            workspace_id: shareWorkspaceId || getWorkspaceId(),
            ...(files?.length ? { assets_ids: files } : {}),
            ...(folders?.length ? { category_ids: folders } : {}),
            ...(collection_id ? { collection_ids: [collection_id] } : {}),
        }

        const endpoint = shareMode ? 'share-zip-data' : 'digital/generate-zip-data'

        const response = await $fetch<{
            data?: { zipFileName?: string; url?: string; file_name?: string; file_type?: string }
        }>(endpoint, { method: 'POST', body })

        if (!response.data) {
            if (shareMode) throw new Error('No data in response')
            snackbar.showSuccess(
                'You will be receiving an email with zip file download link shortly!'
            )
            return { status: 'email-notification', message: 'Email notification sent for download' }
        }

        // Direct-link case (only shared files)
        if (response.data.url && response.data.file_name && shareMode) {
            return { status: 'success-direct-link', url: response.data.url, name: response.data.file_name, file_type: response.data.file_type }
        }

        // Stream-Saver case
        const config = useRuntimeConfig()
        const zipUrl =
            config.public.ZIP_DOWNLOAD_URL ||
            'https://devworker.collage.inc/'
        const filename =
            response.data.zipFileName ||
            (download_name || `download-${Math.floor(Math.random() * 100000)}`) + '.zip'

        return { status: 'fetch', zipUrl, filename, payload: response.data }
    }

    /**
     * Download a generated image asset.
     */
    async function downloadImageAsset(payload: {
        assetId: string
        fileName: string
        fileType: string
    }): Promise<{ blob: Blob }> {
        const { assetId, fileName, fileType } = payload
        const mime: Record<string, string> = {
            apng: 'image/apng',
            avif: 'image/avif',
            gif: 'image/gif',
            png: 'image/png',
            webp: 'image/webp',
            jpg: 'image/jpeg',
        }

        const blob = await $fetch<Blob>(
            '/digital/download-file',
            {
                method: 'POST',
                body: {
                    workspace_id: getWorkspaceId(),
                    digital_assets_id: assetId,
                    image_type: 'actual',
                },
                responseType: 'blob',
            }
        )

        const newBlob = blob.slice(0, blob.size, mime[fileType] || 'image/jpeg')
        return { blob: newBlob }
    }

    // Function to perform the final download/read operation
    async function finalDownload(downloadMultipleResponse: any) {
        const { zipUrl, filename, payload } = downloadMultipleResponse

        const res = await fetch(`${zipUrl}download`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ payload }),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({}))
            throw new Error(err.error || res.statusText)
        }

        const cd = res.headers.get('Content-Disposition') || ''
        const match = cd.match(/filename="(.+)"/)
        const finalFilename = match?.[1] || filename

        return { res, finalFilename }
    }

    return {
        downloadFile,
        downloadMultipleFiles,
        downloadImageAsset,
        finalDownload,
    }
}
