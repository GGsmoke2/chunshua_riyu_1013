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
          class="teacher-card"
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
@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.teacher-qualification-section {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  padding: 80px 0 100px;

  @media (max-width: 767px) {
    padding: 60px 0 80px;
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

.teachers-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 40px;
  max-width: 1000px;
  margin: 0 auto;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 85%;
  }

  @media (max-width: 480px) {
    max-width: 90%;
  }
}

.teacher-card {
  opacity: 0;
  animation: fadeInScale 0.6s ease-out forwards;
  cursor: pointer;
}

.card-frame {
  position: relative;
  padding: 20px;
  background: linear-gradient(135deg, #0052D4 0%, #4364F7 100%);
  border-radius: 20px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 24px rgba(0, 82, 212, 0.3);

  &:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: 0 16px 40px rgba(0, 82, 212, 0.4);

    .card-overlay {
      opacity: 1;
    }
  }

  @media (max-width: 767px) {
    padding: 12px;
    border-radius: 16px;
  }
}

.card-image {
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: white;

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(0, 82, 212, 0.9) 0%, rgba(67, 100, 247, 0.9) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: white;

  i {
    font-size: 3rem;
    animation: pulse 1.5s ease-in-out infinite;
  }

  span {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 1px;
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
  animation: fadeIn 0.3s ease;
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
  animation: zoomIn 0.3s ease;

  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
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
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.8rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(90deg);
  }

  @media (max-width: 767px) {
    top: -45px;
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }
}
</style>
