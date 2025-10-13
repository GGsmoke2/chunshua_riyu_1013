<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToVocabulary = () => {
  router.push('/vocabulary')
}

const goToPractice = () => {
  router.push('/practice')
}

const goToGrammar = () => {
  router.push('/grammar')
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
          <div class="feature-button" @click="goToVocabulary">
            <div class="feature-icon">
              <i class="ri-book-open-line"></i>
            </div>
            <div class="feature-info">
              <h3 class="feature-title">単語 <span class="feature-title-cn">词汇</span></h3>
              <p class="feature-desc">两万个词汇 六万个例句<br>量大的词库背起来才过瘾</p>
            </div>
          </div>

          <div class="feature-button" @click="goToPractice">
            <div class="feature-icon">
              <i class="ri-edit-box-line"></i>
            </div>
            <div class="feature-info">
              <h3 class="feature-title">試題練習 <span class="feature-title-cn">刷题</span></h3>
              <p class="feature-desc">N5到N1万道真题模拟题<br>越刷越爽 越爽越提分</p>
            </div>
          </div>

          <div class="feature-button" @click="goToGrammar">
            <div class="feature-icon">
              <i class="ri-file-text-line"></i>
            </div>
            <div class="feature-info">
              <h3 class="feature-title">文法 <span class="feature-title-cn">语法</span></h3>
              <p class="feature-desc">千条语法 从初级到高级<br>全覆盖 全面学习</p>
            </div>
          </div>
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
  min-height: 650px;
  overflow: hidden;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #dbeafe 100%);
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    min-height: 550px;
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
  filter: blur(100px);
  opacity: 0.3;
  animation: float 8s ease-in-out infinite;

  &.orb-1 {
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, #bfdbfe 0%, transparent 70%);
    top: -150px;
    left: -150px;
    animation-delay: 0s;
  }

  &.orb-2 {
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, #93c5fd 0%, transparent 70%);
    bottom: -100px;
    right: -100px;
    animation-delay: 2s;
  }

  &.orb-3 {
    width: 450px;
    height: 450px;
    background: radial-gradient(circle, #ddd6fe 0%, transparent 70%);
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
  font-size: 3.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 40px 0;
  line-height: 1.2;
  animation: fadeInUp 1s ease-out;

  @media (max-width: 1024px) {
    font-size: 2.8rem;
  }

  @media (max-width: 767px) {
    font-size: 2rem;
    margin-bottom: 30px;
  }

  @media (max-width: 480px) {
    font-size: 1.6rem;
  }

  .highlight-text {
    background: linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%);
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
      background: linear-gradient(90deg, #0ea5e9 0%, #3b82f6 100%);
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
    color: #475569;
    font-size: 1.2rem;
    line-height: 1.8;
    margin: 10px 0;
    font-weight: 400;

    @media (max-width: 767px) {
      font-size: 1.05rem;
      line-height: 1.7;
    }

    @media (max-width: 480px) {
      font-size: 0.95rem;
    }
  }
}

.hero-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  max-width: 1100px;
  margin: 0 auto;
  animation: fadeInUp 1s ease-out 0.4s backwards;

  @media (max-width: 1024px) {
    gap: 20px;
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 16px;
    max-width: 500px;
  }
}

.feature-button {
  background: white;
  border-radius: 16px;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  border: 2px solid transparent;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: 767px) {
    padding: 20px;
    flex-direction: row;
    text-align: left;
  }

  &:nth-child(1) {
    border-color: #dbeafe;

    &:hover {
      border-color: #3b82f6;
      box-shadow: 0 12px 24px rgba(59, 130, 246, 0.2);
    }

    .feature-icon {
      background: linear-gradient(135deg, #3b82f6 0%, #0ea5e9 100%);
    }
  }

  &:nth-child(2) {
    border-color: #fce7f3;

    &:hover {
      border-color: #ec4899;
      box-shadow: 0 12px 24px rgba(236, 72, 153, 0.2);
    }

    .feature-icon {
      background: linear-gradient(135deg, #ec4899 0%, #f97316 100%);
    }
  }

  &:nth-child(3) {
    border-color: #e0e7ff;

    &:hover {
      border-color: #8b5cf6;
      box-shadow: 0 12px 24px rgba(139, 92, 246, 0.2);
    }

    .feature-icon {
      background: linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%);
    }
  }
}

.feature-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  flex-shrink: 0;

  i {
    font-size: 2rem;
    color: white;
  }

  @media (max-width: 767px) {
    width: 50px;
    height: 50px;
    margin-bottom: 0;
    margin-right: 16px;

    i {
      font-size: 1.5rem;
    }
  }
}

.feature-info {
  flex: 1;
}

.feature-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 8px 0;

  @media (max-width: 767px) {
    font-size: 1.15rem;
    margin-bottom: 4px;
  }

  .feature-title-cn {
    font-size: 1.1rem;
    font-weight: 600;
    color: #64748b;
    margin-left: 8px;

    @media (max-width: 767px) {
      font-size: 1rem;
    }
  }
}

.feature-desc {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.6;
  margin: 0;

  @media (max-width: 767px) {
    font-size: 0.85rem;
    line-height: 1.5;
  }
}
</style>