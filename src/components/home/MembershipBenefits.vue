<template>
  <section class="membership-benefits section">
    <div class="container">
      <h2 class="section-title">功能介绍</h2>
      
      <!-- 桌面端：显示完整图片 -->
      <div class="desktop-benefits">
        <div class="benefits-image-container">
          <img 
            :src="getImageSrc('nall_.png')" 
            alt="会员权益总览" 
            class="benefits-image"
          >
        </div>
      </div>
      
      <!-- 移动端：标签页显示 -->
      <div class="mobile-benefits">
        <div class="benefits-tabs">
          <button 
            v-for="tab in benefitTabs" 
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            <i :class="tab.icon"></i>
            {{ tab.name }}
          </button>
        </div>
        
        <div class="tab-content">
          <!-- 全部权益（原高级权益） -->
          <div v-if="activeTab === 'premium'" class="tab-panel">
            <img 
              :src="getImageSrc('n1to5.png')" 
              alt="全部权益" 
              class="benefit-image"
            >
          </div>
          
          <div v-if="activeTab === 'single'" class="tab-panel">
            <img 
              :src="getImageSrc('single.png')" 
              alt="单项权益" 
              class="benefit-image"
            >
          </div>
          
          <!-- 注册用户 -->
          <div v-if="activeTab === 'basic'" class="tab-panel">
            <img 
              :src="getImageSrc('n0.png')" 
              alt="注册用户" 
              class="benefit-image"
            >
          </div>
        </div>
      </div>
      
      <div class="benefits-cta">
        <button class="btn-upgrade" @click="showQRCode = true">
          <i class="ri-vip-crown-line"></i>
          咨询客服
        </button>
      </div>
    </div>
    
    <!-- 微信咨询弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showQRCode"
      title="咨询客服"
      qr-description="扫码二维码添加客服微信"
      mobile-description=""
      dialog-class="upgrade-dialog"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { MEMBERSHIP_CONFIG } from '../../config/membership-config'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'
import { Capacitor } from '@capacitor/core'

const authStore = useAuthStore()
const activeTab = ref('premium') // 默认显示全部权益
const showQRCode = ref(false)
const showUpgradeDialog = ref(false)

// 检测是否为iOS平台
const isIOSPlatform = computed(() => {
  return Capacitor.getPlatform() === 'ios'
})

// 根据配置动态生成图片路径
const getImageSrc = (imageName: string) => {
  if (MEMBERSHIP_CONFIG.IMAGE_SOURCE === 1) {
    // 使用本地图片
    return new URL(`../../resources/${imageName}`, import.meta.url).href
  } else {
    // 使用URL图片
    if (isIOSPlatform.value) {
      // iOS和iPad使用特定的图片路径
      const urlMap_a: Record<string, string> = {
        'n0.png': 'https://www.co-victory.com.cn/cs_res/csry_web/n0_a.png',
        'single.png': 'https://www.co-victory.com.cn/cs_res/csry_web/single_a.png',
        'n1to5.png': 'https://www.co-victory.com.cn/cs_res/csry_web/n1to5_a.png',
        'nall_.png': 'https://www.co-victory.com.cn/cs_res/csry_web/nall_a.png'
      }
      return urlMap_a[imageName] || ''
    } else {
      // 安卓和网页端使用原有的图片路径
      const urlMap: Record<string, string> = {
        'n0.png': 'https://www.co-victory.com.cn/cs_res/csry_web/n0.png',
        'single.png': 'https://www.co-victory.com.cn/cs_res/csry_web/single.png',
        'n1to5.png': 'https://www.co-victory.com.cn/cs_res/csry_web/n1to5.png',
        'nall_.png': 'https://www.co-victory.com.cn/cs_res/csry_web/nall.png'
      }
      return urlMap[imageName] || ''
    }
  }
}

// 修改权益标签页顺序和名称
const benefitTabs = [
  {
    id: 'premium',
    name: '全部权益', 
    icon: 'ri-vip-crown-line'
  },
  {
    id: 'single',
    name: '单项权益',
    icon: 'ri-bookmark-line'
  },
  {
    id: 'basic',
    name: '注册用户', 
    icon: 'ri-star-line'
  }
]
</script>

<style lang="scss" scoped>
.membership-benefits {
  background: linear-gradient(135deg, #f8faff 0%, #e8f2ff 100%);
  padding: var(--spacing-xxl) 0;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
  
  &::after {
    content: '';
    display: block;
    width: 60px;
    height: 3px;
    background-color: var(--primary-color);
    margin: var(--spacing-sm) auto 0;
  }
}

.section-subtitle {
  text-align: center;
  margin-top: 10px;
  color: var(--text-light);
  margin-bottom: var(--spacing-xl);
  font-size: 1.1rem;
}

/* 桌面端显示 */
.desktop-benefits {
  display: block;
  margin-bottom: var(--spacing-xl);
  
  @media (max-width: 768px) {
    display: none;
  }
}

.benefits-image-container {
  text-align: center;
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
  
  .benefits-image {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    
    // 限制桌面端图片最大宽度
    @media (min-width: 769px) {
      max-width: 85%; // 桌面端也适当缩小
    }
  }
}

/* 移动端显示 */
.mobile-benefits {
  display: none;
  
  @media (max-width: 768px) {
    display: block;
    margin-bottom: var(--spacing-xl);
  }
}

.benefits-tabs {
  display: flex;
  background-color: white;
  border-radius: var(--border-radius);
  padding: 4px;
  margin-bottom: var(--spacing-md);
  box-shadow: var(--shadow-sm);
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 8px;
  border: none;
  border-radius: 8px;
  background: none;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;
  font-weight: 500;
  
  i {
    font-size: 1.2rem;
    margin-bottom: 2px;
  }
  
  &:hover {
    background-color: var(--background-color);
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
}

.tab-content {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.tab-panel {
  padding: var(--spacing-md);
  text-align: center;
  
  .benefit-image {
    width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    
    // 添加移动端图片大小限制
    @media (max-width: 768px) {
      max-width: 80%; // 限制最大宽度为90%
    }
    
    @media (max-width: 480px) {
      max-width: 75%; // 小屏进一步缩小到85%
    }
  }
}

// 响应式优化
@media (max-width: 480px) {
  .tab-btn {
    padding: 8px 6px; // 从10px 6px减小到8px 6px
    font-size: 0.75rem; // 从0.8rem减小到0.75rem
    
    i {
      font-size: 0.9rem; // 从1rem减小到0.9rem
    }
  }
  
  .tab-panel {
    padding: var(--spacing-sm); // 减小内边距
  }
  
  .section-title {
    font-size: 1.6rem; // 缩小标题字体
  }
  
  .section-subtitle {
    font-size: 1rem; // 缩小副标题字体
  }
}
.benefits-cta {
  text-align: center;
  margin-top: var(--spacing-xl);
}

.btn-upgrade {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #B8860B;
  border: none;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-normal);
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(255, 215, 0, 0.4);
    background: linear-gradient(135deg, #FFA500, #FF8C00);
  }
  
  i {
    font-size: 1.3rem;
  }
}

.upgrade-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .qr-container {
    text-align: center;
    padding: var(--spacing-md) 0;

    .qr-code {
      width: 200px;
      height: 200px;
      margin-bottom: var(--spacing-md);
      border-radius: var(--border-radius);
    }

    p {
      color: var(--text-color);
      margin-bottom: var(--spacing-xs);

      &.tip {
        color: var(--text-light);
        font-size: 0.9rem;
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

/* 响应式优化 */
@media (max-width: 480px) {
  .tab-btn {
    padding: 10px 6px;
    font-size: 0.8rem;
    
    i {
      font-size: 1rem;
    }
  }
  
  .tab-panel {
    padding: var(--spacing-sm);
  }
}
</style>