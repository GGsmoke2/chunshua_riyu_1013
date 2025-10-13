import { ElMessage } from 'element-plus'
import { Capacitor } from '@capacitor/core'

interface ToastOptions {
  message: string
  type?: 'success' | 'warning' | 'info' | 'error'
  duration?: number
  showClose?: boolean
  customClass?: string
}

/**
 * 显示移动端友好的 Toast 提示
 * @param options Toast配置选项
 */
export const showMobileToast = (options: ToastOptions | string, type: 'success' | 'warning' | 'info' | 'error' = 'info', duration: number = 2000) => {
  const isMobile = window.innerWidth <= 768 || Capacitor.isNativePlatform()
  
  // 支持两种调用方式：对象参数和单独参数
  if (typeof options === 'string') {
    // 旧的调用方式：showMobileToast(message, type, duration)
    ElMessage({
      message: options,
      type,
      duration,
      showClose: false,
      customClass: isMobile ? 'mobile-toast-bottom' : ''
    })
  } else {
    // 新的调用方式：showMobileToast({ message, type, ... })
    const { message, type: msgType = 'info', duration: msgDuration = 2000, showClose = false, customClass } = options
    
    ElMessage({
      message,
      type: msgType,
      duration: msgDuration,
      showClose,
      customClass: customClass || (isMobile ? 'mobile-toast-bottom' : '')
    })
  }
}