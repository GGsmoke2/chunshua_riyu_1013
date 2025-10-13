<template>
  <div class="about-page">
    <div class="container">
      <div class="page-header">
        <h1>关于我们</h1>
      </div>
      
      <div class="about-content">
        <div class="header-section">
          <div class="app-logo">
            <img :src="appConfig.appInfo.logo" :alt="appConfig.appInfo.name" class="logo-image">
          </div>
          <h2 class="app-name">{{ appConfig.appInfo.name }}</h2>
        </div>
        
        <div class="info-section">
          <div class="info-item">
            <label>版本信息:</label>
            <span class="info-value">V{{ appConfig.appInfo.version }}</span>
          </div>
          
          <div class="info-item">
            <label>官服邮箱:</label>
            <span class="info-value">{{ appConfig.contact.email }}</span>
          </div>
          
          <div class="info-item">
            <label>官服微信:</label>
            <div class="wechat-section">
              <div class="qr-container" @click="showFullScreenImage">
                <img 
                  :src="appConfig.contact.wechat.qrCode" 
                  alt="客服微信二维码" 
                  class="qr-code"
                  @error="handleImageError"
                >
                <p class="qr-tip">{{ appConfig.contact.wechat.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { APP_CONFIG } from '../config/app-config'

// 使用配置
const appConfig = APP_CONFIG

// 显示全屏图片
const showFullScreenImage = () => {
  // 创建一个新的图片元素用于预览
  const img = new Image()
  img.src = appConfig.contact.wechat.qrCode
  
  img.onload = () => {
    // 创建预览容器
    const overlay = document.createElement('div')
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      cursor: pointer;
    `
    
    const previewImg = document.createElement('img')
    previewImg.src = appConfig.contact.wechat.qrCode
    previewImg.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      border-radius: 8px;
    `
    
    overlay.appendChild(previewImg)
    document.body.appendChild(overlay)
    
    // 点击关闭
    overlay.onclick = () => {
      document.body.removeChild(overlay)
    }
    
    // ESC键关闭
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay)
        document.removeEventListener('keydown', handleKeydown)
      }
    }
    document.addEventListener('keydown', handleKeydown)
  }
  
  img.onerror = () => {
    ElMessage.error('图片加载失败，请稍后再试')
  }
}

// 处理图片加载错误
const handleImageError = () => {
  ElMessage.error('二维码图片加载失败')
}
</script>

<style lang="scss" scoped>
.about-page {
  padding: var(--spacing-xl) 0;
  background-color: var(--background-color);
  min-height: calc(100vh - 60px);
}

.page-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  
  h1 {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
    }
  }
}

.about-content {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  max-width: 600px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    margin: 0 var(--spacing-md);
  }
}

.header-section {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  
  .app-logo {
    margin-bottom: var(--spacing-md);
    
    .logo-image {
      width: 80px;
      height: 80px;
      border-radius: 16px;
      box-shadow: var(--shadow-sm);
      
      @media (max-width: 768px) {
        width: 60px;
        height: 60px;
      }
    }
  }
  
  .app-name {
    font-size: 1.8rem;
    color: var(--primary-color);
    margin: 0;
    font-weight: 600;
    
    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
  }
}

.info-section {
  .info-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: var(--spacing-lg);
    
    &:last-child {
      margin-bottom: 0;
    }
    
    label {
      min-width: 100px;
      color: var(--text-light);
      font-weight: 500;
      margin-right: var(--spacing-md);
      
      @media (max-width: 768px) {
        min-width: 80px;
        font-size: 0.9rem;
      }
    }
    
    .info-value {
      color: var(--text-color);
      font-size: 1.1rem;
      
      @media (max-width: 768px) {
        font-size: 1rem;
      }
    }
  }
}

.wechat-section {
  flex: 1;
}

.qr-container {
  display: inline-block;
  cursor: pointer;
  transition: transform var(--transition-fast);
  
  &:hover {
    transform: scale(1.02);
  }
  
  .qr-code {
    width: 200px;
    height: 200px;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    transition: box-shadow var(--transition-fast);
    
    @media (max-width: 768px) {
      width: 150px;
      height: 150px;
    }
    
    &:hover {
      box-shadow: var(--shadow-md);
    }
  }
  
  .qr-tip {
    margin-top: var(--spacing-sm);
    color: var(--text-light);
    font-size: 0.9rem;
    text-align: center;
    
    @media (max-width: 768px) {
      font-size: 0.8rem;
    }
  }
}

// 移动端优化
@media (max-width: 768px) {
  .about-page {
    padding: var(--spacing-lg) 0;
  }
  
  .info-section {
    .info-item {
      flex-direction: column;
      align-items: flex-start;
      
      label {
        margin-bottom: var(--spacing-xs);
        margin-right: 0;
      }
    }
  }
  
  .wechat-section {
    width: 100%;
    
    .qr-container {
      display: block;
      text-align: center;
    }
  }
}
</style>