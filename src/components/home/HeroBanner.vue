<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const startLearning = () => {
  router.push('/vocabulary')
}
</script>

<template>
  <div class="hero-banner">
    <div class="hero-background">
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
    </div>

    <div class="hero-content">
      <div class="container">
        <h1 class="hero-title">
          让你上瘾的 <span class="highlight-text">日语学习工具</span>
        </h1>

        <div class="hero-description">
          <p>使用 选词成句、i+1、以终为始 等学习理论来帮助你得日语</p>
          <p>通过不断的 重复 形成肌肉记忆</p>
          <p>最重要的是 游戏化 的形式让学习日语从此不再痛苦</p>
        </div>

        <div class="hero-actions">
          <button class="cta-button" @click="startLearning">
            开启「纯刷部」
          </button>
          <a href="https://github.com/your-repo" target="_blank" class="github-link">
            <i class="ri-star-line"></i>
            Star us on GitHub
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-20px, -20px);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.8;
  }
}

.hero-banner {
  position: relative;
  min-height: 600px;
  overflow: hidden;
  background: linear-gradient(180deg, #1a1a1a 0%, #0a0a0a 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    min-height: 500px;
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

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: float 8s ease-in-out infinite;

  &.orb-1 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #8b5cf6 0%, transparent 70%);
    top: -100px;
    left: -100px;
    animation-delay: 0s;
  }

  &.orb-2 {
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
    bottom: -50px;
    right: -50px;
    animation-delay: 2s;
  }

  &.orb-3 {
    width: 350px;
    height: 350px;
    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation-delay: 4s;
  }
}

.hero-content {
  position: relative;
  z-index: 2;
  padding: 100px 20px;
  text-align: center;

  @media (max-width: 767px) {
    padding: 60px 20px;
  }
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.hero-title {
  font-size: 4rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 40px 0;
  line-height: 1.2;
  animation: fadeInUp 1s ease-out;

  @media (max-width: 1024px) {
    font-size: 3rem;
  }

  @media (max-width: 767px) {
    font-size: 2.2rem;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }

  .highlight-text {
    background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -5px;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%);
      border-radius: 2px;

      @media (max-width: 767px) {
        height: 3px;
      }
    }
  }
}

.hero-description {
  margin: 0 auto 50px;
  max-width: 800px;
  animation: fadeInUp 1s ease-out 0.2s backwards;

  @media (max-width: 767px) {
    margin-bottom: 40px;
  }

  p {
    color: #9ca3af;
    font-size: 1.25rem;
    line-height: 1.8;
    margin: 10px 0;
    font-weight: 400;

    @media (max-width: 767px) {
      font-size: 1.1rem;
      line-height: 1.7;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
}

.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 30px;
  animation: fadeInUp 1s ease-out 0.4s backwards;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 20px;
  }
}

.cta-button {
  padding: 16px 48px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 100%);
  border: 2px solid transparent;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 10px 30px rgba(99, 102, 241, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 15px 40px rgba(99, 102, 241, 0.4);
    background: linear-gradient(135deg, #7c3aed 0%, #2563eb 100%);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 767px) {
    padding: 14px 36px;
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    width: 100%;
    max-width: 300px;
  }
}

.github-link {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9ca3af;
  font-size: 1rem;
  text-decoration: none;
  transition: all 0.3s ease;

  i {
    font-size: 1.2rem;
    transition: color 0.3s ease;
  }

  &:hover {
    color: #ffffff;

    i {
      color: #fbbf24;
    }
  }

  @media (max-width: 767px) {
    font-size: 0.95rem;
  }
}
</style>