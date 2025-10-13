<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isIOSPlatform ? '' : title"
    width="360px"
    center
    :show-close="showClose"
    :class="dialogClass"
  >
    <!-- iOS平台显示合规内容 -->
    <div v-if="isIOSPlatform" class="ios-compliant-content">
      <div class="help-section">
        <i class="ri-customer-service-2-line help-icon"></i>
        <h3>意见反馈</h3>
        <div class="help-options">
          <img 
              :src="APP_CONFIG.contact.wechat.qrCode"
              alt="客服二维码" 
              class="qr-code"
            >
        </div>
        <p class="help-tip">如需更多帮助，请扫描二维码联系老师</p>
      </div>
    </div>
    
    <!-- 非iOS平台保持原有功能 -->
    <div v-else class="qr-container">
      <img 
        :src="APP_CONFIG.contact.wechat.qrCode"
        alt="客服二维码" 
        class="qr-code"
      >
      <p class="tip" v-if="tipText">{{ tipText }}</p>
      <p class="tip" v-if="showAppTip && !shouldHideAppTip()">开通会员后，手机APP也可同步使用</p>
      <p class="tip" v-if="isMobileOrApp()">也可点击下方按钮直接联系客服</p>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
        <!-- iOS平台不显示外部导流按钮 -->
        <el-button 
          v-if="!isIOSPlatform && isMobileOrApp()"
          type="primary" 
          @click="handleConsultation"
        >
          {{ getConsultationButtonText() }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { showConsultation, getConsultationButtonText } from '../../utils/wechatService'
import { Capacitor } from '@capacitor/core'
import { APP_CONFIG } from '../../config/app-config'
import { ElMessage } from 'element-plus'

interface Props {
  visible: boolean
  title?: string
  qrDescription?: string
  mobileDescription?: string
  tipText?: string
  showClose?: boolean
  showAppTip?: boolean
  dialogClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '联系客服',
  showClose: false,
  showAppTip: false,
  dialogClass: 'customer-service-dialog'
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'consultation-handled': []
}>()

// 检测是否为iOS平台
const isIOSPlatform = Capacitor.getPlatform() === 'ios'

// 检查是否为移动端或APP环境
const isMobileOrApp = () => {
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
  const isApp = Capacitor.isNativePlatform()
  return isMobile || isApp
}

// 检查是否隐藏APP提示
const shouldHideAppTip = () => {
  // 可以根据具体业务逻辑来判断是否隐藏APP提示
  return false
}

// 检测是否为iOS环境
const isIOS = () => {
  return Capacitor.getPlatform() === 'ios'
}

// 处理客服咨询
const handleConsultation = () => {
  const result = showConsultation()
  if (result !== false) {
    // 如果成功处理了咨询，关闭弹窗并触发事件
    emit('update:visible', false)
    emit('consultation-handled')
  }
}

// iOS平台的合规功能
const showFAQ = () => {
  // 跳转到FAQ页面或显示FAQ内容
  ElMessage.info('正在跳转到常见问题页面')
  // 这里可以添加路由跳转逻辑
  emit('update:visible', false)
}

const showUserGuide = () => {
  // 显示用户指南
  ElMessage.info('正在打开使用指南')
  emit('update:visible', false)
}

const showFeedback = () => {
  // 显示应用内反馈表单
  ElMessage.info('正在打开反馈页面')
  emit('update:visible', false)
}
</script>

<style lang="scss" scoped>
.qr-container {
  text-align: center;
  padding: var(--spacing-md) 0;
  
  .qr-code {
    width: 200px;
    height: 200px;
    border-radius: var(--border-radius);
    margin-bottom: var(--spacing-md);
    border: 1px solid var(--border-color);
  }
  
  p {
    margin: var(--spacing-sm) 0;
    color: var(--text-primary);
    font-size: 1rem;
    
    &.tip {
      font-size: 0.9rem;
      color: var(--text-light);
      margin: var(--spacing-xs) 0;
    }
  }
  
  .ios-notice {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    color: #1976d2;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    border: 1px solid #2196f3;
    font-weight: 500;
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

// 响应式设计
@media (max-width: 768px) {
  .qr-container .qr-code {
    width: 160px;
    height: 160px;
  }
  .ios-compliant-content {
    .help-section {
      .help-icon {
        font-size: 2.5rem; // 移动端稍小图标
      }
      
      .qr-code {
        width: 160px;
        height: 160px;
      }
    }
  }
}

.ios-compliant-content {
  text-align: center;
  padding: var(--spacing-lg) var(--spacing-md);
  
  .help-section {
    .help-icon {
      font-size: 3rem;
      color: var(--primary-color);
      margin-bottom: var(--spacing-lg); 
    }
    
    h3 {
      margin-bottom: var(--spacing-xl);
      color: var(--text-primary);
      font-size: 1.2rem;
    }
    
    // 添加二维码样式
    .qr-code {
      width: 200px;
      height: 200px;
      border-radius: var(--border-radius);
      margin: var(--spacing-md) auto;
      border: 1px solid var(--border-color);
      display: block;
    }
  }
  
  .help-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-lg);
    align-items: center; // 确保内容居中
  }
  
  .help-item {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    background-color: #f8f9fa;
    border-radius: var(--border-radius);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #e9ecef;
      transform: translateY(-1px);
    }
    
    i {
      font-size: 1.2rem;
      color: var(--primary-color);
    }
    
    span {
      font-weight: 500;
    }
  }
  
  .help-tip {
    font-size: 0.9rem;
    color: var(--text-light);
    line-height: 1.5;
  }
}
// 在响应式设计部分也需要更新
@media (max-width: 768px) {
  .qr-container .qr-code {
    width: 160px;
    height: 160px;
  }
  .ios-compliant-content {
    .help-section {
      .help-icon {
        font-size: 2.5rem;
      }
      
      .qr-code {
        width: 160px;
        height: 160px;
        margin: var(--spacing-md) auto; // 确保移动端也居中
      }
    }
  }
}
</style>