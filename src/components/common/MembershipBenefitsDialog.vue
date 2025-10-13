<template>
  <div class="membership-benefits-dialog">
    <!-- 对话框遮罩 -->
    <div v-if="visible" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-content" @click.stop>
        <!-- 对话框头部 -->
        <div class="dialog-header">
          <h3 class="dialog-title">
            <i class="ri-vip-crown-line"></i>
           功能介绍
          </h3>
          <button class="close-btn" @click="closeDialog">
            <i class="ri-close-line"></i>
          </button>
        </div>
        
        <!-- 对话框主体内容 -->
        <div class="dialog-body">
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
        </div>
        
        <!-- 对话框底部 -->
        <div class="dialog-footer">
          <button class="btn-experience" @click="showExperienceOptions">
            <i class="ri-star-line"></i>
            立即体验
          </button>
        </div>
      </div>
    </div>
    
    <!-- 客服咨询弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showServiceDialog"
      title="功能体验咨询"
      qr-description="扫码添加客服微信了解详情"
      mobile-description=""
      dialog-class="experience-dialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MEMBERSHIP_CONFIG } from '../../config/membership-config'
import CustomerServiceDialog from './CustomerServiceDialog.vue'
import { Capacitor } from '@capacitor/core'

// Props
interface Props {
  visible: boolean
}

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// 检测是否为iOS平台
const isIOSPlatform = computed(() => Capacitor.getPlatform() === 'ios')

// 根据平台设置默认激活的标签页
// 所有平台都默认显示premium标签
const activeTab = ref('premium')
const showServiceDialog = ref(false)

// 关闭对话框
const closeDialog = () => {
  emit('update:visible', false)
}

// 显示体验选项（实际是客服咨询）
const showExperienceOptions = () => {
  showServiceDialog.value = true
}

// 根据配置动态生成图片路径
const getImageSrc = (imageName: string) => {
  if (MEMBERSHIP_CONFIG.IMAGE_SOURCE === 1) {
    // 使用本地图片
    return new URL(`../../resources/${imageName}`, import.meta.url).href
  } else {
    // 检测是否为iOS平台（iPhone或iPad）
    const isIOSPlatform = Capacitor.getPlatform() === 'ios'
    
    if (isIOSPlatform) {
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

// 权益标签页
const benefitTabs = computed(() => {
  const allTabs = [
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
  
  // 如果是iOS平台，只返回注册用户标签
  if (isIOSPlatform.value) {
    return allTabs.filter(tab => tab.id === 'basic')
  }
  
  // 其他平台返回所有标签
  // 移除iOS平台的特殊限制，让所有平台都显示完整标签
  return allTabs
})
</script>

<style lang="scss" scoped>
.membership-benefits-dialog {
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }
  
  .dialog-content {
    background: white;
    border-radius: 12px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    
    @media (min-width: 768px) {
      max-width: 800px;
    }
  }
  
  .dialog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #eee;
    
    .dialog-title {
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--primary-color);
      display: flex;
      align-items: center;
      gap: 8px;
      
      i {
        font-size: 1.4rem;
        color: #FFD700;
      }
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #999;
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f5f5;
        color: #666;
      }
    }
  }
  
  .dialog-body {
    padding: 24px;
  }
  
  .dialog-footer {
    padding: 20px 24px;
    border-top: 1px solid #eee;
    text-align: center;
  }
  
  .btn-experience {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 3px 12px rgba(76, 175, 80, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
      background: linear-gradient(135deg, #45a049, #4CAF50);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

/* 桌面端显示 */
.desktop-benefits {
  display: block;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    display: none;
  }
}

.benefits-image-container {
  text-align: center;
  
  .benefits-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

/* 移动端显示 */
.mobile-benefits {
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
}

.benefits-tabs {
  display: flex;
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 4px;
  margin-bottom: 16px;
}

.tab-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 10px 8px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.85rem;
  font-weight: 500;
  
  i {
    font-size: 1.1rem;
    margin-bottom: 2px;
  }
  
  &:hover {
    background-color: #e9ecef;
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  }
}

.tab-content {
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.tab-panel {
  padding: 16px;
  text-align: center;
  
  .benefit-image {
    width: 100%;
    height: auto;
    border-radius: 6px;
    max-width: 85%;
    
    @media (max-width: 480px) {
      max-width: 80%;
    }
  }
}

/* 响应式优化 */
@media (max-width: 480px) {
  .dialog-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }
  
  .dialog-header {
    padding: 16px 20px;
    
    .dialog-title {
      font-size: 1.1rem;
    }
  }
  
  .dialog-body {
    padding: 20px;
  }
  
  .dialog-footer {
    padding: 16px 20px;
  }
  
  .tab-btn {
    padding: 8px 6px;
    font-size: 0.75rem;
    
    i {
      font-size: 0.9rem;
    }
  }
}
</style>