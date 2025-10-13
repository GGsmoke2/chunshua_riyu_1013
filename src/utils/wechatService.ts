import { Capacitor } from '@capacitor/core'
import { ElMessage } from 'element-plus'
// 更新微信插件导入
import { Wechat } from 'capacitor-wechat'

/**
 * 企业微信客服配置
 */
const WECHAT_CONFIG = {
  corpid: 'ww28faf75ca942eab8',
  url: 'https://work.weixin.qq.com/kfid/kfcd663da633f4d3112'
}

/**
 * 检测是否为移动端
 */
const isMobile = () => {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * 检测是否为APP环境
 */
const isApp = () => {
  return Capacitor.isNativePlatform()
}

/**
 * 显示客服咨询
 * 在移动端和APP环境下直接跳转企业微信，否则显示二维码
 */
export const showConsultation = () => {
  // 如果是APP环境，尝试调用原生微信客服
  if (isApp()) {
    openNativeWechatService()
    return
  }
  
  // 如果是移动端浏览器，直接跳转企业微信链接
  if (isMobile()) {
    openWechatServiceInBrowser()
    return
  }
  
  // 桌面端返回false，让组件显示二维码弹窗
  return false
}

/**
 * 在APP环境中打开原生微信客服
 */
const openNativeWechatService = async () => {
  try {
    // capacitor-wechat 插件不支持检测微信安装和打开客服
    // 直接使用 URL Scheme 方式
    await openWechatByUrlScheme()
  } catch (error) {
    console.error('打开原生微信客服失败：', error)
    fallbackToWebLink()
  }
}

const openWechatByUrlScheme = async () => {
  try {
    // 构建微信URL Scheme
    const wechatUrl = `weixin://dl/business/?t=${WECHAT_CONFIG.corpid}`
    
    if (Capacitor.getPlatform() === 'ios') {
      // iOS使用通用链接或URL Scheme
      window.location.href = wechatUrl
    } else if (Capacitor.getPlatform() === 'android') {
      // Android使用Intent
      const intent = `intent://dl/business/?t=${WECHAT_CONFIG.corpid}#Intent;scheme=weixin;package=com.tencent.mm;end`
      window.location.href = intent
    }
    
    // 延迟检查是否成功打开
    setTimeout(() => {
      // 如果页面仍然可见，说明可能没有成功打开微信
      if (!document.hidden) {
        fallbackToWebLink()
      }
    }, 2000)
  } catch (error) {
    console.error('URL Scheme打开失败：', error)
    fallbackToWebLink()
  }
}

/**
 * 在移动端浏览器中打开企业微信链接
 */
const openWechatServiceInBrowser = () => {
  try {
    // 尝试直接打开企业微信链接
    window.open(WECHAT_CONFIG.url, '_blank')
    ElMessage.success('正在跳转到企业微信客服...')
  } catch (error) {
    console.error('打开企业微信链接失败：', error)
    ElMessage.error('无法打开客服，请手动访问客服链接')
  }
}

/**
 * 降级处理：打开网页链接
 */
const fallbackToWebLink = () => {
  ElMessage({
    message: '无法打开微信客服，正在跳转到网页版...',
    type: 'warning'
  })
  window.open(WECHAT_CONFIG.url, '_blank')
}

/**
 * 获取客服按钮文本
 */
export const getConsultationButtonText = () => {
  if (isApp() || isMobile()) {
    return '联系客服'
  }
  return '扫码咨询'
}

/**
 * 检查是否应该显示二维码弹窗
 */
export const shouldShowQRDialog = () => {
    // 移动端还是APP环境不显示二维码
  // return !isApp() && !isMobile()
  // 始终显示二维码，无论是桌面端、移动端还是APP环境
  return true
}