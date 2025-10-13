<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const mainText = ref(`帮你轻松过级的纯刷题式日语工具
用「刷题锁考点」「单词复现记」「错题复盘补坑」的学习逻辑，帮你扎牢日语基础、突破考级难点——
不用死磕大段时间，持续练就能记牢知识点，轻松过考。
最重要的是靠「碎片化时间」灵活学—— 课间、排队、等车时随时刷题背词，不用专门挤时间，日语考级再也不是难题！
备考日语考级总愁没精力、没方向的同学？欢迎用「纯刷日语」！我们非常懂你想高效冲级的迫切需求！！`)

const autoPlay = ref<NodeJS.Timeout | null>(null)

const startAutoPlay = () => {
  // 可以添加自动轮播逻辑
}

const stopAutoPlay = () => {
  if (autoPlay.value) {
    clearInterval(autoPlay.value)
    autoPlay.value = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <div class="hero-banner">
    <div class="hero-background">
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
      </div>
    </div>

    <div class="hero-content">
      <div class="container">
        <div class="text-content">
          <h1 class="main-title">
            <span class="title-line" v-for="(line, index) in mainText.split('\n')" :key="index">
              {{ line }}
            </span>
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-banner {
  position: relative;
  min-height: 500px;
  overflow: hidden;
  background: linear-gradient(135deg, #0052D4 0%, #4364F7 50%, #6FB1FC 100%);

  @media (max-width: 767px) {
    min-height: 450px;
  }
}

.hero-background {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  width: 100%;
  height: 100%;

  .shape {
    position: absolute;
    opacity: 0.1;
    border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
    animation: float 6s ease-in-out infinite;

    &.shape-1 {
      width: 300px;
      height: 300px;
      background: #fff;
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    &.shape-2 {
      width: 200px;
      height: 200px;
      background: #fff;
      top: 60%;
      right: 10%;
      animation-delay: 1s;
    }

    &.shape-3 {
      width: 150px;
      height: 150px;
      background: #fff;
      top: 30%;
      right: 30%;
      animation-delay: 2s;
    }

    &.shape-4 {
      width: 250px;
      height: 250px;
      background: #fff;
      bottom: 10%;
      left: 30%;
      animation-delay: 3s;
    }

    &.shape-5 {
      width: 180px;
      height: 180px;
      background: #fff;
      top: 50%;
      left: 50%;
      animation-delay: 1.5s;
    }
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 80px 0;

  @media (max-width: 767px) {
    padding: 50px 0;
  }
}

.text-content {
  text-align: center;
  color: white;
}

.main-title {
  font-size: 1.5rem;
  line-height: 1.8;
  font-weight: 500;
  margin: 0;
  animation: slideIn 1s ease-out;

  @media (max-width: 767px) {
    font-size: 1.1rem;
    line-height: 1.7;
  }

  @media (max-width: 480px) {
    font-size: 1rem;
    line-height: 1.6;
  }

  .title-line {
    display: block;
    margin-bottom: 12px;
    opacity: 0;
    animation: slideIn 0.8s ease-out forwards;

    @media (max-width: 767px) {
      margin-bottom: 10px;
    }

    &:nth-child(1) { animation-delay: 0.1s; font-size: 2rem; font-weight: 700; margin-bottom: 20px; }
    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.3s; }
    &:nth-child(4) { animation-delay: 0.4s; }
    &:nth-child(5) { animation-delay: 0.5s; }

    @media (max-width: 767px) {
      &:nth-child(1) { font-size: 1.5rem; margin-bottom: 15px; }
    }

    @media (max-width: 480px) {
      &:nth-child(1) { font-size: 1.3rem; margin-bottom: 12px; }
    }
  }
}
</style>