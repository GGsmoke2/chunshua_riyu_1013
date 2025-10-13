<template>
  <div class="auth-page">
    <div class="auth-container">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label>手机号</label>
          <div class="phone-input">
            <div class="area-code" @click="showAreaCodeSelect = true">
              <span>+{{ areaCode }}</span>
              <i class="ri-arrow-down-s-line"></i>
            </div>
            <input 
              type="tel" 
              v-model="loginForm.phone"
              @blur="validatePhoneInput"
              required 
              placeholder="请输入手机号"
              maxlength="15"
              @input="onPhoneInput"
            >
          </div>
          <div v-if="phoneError" class="error-message">{{ phoneError }}</div>
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="loginForm.password"
              required
              placeholder="请输入密码"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'ri-eye-line' : 'ri-eye-off-line'"></i>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <label class="remember-me">
            <input type="checkbox" v-model="loginForm.remember">
            <span>记住我</span>
          </label>
        </div>

        <button type="submit" class="btn-submit" :disabled="isSubmitting">
          {{ isSubmitting ? '登录中...' : '登录' }}
        </button>

                  <!-- 添加用户协议checkbox -->
          <div class="form-group">
            <label class="agreement">
              <input type="checkbox" v-model="loginForm.agreement">
              <span>我已阅读并同意<a href="#" @click.prevent="showTerms">用户协议</a>和<a href="#" @click.prevent="showPrivacy">隐私协议</a></span>
            </label>
          </div>

        <div class="auth-links">
          还没有账号？
          <router-link to="/auth/register">立即注册</router-link>
        </div>

        <div v-if="shouldShowDownloadButton" class="download-app">
          <button type="button" class="btn-download" @click="showDownloadDialog = true">
            <i class="ri-smartphone-line"></i>
            下载手机APP
          </button>
        </div>
      </form>
    </div>

    <!-- Area Code Select Dialog -->
    <el-dialog
      v-model="showAreaCodeSelect"
      title="选择区号"
      width="360px"
      center
      :show-close="false"
      class="area-code-dialog"
    >
      <div class="area-code-list">
        <div 
          v-for="code in areaCodes" 
          :key="code.code"
          class="area-code-item"
          @click="() => { areaCode = code.code; showAreaCodeSelect = false; }"
        >
          <span class="country">{{ code.country }}</span>
          <span class="code">+{{ code.code }}</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showAreaCodeSelect = false">取消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Download Dialog -->
    <el-dialog
      v-model="showDownloadDialog"
      title="下载纯刷日语APP"
      width="360px"
      center
      :show-close="false"
      class="download-dialog"
    >
      <div class="download-options">
       <div class="download-option">
          <h4>安卓</h4>
          <img 
            src="https://www.co-victory.com.cn/cs_res/csry_web/csry_android.png" 
            alt="Android版二维码" 
            class="qr-code"
          >
        </div>
        <div class="download-option">
          <h4>苹果</h4>
          <img 
            src="https://www.co-victory.com.cn/cs_res/csry_web/csry_ios.png" 
            alt="iOS版二维码" 
            class="qr-code"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDownloadDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
    <!-- 个人信息保护政策弹窗 -->
    <el-dialog
      v-model="showAgreementDialog"
      :title="agreementData.title"
      width="400px"
      center
      :show-close="false"
      class="el-dialog el-dialog--center agreement-dialog"
    >
      <div class="agreement-content" v-html="agreementData.message"></div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleAgreementRefuse">{{ agreementData.buttonRefuse }}</el-button>
          <el-button type="primary" @click="handleAgreementAccept">{{ agreementData.buttonAccept }}</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../../stores/auth'
import { API_ENDPOINTS } from '../../config/api'
import { validatePhone, getPhoneError } from '../../utils/validation'
import { useResponsive } from '../../utils/responsive'
import { showMobileToast } from '../../utils/toast'
import { Capacitor } from '@capacitor/core'
import md5 from 'md5'
import { trackEvent, EVENT_TYPES } from '../../utils/eventTracking'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { isMobile } = useResponsive()

const showPassword = ref(false)
const showDownloadDialog = ref(false)
const showAreaCodeSelect = ref(false)
const isSubmitting = ref(false)
const areaCode = ref('86')
const phoneError = ref('')
const showAgreementDialog = ref(false)

const loginForm = ref({
  phone: '',
  password: '',
  remember: false,
  agreement: false  // 添加协议同意状态
})

// 个人信息保护政策数据
const agreementData = {
  title: "个人信息保护政策",
  message: `　　欢迎您使用纯刷日语!我们对每一位用户的隐私权采取高度尊重且保护的态度。<br> 
 1.为了更好的提供课程推荐、学习相关课程等相关服务，协助您排查使用过程中遇到的问题，我们会根据您在使用过程中的具体功能需要，申请必要的用户信息，如设备信息、存储、应用列表等相关权限。<br>2.您可以通过阅读<a href="https://www.dlmy.tech/termsofuse.html" target="_blank">《服务使用协议》 </a>和<a href="https://www.dlmy.tech/PrivacyPolicy.html" target="_blank">《隐私政策》</a>，了解我们申请使用相关权限的情况，以及对您个人隐私的保护措施。<br> 
 如果您点击"同意"则视为您同意《隐私政策》和《服务协议》的全部内容`,
  buttonAccept: "同意并接受",
  buttonRefuse: "暂不同意"
}

const handleLogin = async () => {
  try {
    // 验证手机号
    if (!validatePhone(loginForm.value.phone)) {
      phoneError.value = getPhoneError(loginForm.value.phone)
      return
    }
    
    // 检查是否同意用户协议
    if (!loginForm.value.agreement) {
      showAgreementDialog.value = true
      return
    }
    
    isSubmitting.value = true
    const pwKey = "chunshualiguan"
    const encryptedPassword = md5(loginForm.value.password + pwKey)
    const phoneNumber = areaCode.value + loginForm.value.phone
    
    const response = await fetch(API_ENDPOINTS.user.loginIn, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_account: "11",
        password: encryptedPassword,
        phone_number: phoneNumber,
        device_info: "1",
        ip_address: "1",
        loginType: 2
      })
    })
    
    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(data.msg || '登录失败')
    }
    
    // Store user info in store
    authStore.login(data.data.token, data.data, phoneNumber)
    
    // Store login state if remember is checked
    if (loginForm.value.remember) {
      localStorage.setItem('rememberedLogin', JSON.stringify({
        phone: loginForm.value.phone,
        password: loginForm.value.password,
        areaCode: areaCode.value
      }))
    } else {
      localStorage.removeItem('rememberedLogin')
    }

    // Show success message for 1 second using mobile-friendly toast
    showMobileToast({
      message: '登录成功',
      type: 'success',
      duration: 1000
    })
    
    // 添加埋点 - 用户登录成功
    trackEvent(EVENT_TYPES.USER_LOGIN)
    
    // Redirect to home page after successful login
    router.push(route.query.redirect?.toString() || '/')
    
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // Check for remembered login
  const remembered = localStorage.getItem('rememberedLogin')
  if (remembered) {
    const { phone, password, areaCode: savedAreaCode } = JSON.parse(remembered)
    loginForm.value.phone = phone
    loginForm.value.password = password
    loginForm.value.remember = true
    areaCode.value = savedAreaCode
  }
})

// 检测是否应该显示下载APP按钮
const shouldShowDownloadButton = computed(() => {
  // 如果是原生app环境，不显示下载按钮
  if (Capacitor.isNativePlatform()) {
    return false
  }
  // 如果是移动设备，也不显示下载按钮
  if (isMobile()) {
    return false
  }
  // 只在桌面端显示下载按钮
  return true
})

// 处理协议同意
const handleAgreementAccept = () => {
  loginForm.value.agreement = true
  showAgreementDialog.value = false
  // 自动触发登录
  handleLogin()
}

// 在handleAgreementRefuse函数后面添加以下函数

// 处理协议拒绝
const handleAgreementRefuse = () => {
  showAgreementDialog.value = false
}

// 添加缺失的函数
const onPhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  // 只允许输入数字
  target.value = target.value.replace(/\D/g, '')
  loginForm.value.phone = target.value
  // 清除错误信息
  if (phoneError.value) {
    phoneError.value = ''
  }
}

const validatePhoneInput = () => {
  phoneError.value = getPhoneError(loginForm.value.phone)
}

// 显示用户协议
const showTerms = () => {
  window.open('https://www.dlmy.tech/termsofuse.html', '_blank')
}

// 在showPrivacy函数后面添加以下代码

// 显示隐私政策
const showPrivacy = () => {
  window.open('https://www.dlmy.tech/PrivacyPolicy.html', '_blank')
}

// 添加区号数据
const areaCodes = [
  { country: '中国', code: '86' },
  { country: '日本', code: '81' },
  { country: '韩国', code: '82' },
  { country: '中国香港', code: '852' },
  { country: '中国澳门', code: '853' },
  { country: '中国台湾', code: '886' },
  { country: '新加坡', code: '65' },
  { country: '马来西亚', code: '60' },
  { country: '泰国', code: '66' },
  { country: '越南', code: '84' },
  { country: '印度尼西亚', code: '62' },
  { country: '菲律宾', code: '63' },
  { country: '澳大利亚', code: '61' },
  { country: '新西兰', code: '64' },
  { country: '美国', code: '1' },
  { country: '加拿大', code: '1' },
  { country: '英国', code: '44' },
  { country: '法国', code: '33' },
  { country: '德国', code: '49' },
  { country: '意大利', code: '39' },
  { country: '西班牙', code: '34' },
  { country: '葡萄牙', code: '351' },
  { country: '俄罗斯', code: '7' },
  { country: '巴西', code: '55' },
  { country: '阿根廷', code: '54' },
  { country: '墨西哥', code: '52' },
  { country: '印度', code: '91' },
  { country: '巴基斯坦', code: '92' },
  { country: '孟加拉国', code: '880' },
  { country: '斯里兰卡', code: '94' },
  { country: '尼泊尔', code: '977' },
  { country: '缅甸', code: '95' },
  { country: '柬埔寨', code: '855' },
  { country: '老挝', code: '856' },
  { country: '蒙古', code: '976' },
  { country: '哈萨克斯坦', code: '7' },
  { country: '乌兹别克斯坦', code: '998' },
  { country: '土耳其', code: '90' },
  { country: '以色列', code: '972' },
  { country: '阿联酋', code: '971' },
  { country: '沙特阿拉伯', code: '966' },
  { country: '埃及', code: '20' },
  { country: '南非', code: '27' },
  { country: '荷兰', code: '31' },
  { country: '比利时', code: '32' },
  { country: '瑞典', code: '46' },
  { country: '挪威', code: '47' },
  { country: '芬兰', code: '358' },
  { country: '丹麦', code: '45' },
  { country: '瑞士', code: '41' }
]

// 添加选择区号函数
const selectAreaCode = (code: string) => {
  areaCode.value = code
  showAreaCodeSelect.value = false
}
</script>

<style lang="scss" scoped>
.auth-page {
  min-height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-md);
  background-color: var(--background-color);
}

.auth-container {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 400px;

  h2 {
    text-align: center;
    margin-bottom: var(--spacing-xl);
    font-size: 1.8rem;
    color: var(--primary-color);
  }
}

.auth-form {
  // 统一表单字段容器样式
  .form-group {
    margin-bottom: var(--spacing-lg);
    
    label {
      display: block;
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
      color: var(--text-color);
    }
    
    // 确保所有输入框容器高度一致
    .phone-input,
    .password-input {
      height: 48px; // 统一高度
      border-radius: 4px;
      transition: border-color var(--transition-fast);
    }
  }
  
  .phone-input {
    display: flex;
    gap: 8px; // 统一间距
    width: 100%;
    box-sizing: border-box;
  
    .area-code {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 12px; // 统一内边距
      border: 1px solid var(--border-color);
      border-radius: 4px;
      cursor: pointer;
      flex-shrink: 0;
      min-width: 70px;
      max-width: 85px;
      height: 48px; // 与容器高度一致
      box-sizing: border-box;
      
      &:hover {
        border-color: var(--primary-color);
      }
  
      span {
        font-size: 0.9rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  
    input {
      flex: 1;
      height: 48px; // 与容器高度一致
      padding: 0 12px; // 统一内边距
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 1rem;
      min-width: 0;
      box-sizing: border-box;
  
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
  }
  
  .password-input {
    position: relative;
    height: 48px; // 统一高度
  
    input {
      width: 100%;
      height: 48px; // 与容器高度一致
      padding: 0 40px 0 12px; // 右侧留出图标空间
      border: 1px solid var(--border-color);
      border-radius: 4px;
      font-size: 1rem;
      box-sizing: border-box;
  
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
  
      .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        color: var(--text-light);
        cursor: pointer;
        padding: 4px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
  
        &:hover {
          color: var(--primary-color);
        }
      }
    }
  }
  
  /* 移动端优化 */
  @media (max-width: 480px) {
    .phone-input {
      gap: 6px; // 减小间距适应小屏幕
      
      .area-code {
        min-width: 60px;
        max-width: 75px;
        padding: 0 8px;
        
        span {
          font-size: 0.85rem;
        }
      }
      
      input {
        padding: 0 10px;
        font-size: 0.9rem;
      }
    }
    
    .password-input {
      input {
        padding: 0 35px 0 10px;
        font-size: 0.9rem;
      }
      
      .toggle-password {
        right: 8px;
        width: 20px;
        height: 20px;
      }
    }
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  font-size: 0.9rem;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 5px;
    cursor: pointer;

    input {
      cursor: pointer;
    }
  }

  .forgot-password {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.btn-submit {
  width: 100%;
  padding: 12px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition-fast);

  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.auth-links {
  margin-top: var(--spacing-md);
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-light);

  a {
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
}

.download-app {
  margin-top: var(--spacing-xl);
  text-align: center;
}

.btn-download {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  color: var(--text-color);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  i {
    font-size: 1.2rem;
  }
}

.area-code-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .area-code-list {
    max-height: 300px;
    overflow-y: auto;
  }

  .area-code-item {
    display: flex;
    justify-content: space-between;
    padding: var(--spacing-sm) var(--spacing-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);

    &:hover {
      background-color: var(--background-color);
    }

    .country {
      font-weight: 500;
    }

    .code {
      color: var(--text-light);
    }
  }
}

.download-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .download-options {
    display: flex;
    gap: var(--spacing-lg);
    padding: var(--spacing-md) 0;
  }

  .download-option {
    flex: 1;
    text-align: center;

    h4 {
      margin-bottom: var(--spacing-sm);
      font-weight: 500;
    }

    .qr-code {
      width: 120px;
      height: 120px;
      border-radius: var(--border-radius);
    }
  }
}

.error-message {
  color: var(--error-color);
  font-size: 0.8rem;
  margin-top: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.agreement {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--text-light);
  cursor: pointer;

  a {
    color: var(--primary-color);
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.agreement-dialog {
  :deep(.el-dialog) {
    width: 400px !important;
    max-width: 400px;
    height: auto;
    min-height: 500px;
    max-height: 80vh;
  }
  
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
    padding: 20px 20px 10px 20px;
  }
  
  :deep(.el-dialog__body) {
    padding: 10px 20px 20px 20px;
    max-height: 60vh;
    overflow-y: auto;
  }
  
  :deep(.el-dialog__footer) {
    padding: 10px 20px 20px 20px;
  }

  .agreement-content {
    line-height: 1.6;
    color: var(--text-color);
    font-size: 14px;
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }

  .dialog-footer {
    display: flex;
    justify-content: center;
    gap: var(--spacing-md);
  }
}
</style>