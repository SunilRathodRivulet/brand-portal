import { h, type Component } from 'vue'
import { VSnackbar } from 'vuetify/components'
import SnackbarSuccess from '~/components/svg/SnackbarSuccess.vue'
import SnackbarError from '~/components/svg/SnackbarError.vue'
import SnackbarWarning from '~/components/svg/SnackbarWarning.vue'
import SnackbarInfo from '~/components/svg/SnackbarInfo.vue'
import type { SnackbarColor, SnackbarMethods } from '~/types/snackbar'
import { SNACKBAR_COLORS } from '~/types/snackbar'

export default defineNuxtPlugin((nuxtApp) => {
  const snackbar: SnackbarMethods = {
    show(message: string, icon: Component | null = null, color: SnackbarColor = 'success', timeout: number = 3000): void {
      // Create a simple snackbar element
      const snackbarEl = document.createElement('div')
      snackbarEl.style.position = 'fixed'
      snackbarEl.style.top = '16px'
      snackbarEl.style.right = '16px'
      snackbarEl.style.zIndex = '9999'
      snackbarEl.style.maxWidth = '600px'
      snackbarEl.style.pointerEvents = 'auto'
      
      // Apply snackbar styling based on color
      const colorConfig = SNACKBAR_COLORS[color] || SNACKBAR_COLORS.success
      snackbarEl.style.border = `1px solid ${colorConfig}`
      snackbarEl.style.borderLeft = `3px solid ${colorConfig}`
      snackbarEl.style.borderRadius = '8px'
      snackbarEl.style.backgroundColor = this.getBackgroundColor(color)
      snackbarEl.style.color = colorConfig
      snackbarEl.style.boxShadow = '0px 2px 6px 0px rgba(0,0,0,0.15)'
      snackbarEl.style.minHeight = '70px'
      snackbarEl.style.padding = '16px 32px 16px 16px'
      snackbarEl.style.display = 'flex'
      snackbarEl.style.alignItems = 'center'
      snackbarEl.style.fontSize = '14px'
      snackbarEl.style.fontWeight = '600'
      snackbarEl.style.lineHeight = '1.4'
      snackbarEl.style.transition = 'all 0.3s ease'
      snackbarEl.style.transform = 'translateX(100%)'
      snackbarEl.style.opacity = '0'
      
      // Create content
      const content = document.createElement('div')
      content.style.display = 'flex'
      content.style.alignItems = 'center'
      content.style.width = '100%'
      
      // Add icon if provided
      if (icon) {
        const iconEl = document.createElement('div')
        iconEl.style.marginRight = '12px'
        iconEl.style.minWidth = '32px'
        iconEl.style.display = 'flex'
        iconEl.style.alignItems = 'center'
        iconEl.style.justifyContent = 'center'
        
        // Create icon based on the component type
        const iconSvg = snackbar.createIconSvg(icon, colorConfig)
        iconEl.innerHTML = iconSvg
        
        content.appendChild(iconEl)
      }
      
      // Add message
      const messageEl = document.createElement('span')
      messageEl.textContent = message
      messageEl.style.flex = '1'
      messageEl.style.marginRight = '8px'
      content.appendChild(messageEl)
      
      // Add close button
      const closeBtn = document.createElement('button')
      closeBtn.style.background = 'none'
      closeBtn.style.border = 'none'
      closeBtn.style.cursor = 'pointer'
      closeBtn.style.padding = '4px'
      closeBtn.style.display = 'flex'
      closeBtn.style.alignItems = 'center'
      closeBtn.style.justifyContent = 'center'
      
      // Create simple close icon (X)
      const closeIcon = document.createElement('span')
      closeIcon.textContent = '×'
      closeIcon.style.fontSize = '20px'
      closeIcon.style.fontWeight = 'bold'
      closeIcon.style.color = colorConfig
      closeIcon.style.lineHeight = '1'
      closeBtn.appendChild(closeIcon)
      
      closeBtn.onclick = () => {
        this.hideSnackbar(snackbarEl)
      }
      
      content.appendChild(closeBtn)
      snackbarEl.appendChild(content)
      document.body.appendChild(snackbarEl)
      
      // Animate in
      requestAnimationFrame(() => {
        snackbarEl.style.transform = 'translateX(0)'
        snackbarEl.style.opacity = '1'
      })
      
      // Auto hide after timeout
      if (timeout > 0) {
        setTimeout(() => {
          this.hideSnackbar(snackbarEl)
        }, timeout)
      }
    },

    hideSnackbar(snackbarEl: HTMLElement): void {
      snackbarEl.style.transform = 'translateX(100%)'
      snackbarEl.style.opacity = '0'
      
      setTimeout(() => {
        if (snackbarEl.parentNode) {
          snackbarEl.parentNode.removeChild(snackbarEl)
        }
      }, 300)
    },

    getBackgroundColor(color: SnackbarColor): string {
      const colorMap = {
        success: '#E6F4EA',
        error: '#FCE8E6',
        warning: '#FFF3CD',
        info: '#D1ECF1'
      }
      return colorMap[color] || colorMap.success
    },

    createIconSvg(icon: Component, color: string): string {
      // Create SVG based on icon component name or type
      const iconName = (icon as any).name || (icon as any).__name || ''
      
      if (iconName.includes('Success')) {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.5 12L10.5 15L16.5 9M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      } else if (iconName.includes('Error')) {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      } else if (iconName.includes('Warning')) {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.9998 8.99999V13M11.9998 17H12.0098M10.6151 3.89171L2.39019 18.0983C1.93398 18.8863 1.70588 19.2803 1.73959 19.6037C1.769 19.8857 1.91677 20.142 2.14613 20.3088C2.40908 20.5 2.86435 20.5 3.77487 20.5H20.2246C21.1352 20.5 21.5904 20.5 21.8534 20.3088C22.0827 20.142 22.2305 19.8857 22.2599 19.6037C22.2936 19.2803 22.0655 18.8863 21.6093 18.0983L13.3844 3.89171C12.9299 3.10654 12.7026 2.71396 12.4061 2.58211C12.1474 2.4671 11.8521 2.4671 11.5935 2.58211C11.2969 2.71396 11.0696 3.10655 10.6151 3.89171Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      } else if (iconName.includes('Info')) {
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 16V12M12 8H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
      } else {
        // Default icon (circle)
        return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="${color}" stroke-width="2"/>
        </svg>`
      }
    },

    success(message: string, timeout: number = 3000): void {
      this.show(message, SnackbarSuccess, 'success', timeout)
    },

    error(message: string, timeout: number = 3000): void {
      this.show(message, SnackbarError, 'error', timeout)
    },

    warning(message: string, timeout: number = 3000): void {
      this.show(message, SnackbarWarning, 'warning', timeout)
    },

    info(message: string, timeout: number = 3000): void {
      this.show(message, SnackbarInfo, 'info', timeout)
    }
  }

  return {
    provide: {
      snackbar
    }
  }
})