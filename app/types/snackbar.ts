import type { Component } from 'vue'

/**
 * Available snackbar color themes
 */
export type SnackbarColor = 'success' | 'error' | 'warning' | 'info'

/**
 * Configuration options for snackbar display
 */
export interface SnackbarOptions {
  /** The message text to display */
  message: string
  /** Custom icon component (optional) */
  icon?: Component | null
  /** Color theme for the snackbar */
  color?: SnackbarColor
  /** Timeout duration in milliseconds */
  timeout?: number
}

/**
 * Methods available on the snackbar plugin
 */
export interface SnackbarMethods {
  /**
   * Show a custom snackbar with specified options
   * @param message - The message to display
   * @param icon - Custom icon component (optional)
   * @param color - Color theme ('success', 'error', 'warning', 'info')
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  show(message: string, icon?: Component | null, color?: SnackbarColor, timeout?: number): void
  
  /**
   * Show a success snackbar
   * @param message - The message to display
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  success(message: string, timeout?: number): void
  
  /**
   * Show an error snackbar
   * @param message - The message to display
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  error(message: string, timeout?: number): void
  
  /**
   * Show a warning snackbar
   * @param message - The message to display
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  warning(message: string, timeout?: number): void
  
  /**
   * Show an info snackbar
   * @param message - The message to display
   * @param timeout - Timeout in milliseconds (default: 3000)
   */
  info(message: string, timeout?: number): void
  
  /**
   * Hide a snackbar element
   * @param snackbarEl - The snackbar element to hide
   */
  hideSnackbar(snackbarEl: HTMLElement): void
  
  /**
   * Get background color for snackbar
   * @param color - The snackbar color theme
   */
  getBackgroundColor(color: SnackbarColor): string
  
  /**
   * Create SVG icon string for snackbar
   * @param icon - The icon component
   * @param color - The icon color
   */
  createIconSvg(icon: Component, color: string): string
}

/**
 * Color mapping for snackbar icons
 */
export type SnackbarColorMap = Record<SnackbarColor, string>

/**
 * Default color values for each snackbar type
 */
export const SNACKBAR_COLORS: SnackbarColorMap = {
  success: '#256029',
  error: '#B00020',
  warning: '#856404',
  info: '#0C5460'
} as const
