<template>
  <div v-if="showSplash" class="splash-screen">
    <!-- 背景图片 -->
    <div class="splash-background">
      <img src="../../resources/SplashScreen.jpg" alt="纯刷日语App" class="splash-image" />
    </div>
    
    <!-- 跳过按钮 -->
    <button class="skip-button" @click="skipSplash">
      跳过 {{ countdown }}
    </button>
    
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { Capacitor } from '@capacitor/core'

const emit = defineEmits<{
  finished: []
}>()

const showSplash = ref(true)
const countdown = ref(4)
let countdownTimer: number | null = null

// 检测是否为移动端应用
const isMobileApp = () => {
  return Capacitor.isNativePlatform() || 
         window.innerWidth <= 768 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// 跳过开屏页面
const skipSplash = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  showSplash.value = false
  emit('finished')
}

// 开始倒计时
const startCountdown = () => {
  countdownTimer = window.setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      skipSplash()
    }
  }, 1000)
}

onMounted(() => {
  // 只在移动端显示开屏页面
  if (isMobileApp()) {
    startCountdown()
  } else {
    // 桌面端直接跳过
    showSplash.value = false
    emit('finished')
  }
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  overflow: hidden; /* 防止图片溢出 */
}

.splash-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.splash-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 改为cover填满屏幕 */
  object-position: center;
  /* 添加渐变遮罩确保按钮可见性 */
  filter: brightness(0.9);
  transition: all 0.3s ease;
}

/* 为了确保在不同屏幕比例下都能很好地显示，添加备用方案 */
@media (orientation: landscape) {
  .splash-image {
    object-fit: cover;
    object-position: center;
  }
}

@media (orientation: portrait) {
  .splash-image {
    object-fit: cover;
    object-position: center;
  }
}

/* 如果需要更精细的控制，可以根据屏幕宽高比调整 */
@media (min-aspect-ratio: 16/9) {
  .splash-image {
    object-fit: cover;
    object-position: center;
  }
}

@media (max-aspect-ratio: 4/3) {
  .splash-image {
    object-fit: cover;
    object-position: center;
  }
}

.skip-button {
  position: absolute;
  top: 50px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7); /* 增加透明度确保可见性 */
  color: white;
  border: none;
  border-radius: 25px; /* 增加圆角 */
  padding: 10px 18px; /* 增加内边距 */
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px); /* 添加背景模糊效果 */
  border: 1px solid rgba(255, 255, 255, 0.2); /* 添加边框 */
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2); /* 添加阴影 */
}

.skip-button:hover {
  background: rgba(0, 0, 0, 0.9);
  transform: translateY(-2px); /* 悬停时轻微上移 */
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.skip-button:active {
  transform: translateY(0); /* 点击时恢复位置 */
}

.countdown-display {
  position: absolute;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  z-index: 10001;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .skip-button {
    top: calc(env(safe-area-inset-top, 20px) + 30px);
    right: 15px;
    padding: 8px 15px;
    font-size: 13px;
  }
  
  .splash-image {
    /* 移动端确保图片填满屏幕 */
    object-fit: cover;
    min-height: 100vh;
    min-width: 100vw;
  }
}

/* iOS安全区域适配 */
body.ios .skip-button {
  top: calc(env(safe-area-inset-top, 44px) + 15px);
}

/* Android状态栏适配 */
body.android .skip-button {
  top: calc(env(safe-area-inset-top, 24px) + 30px);
}

/* 针对超宽屏幕的优化 */
@media (min-width: 1920px) {
  .splash-image {
    object-fit: cover;
    object-position: center;
  }
}

/* 针对高分辨率屏幕的优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .splash-image {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}
</style>
