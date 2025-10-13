import { API_ENDPOINTS } from '../config/api'
import { useAuthStore } from '../stores/auth'

// 埋点事件类型定义
export interface EventTrackingData {
  userId: number | string
  token: string
  eventRackingInfo: string
}

// 异步发送埋点数据
export async function trackEvent(eventInfo: string): Promise<void> {
  try {
    // 获取用户信息
    const authStore = useAuthStore()
    
    // 如果用户未登录，不发送埋点
    if (!authStore.isLoggedIn || !authStore.userInfo?.userId) {
      console.debug('User not logged in, skipping event tracking:', eventInfo)
      return
    }

    // 构造埋点数据
    const trackingData: EventTrackingData = {
      userId: authStore.userInfo.userId,
      token: authStore.token || '',
      eventRackingInfo: eventInfo
    }

    // 异步发送埋点数据，不阻塞主流程
    fetch(API_ENDPOINTS.user.eventTracking, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(trackingData)
    }).catch(error => {
      // 忽略埋点发送失败的错误，不影响主流程
      console.debug('Event tracking failed:', error)
    })
  } catch (error) {
    // 忽略埋点相关的任何错误，不影响主流程
    console.debug('Event tracking error:', error)
  }
}

// 预定义的事件类型
export const EVENT_TYPES = {
  'user_login': '用户登录',
  'user_logout': '用户登出',
  'page_view_courses': '课程页面访问',
  'page_view_practice': '练习页面访问',
  'page_view_vocabulary': '单词页面访问',
  'page_view_grammar': '语法页面访问',
  'practice_start': '练习开始',
  'practice_complete': '练习完成',
  'course_enroll_click': '课程报名点击'
} as const

// 页面访问事件
export function trackPageView(pageName: string): void {
  trackEvent(`页面访问_${pageName}`)
}

// 用户行为事件
export function trackUserAction(action: string, details?: Record<string, any>): void {
  const eventInfo = details ? `${action}_${JSON.stringify(details)}` : action
  trackEvent(eventInfo)
}