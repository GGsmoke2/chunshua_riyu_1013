<template>
  <div class="about-container">
    <div class="header">
      <img class="header-avatar" :src="appConfig.appInfo.logo" alt="纯刷日语">
      <div class="header-text">纯刷日语</div>
    </div>
    
    <div class="section">
      <!-- 注销按钮 -->
      <div class="setting-item delete-account-section">
        <button 
          class="delete-account-btn" 
          @click="showDeleteConfirm"
          :disabled="isDeleting"
        >
          <i class="ri-delete-bin-line"></i>
          {{ isDeleting ? '注销中...' : '注销账号' }}
        </button>
      </div>
      
      <div class="setting-item">
        <div class="setting-text">注销声明: </div>
        <div class="setting-value">您可通过【chun@dlmy.tech】或是【官服微信】向我们发起注销申请和查询注销进度。我们收到您的账号注销申请后将在5个工作日内完成人工审核。审核通过后，您的个人数据将被永久删除或匿名化处理。</div>
      </div>
      <div class="setting-item">
        <div class="setting-text">注销后果说明: </div>
        <div class="setting-value">注销账号后，您将无法登录并使用当前账号的所有服务，包括已购买的会员权益、虚拟资产、历史订单等。请务必提前备份重要数据。</div>
      </div>
      <div class="setting-item">
        <div class="setting-text">官服微信: </div>
        <div class="image-container">
          <img class="help-image" :src="appConfig.contact.wechat.qrCode" alt="客服微信二维码">
        </div>
      </div>
    </div>
    
    <!-- 注销确认对话框 -->
    <div v-if="showConfirmDialog" class="confirm-overlay" @click="hideDeleteConfirm">
      <div class="confirm-dialog" @click.stop>
        <div class="confirm-header">
          <h3>确认注销账号</h3>
          <button class="close-btn" @click="hideDeleteConfirm">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="confirm-content">
          <div class="warning-icon">
            <i class="ri-error-warning-line"></i>
          </div>
          <p class="warning-text">注销后您的账号信息将被全部删除，包括：</p>
          <ul class="warning-list">
            <li>个人资料和学习记录</li>
            <li>已购买的会员权益</li>
            <li>历史订单和虚拟资产</li>
            <li>所有相关数据将无法恢复</li>
          </ul>
          <p class="confirm-text">确定要注销账号吗？</p>
        </div>
        <div class="confirm-actions">
          <button class="btn btn-cancel" @click="hideDeleteConfirm">取消</button>
          <button 
            class="btn btn-danger" 
            @click="deleteAccount"
            :disabled="isDeleting"
          >
            {{ isDeleting ? '注销中...' : '确认注销' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { APP_CONFIG } from '../config/app-config'
import { API_ENDPOINTS } from '../config/api'
import { showMobileToast } from '../utils/toast'
import md5 from 'md5'

// 使用配置
const appConfig = APP_CONFIG
const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const showConfirmDialog = ref(false)
const isDeleting = ref(false)

// 显示确认对话框
const showDeleteConfirm = () => {
  showConfirmDialog.value = true
}

// 隐藏确认对话框
const hideDeleteConfirm = () => {
  showConfirmDialog.value = false
}

// 注销账号函数
const deleteAccount = async () => {
  if (!authStore.userInfo || !authStore.token) {
    showMobileToast('用户未登录', 'error')
    return
  }

  try {
    isDeleting.value = true
    
    // 使用当前用户的真实登录信息
    const userInfo = authStore.userInfo
    const pwKey = "chunshualiguan"
    
    // 获取用户的真实信息
    const phoneNumber = userInfo.phoneNumber || userInfo.userAccount || ''
    const deviceInfo = navigator.userAgent || 'Unknown Device'
    const ipAddress = '127.0.0.1' // 前端无法直接获取真实IP，使用默认值
    
    // 尝试从localStorage获取记住的密码
    let encryptedPassword = ''
    try {
      const rememberedLogin = localStorage.getItem('rememberedLogin')
      if (rememberedLogin) {
        const loginData = JSON.parse(rememberedLogin)
        if (loginData.password) {
          encryptedPassword = md5(loginData.password + pwKey)
        }
      }
    } catch (error) {
      console.warn('无法获取记住的密码:', error)
    }
    
    // 如果没有记住的密码，提示用户
    if (!encryptedPassword) {
      showMobileToast('无法获取密码信息，请重新登录后再试', 'error')
      return
    }
    
    const requestBody = {
      user_account: userInfo.userAccount,
      password: encryptedPassword,
      phone_number: phoneNumber,
      device_info: deviceInfo,
      ip_address: ipAddress,
      loginType: 2
    }

    const response = await fetch(API_ENDPOINTS.user.logOff, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.token}`
      },
      body: JSON.stringify(requestBody)
    })

    const data = await response.json()

    if (data.code === 200) {
      if (data.msg === '注销成功') {
        showMobileToast('账号注销成功', 'success')
        
        // 立即执行退出登录操作
        authStore.logout()
        
        // 清除所有可能的本地存储
        localStorage.removeItem('authState')
        localStorage.removeItem('tokenExpiresAt')
        localStorage.removeItem('rememberedLogin')
        localStorage.removeItem('privacyPolicyAccepted')
        
        // 延迟跳转到登录页面，让用户看到成功提示
        setTimeout(() => {
          router.push('/login')
        }, 1500)
      } else {
        showMobileToast(data.msg || '注销失败', 'error')
      }
    } else {
      showMobileToast(data.msg || '注销失败', 'error')
    }
  } catch (error) {
    console.error('注销失败:', error)
    showMobileToast('网络错误，注销失败', 'error')
  } finally {
    isDeleting.value = false
    hideDeleteConfirm()
  }
}
</script>

<style lang="scss" scoped>
.about-container {
  padding: var(--spacing-xl) 0;
  background-color: var(--background-color);
  min-height: calc(100vh - 60px);
}

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding: var(--spacing-lg);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin: 0 var(--spacing-lg) var(--spacing-xl) var(--spacing-lg);
  
  .header-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    margin-bottom: var(--spacing-md);
    object-fit: contain;
  }
  
  .header-text {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary-color);
  }
}

.section {
  background-color: white;
  margin: 0 var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}

.setting-item {
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .setting-text {
    display: block;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-color);
    margin-bottom: var(--spacing-sm);
  }
  
  .setting-value {
    display: block;
    font-size: 0.95rem;
    color: var(--text-light);
    line-height: 1.6;
  }
}

.image-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-md);
  
  .help-image {
    max-width: 200px;
    width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .about-container {
    padding: var(--spacing-lg) 0;
  }
  
  .header {
    margin: 0 var(--spacing-md) var(--spacing-lg) var(--spacing-md);
    padding: var(--spacing-md);
    
    .header-avatar {
      width: 60px;
      height: 60px;
    }
    
    .header-text {
      font-size: 1.3rem;
    }
  }
  
  .section {
    margin: 0 var(--spacing-md);
  }
  
  .setting-item {
    padding: var(--spacing-md);
    
    .setting-text {
      font-size: 1rem;
    }
    
    .setting-value {
      font-size: 0.9rem;
    }
  }
  
  .image-container {
    .help-image {
      max-width: 150px;
    }
  }
}

// 桌面端优化
@media (min-width: 1024px) {
  .about-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--spacing-xl);
  }
  
  .header {
    margin-bottom: var(--spacing-xl);
  }
  
  .setting-item {
    padding: var(--spacing-xl);
  }
}

// 注销按钮样式
.delete-account-section {
  text-align: center;
  border-bottom: 2px solid var(--border-color);
  
  .delete-account-btn {
    background: linear-gradient(135deg, #ff4757, #ff3742);
    color: white;
    border: none;
    border-radius: 12px;
    padding: 16px 32px;
    font-size: 1.1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    margin: 0 auto;
    min-width: 160px;
    box-shadow: 0 4px 12px rgba(255, 71, 87, 0.3);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ff3742, #ff2f3a);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 71, 87, 0.4);
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    i {
      font-size: 1.2rem;
    }
  }
}

// 确认对话框样式
.confirm-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: var(--spacing-lg);
}

.confirm-dialog {
  background: white;
  border-radius: 16px;
  max-width: 480px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.confirm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-color);
  
  h3 {
    margin: 0;
    color: var(--text-color);
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  .close-btn {
    background: none;
    border: none;
    font-size: 1.5rem;
    color: var(--text-light);
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
    
    &:hover {
      background: var(--background-color);
      color: var(--text-color);
    }
  }
}

.confirm-content {
  padding: var(--spacing-lg);
  text-align: center;
  
  .warning-icon {
    margin-bottom: var(--spacing-md);
    
    i {
      font-size: 3rem;
      color: #ff4757;
    }
  }
  
  .warning-text {
    font-size: 1.1rem;
    color: var(--text-color);
    margin-bottom: var(--spacing-md);
    font-weight: 500;
  }
  
  .warning-list {
    text-align: left;
    margin: var(--spacing-md) 0;
    padding-left: var(--spacing-lg);
    
    li {
      color: var(--text-light);
      margin-bottom: var(--spacing-xs);
      line-height: 1.5;
    }
  }
  
  .confirm-text {
    font-size: 1.1rem;
    color: var(--text-color);
    font-weight: 600;
    margin-top: var(--spacing-lg);
    margin-bottom: 0;
  }
}

.confirm-actions {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  
  .btn {
    flex: 1;
    padding: 14px 24px;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
    
    &.btn-cancel {
      background: var(--background-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      
      &:hover {
        background: var(--border-color);
      }
    }
    
    &.btn-danger {
      background: linear-gradient(135deg, #ff4757, #ff3742);
      color: white;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #ff3742, #ff2f3a);
      }
      
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .delete-account-section {
    .delete-account-btn {
      padding: 14px 28px;
      font-size: 1rem;
      min-width: 140px;
    }
  }
  
  .confirm-overlay {
    padding: var(--spacing-md);
  }
  
  .confirm-dialog {
    max-height: 90vh;
  }
  
  .confirm-header {
    padding: var(--spacing-md);
    
    h3 {
      font-size: 1.2rem;
    }
  }
  
  .confirm-content {
    padding: var(--spacing-md);
    
    .warning-icon i {
      font-size: 2.5rem;
    }
    
    .warning-text {
      font-size: 1rem;
    }
    
    .warning-list {
      padding-left: var(--spacing-md);
      
      li {
        font-size: 0.9rem;
      }
    }
    
    .confirm-text {
      font-size: 1rem;
    }
  }
  
  .confirm-actions {
    padding: var(--spacing-md);
    flex-direction: column;
    
    .btn {
      padding: 12px 20px;
      font-size: 0.95rem;
    }
  }
}

// 平板端适配
@media (min-width: 769px) and (max-width: 1024px) {
  .delete-account-section {
    .delete-account-btn {
      padding: 15px 30px;
      font-size: 1.05rem;
    }
  }
}
</style>