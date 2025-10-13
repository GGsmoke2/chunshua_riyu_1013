import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface UserInfo {
  userId: string
  userName: string
  userAccount: string
  userRole: number
  email: string | null
  isActive: number
  isPaid: number
  japaneseN1: number
  japaneseN2: number
  japaneseN3: number
  japaneseN4: number
  japaneseN5: number
  phoneNumber?: string
}

interface ReLoginUserInfo {
  isActive: number
  isPaid: number
  japaneseN1: number
  japaneseN2: number
  japaneseN3: number
  japaneseN4: number
  japaneseN5: number
}

export const useAuthStore = defineStore('auth', () => {
  // Get saved auth state from localStorage
  const getSavedState = () => {
    const savedState = localStorage.getItem('authState')
    if (!savedState) return null

    try {
      const state = JSON.parse(savedState)
      // Check if token is expired
      const expiresAt = localStorage.getItem('tokenExpiresAt')
      if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
        // Token expired, clear state
        localStorage.removeItem('authState')
        localStorage.removeItem('tokenExpiresAt')
        return null
      }
      return state
    } catch {
      return null
    }
  }

  const initialState = getSavedState()

  const isLoggedIn = ref(!!initialState)
  const token = ref(initialState?.token || '')
  const userInfo = ref<UserInfo | null>(initialState?.userInfo || null)
  const phoneNumber = ref(initialState?.phoneNumber || '')
  const isActive = ref(initialState?.isActive || 0)
  const isPaid = ref(initialState?.isPaid || 0)
  const permissions = ref({
    N5: initialState?.userInfo?.japaneseN5 === 1,
    N4: initialState?.userInfo?.japaneseN4 === 1,
    N3: initialState?.userInfo?.japaneseN3 === 1,
    N2: initialState?.userInfo?.japaneseN2 === 1,
    N1: initialState?.userInfo?.japaneseN1 === 1
  })

  const login = (tokenValue: string, user: UserInfo, phone?: string) => {
    isLoggedIn.value = true
    token.value = tokenValue
    userInfo.value = user
    if (phone) {
      phoneNumber.value = phone
      userInfo.value.phoneNumber = phone
    }
    isActive.value = user.isActive
    isPaid.value = user.isPaid
    
    permissions.value = {
      N5: !!user.japaneseN5,
      N4: !!user.japaneseN4,
      N3: !!user.japaneseN3,
      N2: !!user.japaneseN2,
      N1: !!user.japaneseN1
    }

    // Save auth state to localStorage with 3-day expiration
    const expiresAt = new Date().getTime() + (3 * 24 * 60 * 60 * 1000) // 3 days
    localStorage.setItem('tokenExpiresAt', expiresAt.toString())
    localStorage.setItem('authState', JSON.stringify({
      token: tokenValue,
      userInfo: user,
      phoneNumber: phone,
      isActive: user.isActive,
      isPaid: user.isPaid
    }))
  }

  const relogin = (user: ReLoginUserInfo) => {
    // 更新当前用户信息
    if (userInfo.value) {
      userInfo.value.isActive = user.isActive
      userInfo.value.isPaid = user.isPaid
      userInfo.value.japaneseN1 = user.japaneseN1
      userInfo.value.japaneseN2 = user.japaneseN2
      userInfo.value.japaneseN3 = user.japaneseN3
      userInfo.value.japaneseN4 = user.japaneseN4
      userInfo.value.japaneseN5 = user.japaneseN5
    }

    isLoggedIn.value = true
    isActive.value = user.isActive
    isPaid.value = user.isPaid
    
    permissions.value = {
      N5: !!user.japaneseN5,
      N4: !!user.japaneseN4,
      N3: !!user.japaneseN3,
      N2: !!user.japaneseN2,
      N1: !!user.japaneseN1
    }

    // 更新 localStorage 中的状态
    const savedState = localStorage.getItem('authState')
    if (savedState && userInfo.value) {
      try {
        const state = JSON.parse(savedState)
        state.userInfo = userInfo.value
        state.isActive = user.isActive
        state.isPaid = user.isPaid
        localStorage.setItem('authState', JSON.stringify(state))
      } catch (error) {
        console.error('Failed to update localStorage in relogin:', error)
      }
    }
  }

  const logout = () => {
    isLoggedIn.value = false
    token.value = ''
    userInfo.value = null
    phoneNumber.value = ''
    isActive.value = 0
    isPaid.value = 0
    permissions.value = {
      N5: false,
      N4: false,
      N3: false,
      N2: false,
      N1: false
    }
    localStorage.removeItem('authState')
    localStorage.removeItem('tokenExpiresAt')
  }

  const hasPermission = (level: string) => {
    return permissions.value[level as keyof typeof permissions.value]
  }

  // Check token expiration periodically
  if (typeof window !== 'undefined') {
    setInterval(() => {
      const expiresAt = localStorage.getItem('tokenExpiresAt')
      if (expiresAt && new Date().getTime() > parseInt(expiresAt)) {
        logout()
      }
    }, 60000) // Check every minute
  }

  const hasJlptAccess = (level: string) => {
    const key = `japanese${level}` as keyof typeof userInfo.value
    return userInfo.value?.[key] === 1
  }

  const canPlayAudio = (jlptLevel: string) => {
    // 首先检查基础音频权限
    if ((userInfo.value?.isPaid || 0) < 2) {
      return false
    }
    
    // 然后检查JLPT等级权限
    return hasJlptAccess(jlptLevel)
  }

  // 检查隐私政策是否已接受
  const privacyPolicyAccepted = computed(() => {
    return localStorage.getItem('privacyPolicyAccepted') === 'true'
  })

  // 接受隐私政策
  const acceptPrivacyPolicy = () => {
    // 这里可以添加接受隐私政策的逻辑
    // 比如保存到 localStorage 或发送到服务器
    localStorage.setItem('privacyPolicyAccepted', 'true')
    console.log('用户已接受隐私政策')
  }

  // 拒绝隐私政策
  const rejectPrivacyPolicy = () => {
    // 这里可以添加拒绝隐私政策的逻辑
    // 比如清除用户数据或退出应用
    localStorage.setItem('privacyPolicyAccepted', 'false')
    console.log('用户拒绝了隐私政策')
    // 可能需要执行登出操作
    logout()
  }

  return {
    isLoggedIn,
    token,
    userInfo,
    phoneNumber,
    isActive,
    isPaid,
    permissions,
    privacyPolicyAccepted, // 添加这个属性
    login,
    logout,
    hasPermission,
    relogin,
    hasJlptAccess,
    canPlayAudio,
    acceptPrivacyPolicy,
    rejectPrivacyPolicy
  }
})
