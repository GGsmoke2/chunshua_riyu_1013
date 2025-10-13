<script setup lang="ts">
/**
 * 主布局组件
 * 提供应用的整体布局结构：头部、主内容区、客服组件、底部
 */
import MainHeader from './components/MainHeader.vue'
import MainFooter from './components/MainFooter.vue'
import ServiceFAB from '../components/common/ServiceFAB.vue'
import DrawingFAB from '../components/common/DrawingFAB.vue'
import { useRoute } from 'vue-router'
import { useResponsive } from '../utils/responsive'
import { Capacitor } from '@capacitor/core'
import { computed } from 'vue'

// 获取当前路由信息
const route = useRoute()

// 获取响应式工具函数
const { isMobile } = useResponsive()

// 检测是否为原生应用环境
const isNativeApp = Capacitor.isNativePlatform()

// 计算是否应该显示Footer
const shouldShowFooter = computed(() => {
  // 只在首页显示
  if (route.name !== 'home') return false
  
  // 在移动设备或原生应用中不显示Footer
  if (isMobile() || isNativeApp) return false
  
  return true
})
</script>

<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <MainHeader />
    
    <!-- 主内容区域 -->
    <main class="main-content">
      <!-- 插槽：用于显示页面内容 -->
      <slot></slot>
    </main>
    
    <!-- 悬浮客服按钮 -->
    <ServiceFAB />
    
    <!-- 绘制功能按钮 -->
    <DrawingFAB />
    
    <!-- 底部信息 - 只在桌面端首页显示 -->
    <MainFooter v-if="shouldShowFooter" />
  </div>
</template>

<style lang="scss" scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  background-color: var(--background-color);
  
  // 底部安全区域适配
  padding-bottom: env(safe-area-inset-bottom, 0px);
  
  // 桌面端
  @media (min-width: 769px) {
    padding-top: 60px; // 只需要头部高度
  }
  
  // 移动端 - 移除多余的padding
  @media (max-width: 768px) {
    padding-top: 60px; // 仅保留头部高度，移除env(safe-area-inset-top)
  }
  
  // 原生应用环境
  body.capacitor & {
    padding-top: 60px; // 仅保留头部高度
  }
}
</style>
