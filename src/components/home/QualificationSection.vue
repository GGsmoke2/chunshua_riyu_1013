<script setup lang="ts">
import { ref } from 'vue'

interface Qualification {
  id: string
  title: string
  image: string
}

const qualifications = ref<Qualification[]>([
  {
    id: 'publishing',
    title: '出版许可',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E5%87%BA%E7%89%88%E8%AE%B8%E5%8F%AF.jpg'
  },
  {
    id: 'telecom',
    title: '增值电信业务经营许可证',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E5%A2%9E%E5%80%BC%E7%94%B5%E4%BF%A1%E4%B8%9A%E5%8A%A1%E7%BB%8F%E8%90%A5%E8%AE%B8%E5%8F%AF%E8%AF%81.png'
  },
  {
    id: 'filing',
    title: '备案',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E5%A4%87%E6%A1%88.png'
  },
  {
    id: 'broadcast',
    title: '广播电视节目制作经营',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E5%B9%BF%E6%92%AD%E7%94%B5%E8%A7%86%E8%8A%82%E7%9B%AE%E5%88%B6%E4%BD%9C%E7%BB%8F%E8%90%A5.png'
  },
  {
    id: 'software',
    title: '纯刷日语软著',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E7%BA%AF%E5%88%B7%E6%97%A5%E8%AF%AD%E8%BD%AF%E8%91%97_00.png'
  }
])

const selectedImage = ref<string | null>(null)

const openImage = (image: string) => {
  selectedImage.value = image
}

const closeImage = () => {
  selectedImage.value = null
}
</script>

<template>
  <section class="qualification-section section">
    <div class="container">
      <h2 class="section-title">行业资质</h2>
      <p class="section-subtitle">专业认证 值得信赖</p>

      <div class="qualifications-grid">
        <div
          v-for="(qual, index) in qualifications"
          :key="qual.id"
          class="qualification-card animate-fadeInUp"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="openImage(qual.image)"
        >
          <div class="card-inner">
            <div class="card-image-wrapper">
              <img :src="qual.image" :alt="qual.title" loading="lazy" />
              <div class="card-overlay">
                <i class="ri-search-line"></i>
              </div>
            </div>
            <div class="card-title">{{ qual.title }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedImage" class="image-modal" @click="closeImage">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeImage">
          <i class="ri-close-line"></i>
        </button>
        <img :src="selectedImage" alt="资质证书" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.qualification-section {
  background: transparent;
  position: relative;
  padding: var(--spacing-xxxl) 0;

  @media (max-width: 768px) {
    padding: var(--spacing-xxl) 0;
  }
}

.qualifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-md);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.qualification-card {
  position: relative;
  cursor: pointer;
  opacity: 0;
}

.card-inner {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-smooth);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent);
    transition: left var(--duration-slow) var(--ease-smooth);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-8px);
    border-color: var(--color-neon-blue);
    box-shadow: var(--shadow-lg), var(--glow-md);

    &::before {
      left: 100%;
    }

    .card-overlay {
      opacity: 1;
    }

    img {
      transform: scale(1.05);
    }
  }
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 20px;
    transition: transform var(--duration-normal) var(--ease-smooth);
    filter: brightness(1.1);
  }
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 212, 255, 0.15);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-smooth);
  z-index: 2;

  i {
    font-size: 3rem;
    color: var(--color-neon-blue);
    text-shadow: var(--glow-md);
  }
}

.card-title {
  padding: var(--spacing-lg);
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--color-text-primary);
  border-top: 1px solid var(--glass-border);
  background: rgba(0, 212, 255, 0.03);
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: var(--spacing-md);
    font-size: 0.95rem;
  }
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
  animation: fadeIn var(--duration-normal) var(--ease-smooth);
  backdrop-filter: blur(20px);
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
  animation: zoomIn var(--duration-normal) var(--ease-smooth);

  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-xl), var(--glow-lg);
  }
}

@keyframes zoomIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.close-btn {
  position: absolute;
  top: -50px;
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(10px);
  border: 2px solid var(--color-neon-blue);
  color: var(--color-neon-blue);
  width: 45px;
  height: 45px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all var(--duration-normal) var(--ease-smooth);
  box-shadow: var(--glow-md);

  &:hover {
    background: var(--color-neon-blue);
    color: white;
    transform: rotate(90deg);
    box-shadow: var(--glow-lg);
  }

  @media (max-width: 768px) {
    top: -45px;
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
  }
}
</style>
