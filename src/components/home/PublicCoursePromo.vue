<script setup lang="ts">
</script>

<template>
  <section class="public-course-promo section">
    <div class="container">
      <h2 class="section-title">公开课预告</h2>
      <p class="section-subtitle">专业教学 免费体验</p>

      <div class="promo-images">
        <!-- 移动端显示长图 -->
        <div class="mobile-image">
          <img
            src="https://csry.oss-cn-beijing.aliyuncs.com/%E5%85%AC%E5%BC%80%E8%AF%BE%E5%AE%A3%E4%BC%A0%E5%9B%BE.png"
            alt="公开课宣传"
            loading="lazy"
          />
        </div>

        <!-- 桌面端显示短图横向排列 -->
        <div class="desktop-images">
          <div class="promo-card">
            <img
              src="https://csry.oss-cn-beijing.aliyuncs.com/G-1.jpg"
              alt="公开课 1"
              loading="lazy"
            />
          </div>
          <div class="promo-card">
            <img
              src="https://csry.oss-cn-beijing.aliyuncs.com/G-2.jpg"
              alt="公开课 2"
              loading="lazy"
            />
          </div>
          <div class="promo-card">
            <img
              src="https://csry.oss-cn-beijing.aliyuncs.com/G-3.jpg"
              alt="公开课 3"
              loading="lazy"
            />
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

.public-course-promo {
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
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
  animation: fadeInUp 0.6s ease-out;

  @media (max-width: 767px) {
    font-size: 2rem;
  }
}

.section-subtitle {
  text-align: center;
  font-size: 1.1rem;
  color: #718096;
  margin-bottom: 50px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;

  @media (max-width: 767px) {
    font-size: 1rem;
    margin-bottom: 40px;
  }
}

.promo-images {
  position: relative;
  width: 100%;
  animation: fadeInUp 0.6s ease-out 0.2s backwards;
}

.mobile-image {
  display: none;

  @media (max-width: 767px) {
    display: block;
    max-width: 90%;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }

  @media (max-width: 480px) {
    max-width: 95%;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.desktop-images {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 767px) {
    display: none;
  }
}

.promo-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: auto;
    display: block;
    transition: transform 0.3s ease;
  }

  &:hover img {
    transform: scale(1.05);
  }
}
</style>
