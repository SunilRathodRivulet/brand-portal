import { computed, unref, type MaybeRef } from 'vue'

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
export interface FileItem {
  file_type?: string
  display_file?: string
  preview_image?: string
  thumbnail_file?: string
  compress_file?: string
}

/* ------------------------------------------------------------------ */
/* Helpers  –  expose global type-guards (or import from utils)       */
/* ------------------------------------------------------------------ */


/* ------------------------------------------------------------------ */
/* Composable                                                         */
/* ------------------------------------------------------------------ */

export const imageExtensions = [
  'jpg',
  'png',
  'jpeg',
  'svg',
  'gif',
  'psd',
  'ai',
  'eps',
  'pbm',
  'ppm',
  'nef',
  'orf',
  'bmp',
  'cr2',
  'crw',
  'tiff',
  'x3f',
  'ttf',
  'otf',
  'xd',
  'indd',
  'sketch',
]
export const videoExtensions = [
  'mp4',
  'mkv',
  'webm',
  'mov',
  'mpeg-4',
  'mov',
  // 'avi',
  '3gp',
]
export const pdfExtensions = ['pdf']
export const htmlExtensions = ['html']

export const docExtensions = [
  'doc',
  'docx',
  'ppt',
  'pptx',
  'xlsx',
  'xls',
  'dotx',
  'odt',
  'ott',
]
export const audioExtensions = ['mp3', 'wav', 'wma', 'aac', 'ogg']
export const txtExtensions = ['txt']
export function useFileType(file: MaybeRef<FileItem | undefined>) {
  const route = useRoute()

  /* -------------------- core reactive shortcuts ------------------- */
  const ext = computed(() => unref(file)?.file_type)
  const url = computed(() => unref(file)?.display_file)
  const thumb = computed(() => unref(file)?.preview_image)
  const imageT = computed(() => unref(file)?.thumbnail_file)
  const compressed = computed(() => unref(file)?.compress_file)

  const isPdf = computed(() => !!ext.value && pdfExtensions.includes(ext.value.toLowerCase()))
  const isImage = computed(() => !!ext.value && imageExtensions.includes(ext.value.toLowerCase()))
  const isVideo = computed(() => !!ext.value && videoExtensions.includes(ext.value.toLowerCase()))
  const isTxt = computed(() => !!ext.value && txtExtensions.includes(ext.value.toLowerCase()))
  const isDoc = computed(() => !!ext.value && docExtensions.includes(ext.value.toLowerCase()))
  const isAudio = computed(() => !!ext.value && audioExtensions.includes(ext.value.toLowerCase()))
  const isHtml = computed(() => !!ext.value && htmlExtensions.includes(ext.value.toLowerCase()))

  /* -------------------- file-type helpers (useFileType) ----------- */
  const getImageThumb = (f: any) =>
    f?.thumbnail || f?.preview_image || null

  const shrinkString = (str: string, maxLength: number): string =>
    !str || str.length <= maxLength ? str : str.slice(0, maxLength) + '…'

  const getFileTypeDisplay = (type: string): string => {
    const map: Record<string, string> = {
      'image/jpeg': 'Image',
      'image/png': 'Image',
      'image/gif': 'Image',
      'image/svg+xml': 'SVG',
      'application/pdf': 'PDF',
      'application/msword': 'Document',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Document',
      'video/mp4': 'Video',
      'video/mpeg': 'Video',
      'video/quicktime': 'Video',
      'audio/mpeg': 'Audio',
      'audio/wav': 'Audio',
      'audio/mp3': 'Audio',
      'application/zip': 'Archive',
      'application/x-zip-compressed': 'Archive',
    }
    return map[type] || 'File'
  }

  /* -------------------- icon resolution --------------------------- */
  const GENERAL_ICON = '/img/icon/file/general.svg'

  function getPreviewIcon(
    e = ext.value,
    t = thumb.value,
    it = imageT.value,
    ci = compressed.value,
    u = url.value,
  ): string {
    if (!e) return GENERAL_ICON
    if (isPdf.value) return it || ci || t
    if (isAudio.value) return '/img/icon/file/audio.svg'
    if (isImage.value) return it || ci || t || GENERAL_ICON
    if (isDoc.value) return it || ci || t
    if (isHtml.value) return it || ci || t
    try { return `/img/icon/file/${e}.svg` } catch { return t || GENERAL_ICON }
  }

  function getDetailIcon(
    e = ext.value,
    t = thumb.value,
    it = imageT.value,
    ci = compressed.value,
    u = url.value,
  ): string {
    if (!e) return GENERAL_ICON
    if (isPdf.value) return ci || it || t
    if (isAudio.value) return '/img/icon/file/audio.svg'
    if (isImage.value) {
      return unref(file)?.file_type === 'gif' && u ? u : ci || it || t
    }
    if (isDoc.value) return ci || it || t
    if (isHtml.value) return ci || it || t
    try { return `/img/icon/file/${e}.svg` } catch { return t || GENERAL_ICON }
  }

  /* -------------------- final icon ------------------------------- */
  const previewImage = computed(() =>
    (route.name as string)?.includes('files')
      ? getDetailIcon()
      : getPreviewIcon(),
  )

  /* -------------------- return ----------------------------------- */
  return {
    /* icon */
    ext, url, thumb, imageThumb: imageT, compressed,
    isPdf, isImage, isVideo, isTxt, isDoc, isAudio, isHtml,
    previewImage, getPreviewIcon, getDetailIcon,
    /* file-type */
    getImageThumb, shrinkString, getFileTypeDisplay,
  }
}