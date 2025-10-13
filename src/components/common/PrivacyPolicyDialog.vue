<template>
  <el-dialog
    v-model="visible"
    title="个人信息保护政策"
    :width="isMobile ? '90%' : '600px'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="privacy-policy-dialog"
    :class="{ 'mobile-dialog': isMobile }"
  >
    <div class="policy-content">
      <div class="policy-text">
        <p>   欢迎您使用纯刷日语!我们对每一位用户的隐私权采取高度尊重且保护的态度。</p>
        <p>1.为了更好的提供课程推荐、学习相关课程等相关服务，协助您排查使用过程中遇到的问题，我们会根据您在使用过程中的具体功能需要，申请必要的用户信息，如设备信息、存储、应用列表等相关权限。</p>
        <p>2.您可以通过阅读<a href="https://www.dlmy.tech/termsofuse.html" target="_blank">《服务使用协议》</a>和<a href="https://www.dlmy.tech/PrivacyPolicy.html" target="_blank">《隐私政策》</a>，了解我们申请使用相关权限的情况，以及对您个人隐私的保护措施。</p>
        <p>如果您点击"同意"则视为您同意《隐私政策》和《服务协议》的全部内容</p>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          type="primary" 
          @click="handleAccept"
          :loading="loading"
          class="accept-btn"
        >
          同意并接受
        </el-button>
        <el-button 
          @click="handleReject"
          :loading="loading"
          class="reject-btn"
        >
          暂不同意
        </el-button>
      </div>
    </template>
  </el-dialog>
  
  <!-- 二次确认弹窗 -->
  <el-dialog
    v-model="showSecondDialog"
    title="确认提示"
    :width="isMobile ? '90%' : '500px'"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    class="privacy-policy-dialog"
    :class="{ 'mobile-dialog': isMobile }"
  >
    <div class="policy-content">
      <div class="policy-text">
        <p>　　进入应用前，你需先同意<a href="https://www.dlmy.tech/termsofuse.html" target="_blank">《服务协议》</a>和<a href="https://www.dlmy.tech/PrivacyPolicy.html" target="_blank">《隐私政策》</a>，否则将退出应用。</p>
      </div>
    </div>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button 
          type="primary" 
          @click="handleSecondAccept"
          :loading="loading"
          class="accept-btn"
        >
          同意并继续
        </el-button>
        <el-button 
          @click="handleSecondReject"
          :loading="loading"
          class="reject-btn"
        >
          退出应用
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElDialog, ElButton } from 'element-plus'
import { useAuthStore } from '../../stores/auth';
import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

const emit = defineEmits<{
  accepted: []
}>()

const authStore = useAuthStore()
const visible = ref(false)
const showSecondDialog = ref(false)
const loading = ref(false)

// 检测是否为移动端
const isMobile = computed(() => {
  if (typeof window === 'undefined') return false
  return window.innerWidth <= 768 || Capacitor.isNativePlatform()
})

// 显示弹窗
const show = () => {
  visible.value = true
}

// 隐藏弹窗
const hide = () => {
  visible.value = false
}

// 处理同意
const handleAccept = async () => {
  loading.value = true
  try {
    authStore.acceptPrivacyPolicy()
    console.log('Privacy policy accepted')
    hide()
    emit('accepted')
  } catch (error) {
    console.error('接受隐私政策失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理拒绝 - 显示二次确认弹窗
const handleReject = () => {
  hide()
  showSecondDialog.value = true
}

// 处理二次确认同意
const handleSecondAccept = async () => {
  loading.value = true
  try {
    authStore.acceptPrivacyPolicy()
    console.log('Privacy policy accepted after second confirmation')
    showSecondDialog.value = false
    emit('accepted')
  } catch (error) {
    console.error('接受隐私政策失败:', error)
  } finally {
    loading.value = false
  }
}

// 处理二次确认拒绝 - 退出应用
const handleSecondReject = async () => {
  try {
    authStore.rejectPrivacyPolicy()
    showSecondDialog.value = false
    
    // 如果是原生应用，退出应用
    if (Capacitor.isNativePlatform()) {
      await App.exitApp()
    } else {
      // 如果是网页，可以关闭窗口或跳转到其他页面
      window.close()
    }
  } catch (error) {
    console.error('退出应用失败:', error)
  }
}

// 暴露方法给父组件
defineExpose({
  show,
  hide
})
</script>

<style scoped>
.privacy-policy-dialog {
  .policy-content {
    max-height: 400px;
    overflow-y: auto;
    padding: 0 10px;
  }
  
  .policy-text {
    line-height: 1.6;
    color: #333;
    
    p {
      margin-bottom: 15px;
      text-align: justify;
    }
    
    a {
      color: #409eff;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  .dialog-footer {
    display: flex;
    justify-content: center; /* 改为居中对齐 */
    align-items: center;
    gap: 20px;
    padding: 0 20px;
    
    .accept-btn {
      min-width: 120px;
      flex: 0 0 auto;
    }
    
    .reject-btn {
      min-width: 120px;
      flex: 0 0 auto;
    }
  }
}

.mobile-dialog {
  .policy-content {
    max-height: 300px;
  }
  
  .dialog-footer {
    flex-direction: row; /* 改为水平排列 */
    gap: 12px; /* 减小间距适应移动端 */
    padding: 0 10px; /* 添加左右内边距防止按钮贴边 */
    
    .el-button {
      flex: 1; /* 让按钮平分宽度 */
      min-width: 0; /* 重置最小宽度 */
    }
  }
}
</style>