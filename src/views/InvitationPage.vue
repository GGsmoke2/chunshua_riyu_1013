<script setup lang="ts">
import { ref } from 'vue'

const imageLoaded = ref(false)

const handleImageLoad = () => {
  imageLoaded.value = true
}
</script>

<template>
  <div class="invitation-page">
    <div class="invitation-container">
      <div class="invitation-card" :class="{ 'loaded': imageLoaded }">
        <img
          src="https://csry.oss-cn-beijing.aliyuncs.com/%E9%82%80%E8%AF%B7%E5%87%BD.jpg"
          alt="邀请函"
          @load="handleImageLoad"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.invitation-page {
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 767px) {
    padding: 20px 15px;
    min-height: calc(100vh - 60px);
  }
}

.invitation-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 767px) {
    max-width: 100%;
  }
}

.invitation-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  opacity: 0;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);

  &.loaded {
    opacity: 1;
    animation: fadeIn 0.8s ease-out;
  }

  @media (max-width: 767px) {
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}
</style>
