<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import MainLayout from './layouts/MainLayout.vue'
import SplashScreen from './components/common/SplashScreen.vue'
import PrivacyPolicyDialog from './components/common/PrivacyPolicyDialog.vue'
import { useAuthStore } from './stores/auth'
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const showSplash = ref(false)
const showMainApp = ref(false)
const privacyDialogRef = ref()
const route = useRoute()
const router = useRouter()

// 记录上次返回按钮点击时间
let lastBackPress = 0
const BACK_PRESS_INTERVAL = 2000 // 2秒内再次点击退出

// 检测是否为移动端应用
const isMobileApp = () => {
  return Capacitor.isNativePlatform() ||
         window.innerWidth <= 768 ||
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 检测是否为纯网页环境（非移动应用）
const isWebOnly = () => {
  return !Capacitor.isNativePlatform() &&
         !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 处理返回按钮
const handleBackButton = async () => {
  // 只在首页处理退出逻辑
  if (route.name === 'home') {
    const currentTime = Date.now()
    
    if (currentTime - lastBackPress < BACK_PRESS_INTERVAL) {
      // 2秒内再次点击，退出应用
      App.exitApp()
    } else {
      // 第一次点击，显示toast提示
      lastBackPress = currentTime
      ElMessage({
        message: '再按一次退出应用',
        type: 'info',
        duration: 2000,
        showClose: false,
        customClass: 'mobile-toast-bottom modern-exit-toast'
      })
    }
  } else {
    // 非首页，执行正常的返回操作
    router.back()
  }
}

// 隐私政策接受后显示开屏页面
const onPrivacyAccepted = () => {
  showSplash.value = true
}

// 开屏页面完成后显示主应用
const onSplashFinished = () => {
  showMainApp.value = true
}

// 组件挂载时检查隐私政策状态
onMounted(async () => {
  // 添加返回按钮监听器（仅在移动应用中）
  if (Capacitor.isNativePlatform()) {
    App.addListener('backButton', handleBackButton)
  }

  // 网页端直接进入主应用，跳过开屏和隐私政策弹窗
  if (isWebOnly()) {
    // 自动接受隐私政策
    if (!authStore.privacyPolicyAccepted) {
      authStore.acceptPrivacyPolicy()
    }
    // 直接显示主应用
    showMainApp.value = true
    return
  }

  // 移动端逻辑
  if (authStore.privacyPolicyAccepted) {
    // 已接受隐私政策
    if (isMobileApp()) {
      // 移动端显示开屏页面
      showSplash.value = true
    } else {
      // 桌面端直接显示主应用
      showMainApp.value = true
    }
  } else {
    // 未接受隐私政策，显示隐私政策弹窗
    console.log('Showing privacy policy dialog')
    setTimeout(() => {
      privacyDialogRef.value?.show()
    }, 100)
  }
})

// 组件卸载时移除监听器
onUnmounted(() => {
  if (Capacitor.isNativePlatform()) {
    App.removeAllListeners()
  }
})
</script>

<template>
  <!-- 隐私政策弹窗 - 最先显示 -->
  <PrivacyPolicyDialog ref="privacyDialogRef" @accepted="onPrivacyAccepted" />
  
  <!-- 开屏页面 -->
  <SplashScreen v-if="showSplash" @finished="onSplashFinished" />
  
  <!-- 主应用内容 -->
  <div v-if="showMainApp" class="main-app">
    <MainLayout>
      <RouterView />
    </MainLayout>
  </div>
</template>

<style scoped>
.main-app {
  width: 100%;
  height: 100%;
}
</style>
