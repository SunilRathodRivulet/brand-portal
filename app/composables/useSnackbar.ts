import { ref, type Ref } from 'vue'

interface SnackbarOptions {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  position?: 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  closable?: boolean
}

interface Snackbar extends SnackbarOptions {
  id: string
  timestamp: number
}

const snackbars: Ref<Snackbar[]> = ref([])
let counter = 0

export const useSnackbar = () => {
  const generateId = (): string => {
    return `snackbar-${++counter}-${Date.now()}`
  }

  const addSnackbar = (options: SnackbarOptions): string => {
    const id = generateId()
    const snackbar: Snackbar = {
      id,
      message: options.message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      position: options.position || 'bottom',
      closable: options.closable !== false,
      timestamp: Date.now()
    }

    snackbars.value.push(snackbar)

    // Auto remove after duration
    if (snackbar.duration > 0) {
      setTimeout(() => {
        removeSnackbar(id)
      }, snackbar.duration)
    }

    return id
  }

  const removeSnackbar = (id: string): void => {
    const index = snackbars.value.findIndex(snackbar => snackbar.id === id)
    if (index > -1) {
      snackbars.value.splice(index, 1)
    }
  }

  const clearAllSnackbars = (): void => {
    snackbars.value = []
  }

  const showSuccess = (message: string, options?: Partial<SnackbarOptions>): string => {
    return addSnackbar({ ...options, message, type: 'success' })
  }

  const showError = (message: string, options?: Partial<SnackbarOptions>): string => {
    return addSnackbar({ ...options, message, type: 'error' })
  }

  const showWarning = (message: string, options?: Partial<SnackbarOptions>): string => {
    return addSnackbar({ ...options, message, type: 'warning' })
  }

  const showInfo = (message: string, options?: Partial<SnackbarOptions>): string => {
    return addSnackbar({ ...options, message, type: 'info' })
  }

  return {
    snackbars: readonly(snackbars),
    addSnackbar,
    removeSnackbar,
    clearAllSnackbars,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
