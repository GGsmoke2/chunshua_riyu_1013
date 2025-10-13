<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

interface FeatureCard {
  id: string
  title: string
  titleZh: string
  description: string
  icon: string
  gradient: string
  link: string
}

const features = ref<FeatureCard[]>([
  {
    id: 'vocabulary',
    title: '単語',
    titleZh: '词汇',
    description: '两万个词汇 六万个例句 量大的词库背起来才过瘾',
    icon: 'ri-book-open-line',
    gradient: 'linear-gradient(135deg, #0052D4 0%, #4364F7 100%)',
    link: '/vocabulary'
  },
  {
    id: 'practice',
    title: '试题练习',
    titleZh: '刷题',
    description: 'N5到N1万道真题模拟题 越刷越爽 越爽越提分',
    icon: 'ri-file-list-3-line',
    gradient: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
    link: '/practice'
  },
  {
    id: 'grammar',
    title: '文法',
    titleZh: '语法',
    description: '千条语法 从初级到高级 全覆盖 全面学习',
    icon: 'ri-pencil-ruler-2-line',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    link: '/grammar'
  }
])

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <section class="feature-cards section">
    <div class="container">
      <h2 class="section-title">纯刷日语</h2>
      <p class="section-subtitle">两万个词汇 六万个例句 万道JLPT考级真题模拟题</p>

      <div class="cards-container">
        <div
          v-for="(feature, index) in features"
          :key="feature.id"
          class="feature-card"
          :style="{ animationDelay: `${index * 0.15}s` }"
          @click="navigateTo(feature.link)"
        >
          <div class="card-background" :style="{ background: feature.gradient }"></div>
          <div class="card-inner">
            <div class="card-icon">
              <i :class="feature.icon"></i>
            </div>
            <div class="card-content">
              <h3 class="card-title">
                <span class="title-ja">{{ feature.title }}</span>
                <span class="title-zh">{{ feature.titleZh }}</span>
              </h3>
              <p class="card-description">{{ feature.description }}</p>
              <div class="card-footer">
                <span class="card-link">
                  查看详情
                  <i class="ri-arrow-right-line"></i>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.feature-cards {
  background-color: #f8f9fa;
  padding: 80px 0;

  @media (max-width: 767px) {
    padding: 60px 0;
  }
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 16px;
  color: #2d3748;

  @media (max-width: 767px) {
    font-size: 2rem;
  }
}

.section-subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 50px;

  @media (max-width: 767px) {
    font-size: 1rem;
    margin-bottom: 40px;
  }
}

.cards-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 30px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: 0;
  animation: fadeInUp 0.6s ease-out forwards;

  &:hover {
    transform: translateY(-15px) scale(1.02);

    .card-background {
      transform: scale(1.1);
    }

    .card-icon {
      animation: pulse 0.6s ease-in-out;
      transform: scale(1.1);
    }

    .card-link i {
      transform: translateX(8px);
    }
  }
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease;
  opacity: 0.95;
}

.card-inner {
  position: relative;
  z-index: 2;
  padding: 40px 30px;
  color: white;
  min-height: 320px;
  display: flex;
  flex-direction: column;

  @media (max-width: 767px) {
    padding: 35px 25px;
    min-height: 280px;
  }
}

.card-icon {
  font-size: 3.5rem;
  margin-bottom: 25px;
  transition: all 0.3s ease;
  display: inline-block;
  width: fit-content;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 767px) {
    font-size: 3rem;
    margin-bottom: 20px;
  }
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 767px) {
    font-size: 1.5rem;
  }

  .title-ja {
    font-size: 1.8rem;
    letter-spacing: 2px;

    @media (max-width: 767px) {
      font-size: 1.5rem;
    }
  }

  .title-zh {
    font-size: 1.2rem;
    opacity: 0.9;
    font-weight: 500;

    @media (max-width: 767px) {
      font-size: 1.1rem;
    }
  }
}

.card-description {
  line-height: 1.7;
  margin-bottom: 25px;
  flex: 1;
  font-size: 1rem;
  opacity: 0.95;

  @media (max-width: 767px) {
    font-size: 0.95rem;
    margin-bottom: 20px;
  }
}

.card-footer {
  margin-top: auto;
}

.card-link {
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.05rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 10px 20px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.3);
  width: fit-content;

  i {
    margin-left: 8px;
    transition: transform 0.3s ease;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}
</style>