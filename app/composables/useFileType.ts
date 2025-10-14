export const useFileType = () => {
  const getImageThumb = (file: any) => {
    // Logic for getting image thumbnail
    return file?.thumbnail || file?.preview_image || null
  }

  const shrinkString = (str: string, maxLength: number): string => {
    if (!str || str.length <= maxLength) return str
    return str.substring(0, maxLength) + '...'
  }

  const getFileTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
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
    return typeMap[type] || 'File'
  }

  return {
    getImageThumb,
    shrinkString,
    getFileTypeDisplay
  }
}
