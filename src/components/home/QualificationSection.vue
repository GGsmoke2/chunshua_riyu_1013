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
          class="qualification-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
          @click="openImage(qual.image)"
        >
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
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.qualification-section {
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
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

.qualifications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
}

.qualification-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  opacity: 0;
  animation: slideUp 0.6s ease-out forwards;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

    .card-overlay {
      opacity: 1;
    }
  }
}

.card-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 75%;
  background: #f7fafc;
  overflow: hidden;

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 20px;
    transition: transform 0.3s ease;
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;

  i {
    font-size: 3rem;
    color: white;
  }
}

.card-title {
  padding: 20px;
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  color: #2d3748;
  border-top: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f7fafc 100%);

  @media (max-width: 767px) {
    padding: 15px;
    font-size: 0.95rem;
  }
}

.image-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.9);
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
  max-width: 90%;
  max-height: 90%;
  animation: zoomIn 0.3s ease;

  img {
    max-width: 100%;
    max-height: 90vh;
    object-fit: contain;
    border-radius: 8px;
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
  top: -40px;
  right: 0;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: rotate(90deg);
  }
}
</style>
