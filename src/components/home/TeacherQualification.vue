<script setup lang="ts">
import { ref } from 'vue'

interface Teacher {
  id: string
  image: string
}

const teachers = ref<Teacher[]>([
  {
    id: 'teacher1',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E8%AE%B2%E5%B8%88%E5%9B%BE1.jpg'
  },
  {
    id: 'teacher2',
    image: 'https://csry.oss-cn-beijing.aliyuncs.com/zz/%E8%AE%B2%E5%B8%88%E5%9B%BE2.jpg'
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
  <section class="teacher-qualification-section section">
    <div class="container">
      <h2 class="section-title">老师资质</h2>
      <p class="section-subtitle">专业师资 匠心教学</p>

      <div class="teachers-grid">
        <div
          v-for="(teacher, index) in teachers"
          :key="teacher.id"
          class="teacher-card animate-fadeInUp"
          :style="{ animationDelay: `${index * 0.15}s` }"
          @click="openImage(teacher.image)"
        >
          <div class="card-frame">
            <div class="card-image">
              <img :src="teacher.image" :alt="`讲师资质 ${index + 1}`" loading="lazy" />
              <div class="card-overlay">
                <div class="overlay-content">
                  <i class="ri-eye-line"></i>
                  <span>查看详情</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedImage" class="image-modal" @click="closeImage">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="closeImage">
          <i class="ri-close-line"></i>
        </button>
        <img :src="selectedImage" alt="老师资质证书" />
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.teacher-qualification-section {
  background: transparent;
  position: relative;
  padding: var(--spacing-xxxl) 0;

  @media (max-width: 768px) {
    padding: var(--spacing-xxl) 0;
  }
}

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-xl);
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
}

.teacher-card {
  opacity: 0;
  cursor: pointer;
}

.card-frame {
  position: relative;
  padding: var(--spacing-lg);
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-xl);
  transition: all var(--duration-normal) var(--ease-smooth);
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(178, 75, 243, 0.1), transparent);
    transition: left var(--duration-slow) var(--ease-smooth);
    z-index: 1;
  }

  &:hover {
    transform: translateY(-10px) scale(1.02);
    border-color: var(--color-neon-purple);
    box-shadow: var(--shadow-xl), 0 0 40px var(--color-neon-purple-glow);

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

.card-image {
  position: relative;
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform var(--duration-normal) var(--ease-smooth);
    filter: brightness(1.05);
  }
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(178, 75, 243, 0.2);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-smooth);
  z-index: 2;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-primary);

  i {
    font-size: 3rem;
    animation: pulse 1.5s var(--ease-smooth) infinite;
    color: var(--color-neon-purple);
    text-shadow: var(--glow-md);
  }

  span {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 1px;
    text-shadow: var(--glow-sm);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
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
  max-width: 95%;
  max-height: 95%;
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
  border: 2px solid var(--color-neon-purple);
  color: var(--color-neon-purple);
  width: 45px;
  height: 45px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.8rem;
  transition: all var(--duration-normal) var(--ease-smooth);
  box-shadow: 0 0 20px var(--color-neon-purple-glow);

  &:hover {
    background: var(--color-neon-purple);
    color: white;
    transform: rotate(90deg);
    box-shadow: 0 0 40px var(--color-neon-purple-glow);
  }

  @media (max-width: 768px) {
    top: -45px;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>
