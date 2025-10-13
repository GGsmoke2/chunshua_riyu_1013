<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { Capacitor } from '@capacitor/core'
import HeroBanner from '../components/home/HeroBanner.vue'
import FeatureCards from '../components/home/FeatureCards.vue'
import MembershipBenefits from '../components/home/MembershipBenefits.vue'
import CourseGallery from '../components/home/CourseGallery.vue'
import TeacherCards from '../components/home/TeacherCards.vue'
// DrawingFAB 已移动到 MainLayout.vue 中

const authStore = useAuthStore()
const email = ref('')
const isSubmitting = ref(false)

// 检测是否为移动设备或Capacitor环境
const isMobileOrApp = () => {
  // 检测是否为Capacitor环境（打包成移动应用）
  const isCapacitorApp = Capacitor.isNativePlatform()
  // 检测是否为移动设备
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  return isCapacitorApp || isMobile
}

// 添加响应式变量来控制显示
const showTeachersAndTestimonials = ref(!isMobileOrApp())

// 控制会员权益模块显示：当isPaid < 2时显示，iOS平台不显示
const showMembershipBenefits = computed(() => {
  const isPaid = authStore.userInfo?.isPaid || 0
  // 检测是否为iOS平台
  const isIOSPlatform = Capacitor.getPlatform() === 'ios'
  // 在iOS平台上不显示会员权益模块，其他平台按照原有逻辑
  return !isIOSPlatform && isPaid < 2
})

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// 检测是否为iOS设备
const isIOSDevice = () => {
  const platform = Capacitor.getPlatform()
  return platform === 'ios' || /iPad|iPhone|iPod/.test(navigator.userAgent)
}

// 控制课程展示显示
const showCourseGallery = computed(() => {
  return !isIOSDevice()
})

</script>

<template>
  <div class="home-page"></div>
    <HeroBanner />
    <MembershipBenefits v-if="showMembershipBenefits" />
    <FeatureCards />
    <!-- 在iOS设备上不显示课程展示 -->
    <CourseGallery v-if="showCourseGallery" />
    <TeacherCards v-if="showTeachersAndTestimonials" />

    <section class="testimonials section" v-if="showTeachersAndTestimonials">
      <div class="container">
        <h2 class="section-title">学员评价</h2>
        <p class="section-subtitle">来看看我们的学员是如何评价纯刷日语的</p >
        
        <div class="testimonials-container">
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="testimonial-avatar">
                <img src="https://www.co-victory.com.cn/cs_res/csry_web/s2.jpg" alt="学员1">
              </div>
              <div class="testimonial-info">
                <h4>刘薇</h4>
                <p>中国·上海</p >
                <div class="testimonial-rating">
                  <i class="ri-star-fill" v-for="n in 5" :key="n"></i>
                </div>
              </div>
            </div>
            <p class="testimonial-text">「纯题功能非常有效。手机上不间断的练习挺方便的让我能在短时间内练习大量考题。能够顺利通过N3考试，多亏了这个平台！」</p >
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="testimonial-avatar">
                <img src="https://www.co-victory.com.cn/cs_res/csry_web/s3.jpg" alt="学员2">
              </div>
              <div class="testimonial-info">
                <h4>张文明</h4>
                <p>中国·北京</p >
                <div class="testimonial-rating">
                  <i class="ri-star-fill" v-for="n in 5" :key="n"></i>
                </div>
              </div>
            </div>
            <p class="testimonial-text">「语法很全面，500多个语法满足N1学习需求，每个语法都配有3个例句。老师们也都很耐心，总是很快回复我的问题。」</p >
          </div>
          
          <div class="testimonial-card">
            <div class="testimonial-header">
              <div class="testimonial-avatar">
                <img src="https://www.co-victory.com.cn/cs_res/csry_web/s1.jpg" alt="学员3">
              </div>
              <div class="testimonial-info">
                <h4>李艺伟</h4>
                <p>中国·江苏</p >
                <div class="testimonial-rating">
                  <i class="ri-star-fill" v-for="n in 4" :key="n"></i>
                  <i class="ri-star-half-fill"></i>
                </div>
              </div>
            </div>
            <p class="testimonial-text">「练习题丰富，而且很贴近JLPT真题的风格，对考试备考帮助很大。特别是听力练习的质量很高，让我在实际考试中也能从容应对。」</p >
          </div>
        </div>
      </div>
    </section>
</template>

<style lang="scss" scoped>
.testimonials {
  background-color: var(--background-color);
  padding: var(--spacing-xxl) 0;
}

.testimonials-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-lg);
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.testimonial-card {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
}

.testimonial-header {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.testimonial-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: var(--spacing-md);
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.testimonial-info {
  h4 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 3px;
  }
  
  p {
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
}

.testimonial-rating {
  color: #FFD700;
  font-size: 0.9rem;
}

.testimonial-text {
  color: var(--text-color);
  line-height: 1.6;
  font-style: italic;
}

.newsletter {
  background-color: var(--primary-dark);
  color: white;
  padding: var(--spacing-xxl) 0;
}

.newsletter-content {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
  
  h2 {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: var(--spacing-md);
  }
  
  p {
    margin-bottom: var(--spacing-lg);
    opacity: 0.9;
  }
}

.newsletter-form {
  display: flex;
  margin-bottom: var(--spacing-md);
  
  @media (max-width: 767px) {
    flex-direction: column;
    gap: var(--spacing-sm);
  }
  
  input {
    flex: 1;
    padding: 12px 15px;
    border: none;
    border-radius: 4px 0 0 4px;
    font-size: 1rem;
    
    @media (max-width: 767px) {
      border-radius: 4px;
    }
    
    &:focus {
      outline: none;
    }

    &:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
  }
  
  .btn {
    padding: 12px 25px;
    border-radius: 0 4px 4px 0;
    
    @media (max-width: 767px) {
      border-radius: 4px;
    }

    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.privacy-note {
  font-size: 0.85rem;
  opacity: 0.7;
}
</style>