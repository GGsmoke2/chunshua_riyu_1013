<template>
  <div class="profile-page">
    <div class="container">
      <div class="profile-header">
        <div class="profile-info">
          <div class="profile-details">
            <h1>{{ authStore.userInfo?.userName }}</h1>
            <p class="user-role">{{ userRole }}</p>
          </div>
        </div>
        <div class="header-actions">
          <!-- <button v-if="!isIOSPlatform" class="btn-redeem" @click="showMembershipBenefitsDialog = true">
            <i class="ri-vip-crown-2-line"></i>
            功能介绍
          </button> -->
          <button v-if="!isIOSPlatform" class="btn-redeem" @click="showRedeemDialog = true">
            <i class="ri-coupon-line"></i>
            兑换码
          </button>
          <button class="btn-edit" @click="navigateToEdit">
            <i class="ri-edit-line"></i>
            修改密码
          </button>
        </div>
      </div>

      <div class="profile-content">
        <div class="info-section">
          <h2><i class="ri-user-3-line"></i> 基本信息</h2>
          <div class="info-grid">
            <div class="info-item">
              <label>用户账号</label>
              <span>{{ authStore.userInfo?.userAccount }}</span>
            </div>
            <div class="info-item">
              <label>手机号</label>
              <span>{{ maskedPhone }}</span>
            </div>
            <div class="info-item">
              <label>账号状态</label>
              <span :class="['status-badge', authStore.userInfo?.isActive ? 'active' : 'inactive']">
                {{ authStore.userInfo?.isActive ? '已激活' : '未激活' }}
              </span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h2 v-if="!isIOSPlatform"><i class="ri-vip-crown-2-line"></i>功能列表</h2>
          <div v-if="!isIOSPlatform" class="info-grid">
            <div class="info-item">
              <!-- <label v-if="!isIOSPlatform">会员状态</label> -->
              <div class="vip-status-container">
                <!-- 主要会员状态标签 -->
                <div class="main-status">
                  <span 
                    :class="['status-badge', 'main-badge', getMainStatusClass()]"
                    @click="handleMainStatusClick"
                  >
                    <i class="membership-icon" :class="getMembershipIcon()"></i>
                    {{ getMainStatusText() }}
                  </span>
                </div>
                        <!-- VIP功能标签 -->
                <!--
                <div class="vip-features">
                  <span 
                    :class="['feature-badge', getAudioFeatureClass()]"
                    @click="handleFeatureClick('audio')"
                  >
                    <i class="ri-volume-up-line"></i>
                    单词及例句音频VIP
                  </span>
                  <span 
                    :class="['feature-badge', getVideoFeatureClass()]"
                    @click="handleFeatureClick('video')"
                  >
                    <i class="ri-video-line"></i>
                    题目视频讲解VIP
                  </span>
                  <span 
                    :class="['feature-badge', getCourseFeatureClass()]"
                    @click="handleFeatureClick('course')"
                  >
                    <i class="ri-book-open-line"></i>
                    课件学习VIP
                  </span>
                </div>
                -->
                
                <!-- 权益层级展示 -->
                <div class="privilege-hierarchy">
                  <div class="privilege-title">
                    <i class="ri-shield-star-line"></i>
                    <span v-if="!isIOSPlatform">当前功能包含</span>
                    <span v-else style="display: inline !important; visibility: visible !important;">当前功能包含</span>
                  </div>
                  
                  <!-- 二维表格显示权益 -->
                  <div class="privilege-table">
                    <!-- 表头 - JLPT等级 -->
                    <div class="table-header">
                      <div class="privilege-name-header">功能详细</div>
                      <div 
                        v-for="level in ['N5', 'N4', 'N3', 'N2', 'N1']" 
                        :key="level"
                        :class="['level-header-cell', { 'level-unlocked': hasJlptAccess(level) }]"
                      >
                        <div class="level-badge">{{ level }}</div>
                        <div :class="['level-status', hasJlptAccess(level) ? 'unlocked' : 'locked']">
                          <i :class="hasJlptAccess(level) ? 'ri-check-line' : 'ri-lock-line'"></i>
                        </div>
                      </div>
                    </div>
                    
                    <!-- 表格内容 - 权益行 -->
                    <div class="table-body">
                      <div 
                        v-for="privilege in getPrivilegeList()" 
                        :key="privilege.id"
                        class="privilege-row"
                      >
                        <div class="privilege-name-cell">
                          <i :class="privilege.icon"></i>
                          <span>{{ privilege.name }}</span>
                        </div>
                        <div 
                          v-for="level in ['N5', 'N4', 'N3', 'N2', 'N1']" 
                          :key="level"
                          :class="['privilege-cell', getPrivilegeCellClass(privilege.id, level)]"
                        >
                          <i :class="getPrivilegeCellIcon(privilege.id, level)"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 说明文本 -->
                <!-- <div v-if="!isIOSPlatform" class="vip-description">
                  <p>{{ getDescriptionText() }}</p>
                </div> -->
              </div>
            </div>

        </div>
        <div v-if="!isIOSPlatform" class="info-section">
          <h2><i class="ri-award-line"></i> JLPT等级权限</h2>
          <div class="jlpt-grid">
            <div 
              v-for="level in ['N1', 'N2', 'N3', 'N4', 'N5']" 
              :key="level"
              :class="['jlpt-item', { 'not-activated': !hasJlptAccess(level) }]"
              @click="handleLevelClick(level)"
            >
              <div class="level-badge">{{ level }}</div>
              <div :class="['access-status', hasJlptAccess(level) ? 'has-access' : 'no-access']">
                {{ hasJlptAccess(level) ? '已开通' : '未开通' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 协议与条款模块 -->
        <div class="info-section">
          <h2><i class="ri-file-text-line"></i> 协议与条款</h2>
          <div class="agreement-grid">
            <!-- 只在非iOS平台显示付费会员服务协议 -->
            <div v-if="!isIOSPlatform" class="agreement-item" @click="navigateToAgreement">
              <div class="agreement-icon">
                <i class="ri-vip-crown-2-line"></i>
              </div>
              <div class="agreement-content">
                <h3>纯刷日语付费会员服务协议</h3>
                <p>查看付费会员服务相关条款和权益说明</p>
              </div>
              <div class="agreement-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </div>
            </div>
            
            <!-- 新增用户个人信息保护政策按钮 -->
            <div class="agreement-item" @click="navigateToPrivacyPolicy">
              <div class="agreement-icon">
                <i class="ri-shield-user-line"></i>
              </div>
              <div class="agreement-content">
                <h3>用户个人信息保护政策</h3>
                <p>查看个人信息收集、使用和保护相关政策</p>
              </div>
              <div class="agreement-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </div>
            </div>

            <!-- 新增用户服务协议按钮 -->
            <div class="agreement-item" @click="navigateToUserServiceAgreement">
              <div class="agreement-icon">
                <i class="ri-file-text-line"></i>
              </div>
              <div class="agreement-content">
                <h3>用户服务协议</h3>
                <p>查看用户服务条款和使用规范</p>
              </div>
              <div class="agreement-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </div>
            </div>

            <!-- 新增关于我们按钮 -->
            <div class="agreement-item" @click="navigateToAbout">
              <div class="agreement-icon">
                <i class="ri-information-line"></i>
              </div>
              <div class="agreement-content">
                <h3>关于我们</h3>
                <p>查看应用版本信息和联系方式</p>
              </div>
              <div class="agreement-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </div>
            </div>
            
            <!-- 新增注销账号按钮 -->
            <div class="agreement-item" @click="navigateToAccountDeletion">
              <div class="agreement-icon">
                <i class="ri-delete-bin-line"></i>
              </div>
              <div class="agreement-content">
                <h3>注销账号</h3>
                <p>查看账号注销相关说明和申请方式</p>
              </div>
              <div class="agreement-arrow">
                <i class="ri-arrow-right-s-line"></i>
              </div>
            </div>
          </div>
        </div>
        </div>
    </div>

    <!-- 会员权益说明对话框 -->
    <MembershipBenefitsDialog
      v-model:visible="showMembershipBenefitsDialog"
      @start-experience="handleStartExperience"
    />
    
    <!-- 开通会员弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showPurchaseDialog"
      title="咨询客服"
      qr-description="扫码二维码添加客服微信"
      mobile-description=""
      :show-app-tip="true"
      dialog-class="purchase-dialog"
    />

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
        <a href="/downloads/chunshua.apk" class="download-btn android">
          <i class="ri-android-line"></i>
          Android版下载
        </a>
        <a href="https://apps.apple.com/app/chunshua" target="_blank" class="download-btn ios">
          <i class="ri-apple-line"></i>
          iOS版下载
        </a>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showDownloadDialog = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Redeem Code Dialog -->
    <el-dialog
      v-model="showRedeemDialog"
      title="兑换VIP会员"
      width="360px"
      center
      :show-close="false"
      class="redeem-dialog"
    >
      <div class="redeem-form">
        <div class="form-group">
          <label>兑换码</label>
          <input 
            type="text" 
            v-model="redeemCode"
            placeholder="请输入兑换码"
            maxlength="8"
          >
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="showRedeemDialog = false">取消</el-button>
          <el-button 
            type="primary" 
            @click="handleRedeem"
            :loading="isRedeeming"
          >
            {{ isRedeeming ? '兑换中...' : '确认兑换' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { API_ENDPOINTS } from '../config/api'
import { Capacitor } from '@capacitor/core'
import CustomerServiceDialog from '../components/common/CustomerServiceDialog.vue'
import MembershipBenefitsDialog from '../components/common/MembershipBenefitsDialog.vue'

const router = useRouter()
const authStore = useAuthStore()
const showPurchaseDialog = ref(false)
const showMembershipBenefitsDialog = ref(false)
const showBenefitsDialog = ref(false)
const showDownloadDialog = ref(false)
const showRedeemDialog = ref(false)
const redeemCode = ref('')
const isRedeeming = ref(false)

// 平台检测
const isIOSPlatform = computed(() => {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'ios'
})

const userRole = computed(() => {
  return authStore.userInfo?.userRole === 0 ? '普通用户' : '教师'
})

// 修改手机号遮挡逻辑
const maskedPhone = computed(() => {
  const phone = authStore.phoneNumber || authStore.userInfo?.phoneNumber
  if (!phone) return '未设置'
  
  // 移除区号（如86, 81等）
  let cleanPhone = phone
  
  // 如果是13位号码且以86、81等开头，移除前2位区号
  if (phone.length === 13 && /^(86|81|82|65|60|91|1)/.test(phone)) {
    cleanPhone = phone.slice(2)
  }
  
  // 对于11位手机号，保留前3位和后4位，中间用xxxx遮挡
  if (cleanPhone.length === 11) {
    return cleanPhone.replace(/(\d{3})\d{4}(\d{4})/, '$1xxxx$2')
  }
  
  // 如果是其他长度，根据长度适当遮挡
  if (cleanPhone.length >= 7) {
    const start = cleanPhone.slice(0, 3)
    const end = cleanPhone.slice(-3)
    return `${start}xxxx${end}`
  }
  
  return cleanPhone
})

const maskedEmail = computed(() => {
  const email = authStore.userInfo?.email
  if (!email) return '未设置'
  const [username, domain] = email.split('@')
  if (username.length <= 4) return email
  return `${username.slice(0, 2)}****${username.slice(-2)}@${domain}`
})

// 获取权益列表
const getPrivilegeList = () => {
  return [
    { id: 0, name: '基础学习功能', icon: 'ri-book-line' },
    { id: 1, name: '完整题库访问', icon: 'ri-database-line' },
    { id: 2, name: '单词及例句音频+例句假名标注', icon: 'ri-volume-up-line' },
    { id: 3, name: '题目视频讲解', icon: 'ri-video-line' },
    { id: 4, name: '课件学习资料', icon: 'ri-file-text-line' }
  ]
}

// 获取权益单元格的样式类
const getPrivilegeCellClass = (privilegeId: number, level: string) => {
  const isPaid = authStore.userInfo?.isPaid || 0
  const hasLevelAccess = hasJlptAccess(level)
  
  // 普通用户的基础学习功能在所有等级都可用
  if (privilegeId === 0) {
    return 'cell-active'
  }
  
  // 内测用户的基础学习功能和完整题库访问在所有等级都可用
  if (isPaid === 1 && (privilegeId === 0 || privilegeId === 1)) {
    return 'cell-active'
  }
  
  const hasPrivilegeAccess = isPaid >= privilegeId
  
  if (!hasLevelAccess) {
    return 'cell-locked'
  }
  
  if (hasPrivilegeAccess) {
    return 'cell-active'
  }
  
  return 'cell-inactive'
}

// 获取权益单元格的图标
const getPrivilegeCellIcon = (privilegeId: number, level: string) => {
  const isPaid = authStore.userInfo?.isPaid || 0
  const hasLevelAccess = hasJlptAccess(level)
  
  // 普通用户的基础学习功能在所有等级都显示√
  if (privilegeId === 0) {
    return 'ri-check-line'
  }
  
  // 内测用户的基础学习功能和完整题库访问在所有等级都显示√
  if (isPaid === 1 && (privilegeId === 0 || privilegeId === 1)) {
    return 'ri-check-line'
  }
  
  const hasPrivilegeAccess = isPaid >= privilegeId
  
  if (!hasLevelAccess) {
    return 'ri-lock-line'
  }
  
  if (hasPrivilegeAccess) {
    return 'ri-check-line'
  }
  
  return 'ri-lock-line'
}


const hasJlptAccess = (level: string) => {
  const key = `japanese${level}` as keyof typeof authStore.userInfo
  return authStore.userInfo?.[key] === 1
}

const navigateToEdit = () => {
  router.push('/profile/edit')
}

// 导航到协议页面
const navigateToAgreement = () => {
  router.push('/membership-agreement')
}

// 导航到隐私政策页面
const navigateToPrivacyPolicy = () => {
  router.push('/privacy-policy')
}

// 导航到关于我们页面
const navigateToAbout = () => {
  router.push('/about')
}

// 导航到注销账号页面
const navigateToAccountDeletion = () => {
  router.push('/account-deletion')
}

// 导航到用户服务协议页面
const navigateToUserServiceAgreement = () => {
  router.push('/user-service-agreement')
}


const handleLevelClick = (level: string) => {
  if (!hasJlptAccess(level)) {
    showPurchaseDialog.value = true
  }
}

// VIP状态相关方法
const getMainStatusClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) return 'normal-user'
  if (isPaid === 1) return 'beta-user'
  if (isPaid === 2) return 'audio-vip'
  if (isPaid === 3) return 'video-vip'
  if (isPaid === 4) return 'course-vip'
  return 'vip-user'
}

const getMainStatusText = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) return '普通用户'
  if (isPaid === 1) return '内测用户'
  
  // 检查JLPT等级权限
  const jlptLevels = ['N1', 'N2', 'N3', 'N4', 'N5']
  const openLevels = jlptLevels.filter(level => hasJlptAccess(level))
  
  if (isPaid === 2) {
    if (openLevels.length === 5) {
      return '音频权限'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}音频权限`
    }
    return '音频权限'
  }
  
  if (isPaid === 3) {
    if (openLevels.length === 5) {
      return '视频权限'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}视频权限`
    }
    return '视频权限'
  }
  
  if (isPaid === 4) {
    if (openLevels.length === 5) {
      return '全功能权限'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}全功能权限`
    }
    return '全功能权限'
  }
  
  return '开通权限用户'
}

// 获取会员图标
const getMembershipIcon = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) return 'ri-user-line'
  if (isPaid === 1) return 'ri-user-star-line'
  if (isPaid >= 2) return 'ri-vip-crown-line'
  return 'ri-user-line'
}

// 获取指定等级的权益列表
const getLevelPrivileges = (level: string) => {
  const isPaid = authStore.userInfo?.isPaid || 0
  const hasAccess = hasJlptAccess(level)
  
  const allPrivileges = [
    { id: 0, name: '基础学习功能', icon: 'ri-book-line' },
    { id: 1, name: '完整题库访问', icon: 'ri-database-line' },
    { id: 2, name: '单词及例句音频+例句假名标注', icon: 'ri-volume-up-line' },
    { id: 3, name: '题目视频讲解', icon: 'ri-video-line' },
    { id: 4, name: '课件学习资料', icon: 'ri-file-text-line' }
  ]
  
  return allPrivileges.map(privilege => ({
    ...privilege,
    status: hasAccess && isPaid >= privilege.id ? 'active' : 'inactive'
  }))
}

// 保留原有的getIncludedPrivileges方法作为备用
const getIncludedPrivileges = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  const privileges = [
    { id: 0, name: '基础学习功能', icon: 'ri-book-line', status: 'active' },
    { id: 1, name: '完整题库访问', icon: 'ri-database-line', status: isPaid >= 1 ? 'active' : 'inactive' },
    { id: 2, name: '单词及例句音频+例句假名标注', icon: 'ri-volume-up-line', status: isPaid >= 2 ? 'active' : 'inactive' },
    { id: 3, name: '题目视频讲解', icon: 'ri-video-line', status: isPaid >= 3 ? 'active' : 'inactive' },
    { id: 4, name: '课件学习资料', icon: 'ri-file-text-line', status: isPaid >= 4 ? 'active' : 'inactive' }
  ]
  
  return privileges
}

const getAudioFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 2 ? 'feature-active' : 'feature-inactive'
}

const getVideoFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 3 ? 'feature-active' : 'feature-inactive'
}

const getCourseFeatureClass = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  return isPaid >= 4 ? 'feature-active' : 'feature-inactive'
}

const getDescriptionText = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) {
    return '普通用户：可访问免费题库+单词学习+语法学习功能，开通VIP解锁完整权益。'
  }
  if (isPaid === 1) {
    return '内测用户：可访问全部题库+单词学习+语法学习功能，享有完整练习权限。'
  }
  // 检查JLPT等级权限
  const jlptLevels = ['N1', 'N2', 'N3', 'N4', 'N5']
  const openLevels = jlptLevels.filter(level => hasJlptAccess(level))
  if (isPaid === 2) {
    if (openLevels.length === 5) {
      return '音频VIP：包含题库访问+单词及例句音频+例句假名标注功能。'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}音频权限：包含对应等级的题库访问+单词及例句音频+例句假名标注功能。`
    }
    return '音频VIP：包含题库访问+单词及例句音频+例句假名标注功能。'
  }
  if (isPaid === 3) {
    if (openLevels.length === 5) {
      return '视频VIP：包含音频VIP所有权限+题目视频讲解功能。'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}视频权限：包含对应等级的音频VIP所有权限+题目视频讲解功能。`
    }
    return '视频VIP：包含音频VIP所有权限+题目视频讲解功能。'
  }
  if (isPaid === 4) {
    if (openLevels.length === 5) {
      return '全功能VIP：享受最高级别会员权益，包含所有功能+课件学习资料。'
    } else if (openLevels.length > 0) {
      return `${openLevels.join('、')}全功能权限：享受对应等级的最高级别会员权益，包含所有功能+课件学习资料。`
    }
    return '全功能VIP：享受最高级别会员权益，包含所有功能+课件学习资料。'
  }
  return '开通VIP可解锁完整题库访问、音频、视频讲解等学习权限，请联系客服购买。'
}

const handleMainStatusClick = () => {
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) {
    showPurchaseDialog.value = true
  }
}

const handleFeatureClick = (feature: string) => {
  const isPaid = authStore.userInfo?.isPaid || 0
  
  // 根据不同状态判断是否需要弹出客服对话框
  if (isPaid === 0) {
    // 未开通VIP，所有功能都弹出客服对话框
    showPurchaseDialog.value = true
  } else if (isPaid === 1) {
    // 内测用户，所有功能都弹出客服对话框
    showPurchaseDialog.value = true
  } else if (isPaid === 2) {
    // VIP用户，视频讲解和课程学习功能弹出客服对话框
    if (feature === 'video' || feature === 'course') {
      showPurchaseDialog.value = true
    }
  } else if (isPaid === 3) {
    // VIP用户，只有课程学习功能弹出客服对话框
    if (feature === 'course') {
      showPurchaseDialog.value = true
    }
  }
  // isPaid === 4 时，所有功能都已开通，不需要弹出对话框
}

// 处理会员权益说明按钮点击
const showMembershipBenefits = () => {
  showBenefitsDialog.value = true
}

// 处理立即体验按钮点击
const handleStartExperience = () => {
  showMembershipBenefitsDialog.value = false
  // 根据用户状态决定下一步操作
  const isPaid = authStore.userInfo?.isPaid || 0
  if (isPaid === 0) {
    // 普通用户，显示客服对话框
    showPurchaseDialog.value = true
  } else {
    // 已有权限用户，可以显示兑换码对话框或其他操作
    showRedeemDialog.value = true
  }
}

const downloadApp = () => {
  showPurchaseDialog.value = false
  showDownloadDialog.value = true
}

const handleRedeem = async () => {
  if (!redeemCode.value) {
    ElMessage.error('请输入兑换码')
    return
  }

  isRedeeming.value = true

  try {
    const response = await fetch(API_ENDPOINTS.user.redeemCodePC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId: authStore.userInfo?.userId,
        token: authStore.token,
        phone_number: authStore.phoneNumber?.replace(/^\+/, ''),
        redeemCode: redeemCode.value,
        loginType: 2
      })
    })

    const data = await response.json()

    if (data.code !== 200) {
      throw new Error(data.msg || '兑换失败')
    }
    
    // 更新用户信息状态
    if (data.data && authStore.userInfo) {
      // 更新 userInfo 中的相关字段
      authStore.userInfo.isActive = data.data.isActive
      authStore.userInfo.isPaid = data.data.isPaid
      authStore.userInfo.japaneseN1 = data.data.japaneseN1
      authStore.userInfo.japaneseN2 = data.data.japaneseN2
      authStore.userInfo.japaneseN3 = data.data.japaneseN3
      authStore.userInfo.japaneseN4 = data.data.japaneseN4
      authStore.userInfo.japaneseN5 = data.data.japaneseN5
      
      // 更新 auth store 中的其他状态
      authStore.isActive = data.data.isActive
      authStore.isPaid = data.data.isPaid
      
      // 更新权限状态
      authStore.permissions = {
        N5: !!data.data.japaneseN5,
        N4: !!data.data.japaneseN4,
        N3: !!data.data.japaneseN3,
        N2: !!data.data.japaneseN2,
        N1: !!data.data.japaneseN1
      }
      
      // 更新 localStorage 中的状态以保持持久化
      const savedState = localStorage.getItem('authState')
      if (savedState) {
        try {
          const state = JSON.parse(savedState)
          state.userInfo = authStore.userInfo
          state.isActive = authStore.isActive
          state.isPaid = authStore.isPaid
          localStorage.setItem('authState', JSON.stringify(state))
        } catch (error) {
          console.error('Failed to update localStorage:', error)
        }
      }
    }
    
    // Show success message
    ElMessage.success('兑换成功！权限已更新')
    showRedeemDialog.value = false
    redeemCode.value = ''

  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '兑换失败，请稍后重试')
  } finally {
    isRedeeming.value = false
  }
}
</script>

<style lang="scss" scoped>
.profile-page {
  padding: var(--spacing-xl) 0;
  background-color: var(--background-color);
  min-height: calc(100vh - 60px);
}

.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}

.profile-info {
  .profile-details {
    h1 {
      font-size: 1.8rem;
      margin-bottom: 5px;
    }
    
    .user-role {
      opacity: 0.9;
      font-size: 1.1rem;
    }
  }
}

.header-actions {
  display: flex;
  gap: var(--spacing-md);
  
  // 手机模式下折行显示
  @media (max-width: 768px) {
    flex-direction: column;
    gap: var(--spacing-sm);
    width: 100%;
  }
}

.btn-edit,
.btn-redeem {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  
  // 手机模式下按钮样式调整
  @media (max-width: 768px) {
    justify-content: center;
    padding: 12px 16px;
    font-size: 0.95rem;
  }
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
}

// 同时调整profile-header在手机模式下的布局
.profile-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  
  // 手机模式下垂直布局
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-lg);
    padding: var(--spacing-lg);
    
    .profile-info {
      width: 100%;
    }
    
    .header-actions {
      width: 100%;
    }
  }
}

.info-section {
  background-color: white;
  padding: var(--spacing-xl);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-lg);
  
  h2 {
    font-size: 1.3rem;
    margin-bottom: var(--spacing-lg);
    color: var(--primary-color);
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    
    i {
      font-size: 1.4rem;
    }
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}

.info-item {
  label {
    display: block;
    color: var(--text-light);
    font-size: 0.9rem;
    margin-bottom: var(--spacing-xs);
  }
  
  span {
    font-size: 1.1rem;
  }
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.9rem;
  
  &.active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
  }
  
  &.inactive {
    background-color: rgba(231, 76, 60, 0.1);
    color: var(--error-color);
  }
}

.jlpt-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.jlpt-item {
  background-color: var(--background-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all var(--transition-fast);
  
  &.not-activated {
    cursor: pointer;
    opacity: 0.7;
    
    &:hover {
      opacity: 1;
      transform: translateY(-2px);
    }
  }
  
  .level-badge {
    background-color: var(--primary-color);
    color: white;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;
  }
  
  .access-status {
    font-size: 0.9rem;
    
    &.has-access {
      color: var(--success-color);
    }
    
    &.no-access {
      color: var(--text-light);
    }
  }
}

.vip-status-container {
  width: 100%;
}

.main-status {
  margin-bottom: var(--spacing-md);
}

.main-badge {
  font-size: 1.1rem;
  padding: 12px 20px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  
  .membership-icon {
    font-size: 1.2rem;
  }
  
  &.normal-user {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #6c757d;
    border: 2px solid #dee2e6;
    
    &:hover {
      background: linear-gradient(135deg, #e9ecef, #dee2e6);
      transform: translateY(-1px);
    }
  }
  
  &.beta-user {
    background: linear-gradient(135deg, #fff3cd, #ffeaa7);
    color: #856404;
    border: 2px solid #ffc107;
  }
  
  &.audio-vip {
    background: linear-gradient(135deg, #d1ecf1, #bee5eb);
    color: #0c5460;
    border: 2px solid #17a2b8;
  }
  
  &.video-vip {
    background: linear-gradient(135deg, #d4edda, #c3e6cb);
    color: #155724;
    border: 2px solid #28a745;
  }
  
  &.course-vip {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    color: #e65100;
    border: 2px solid #ff9800;
  }
}

.membership-level {
  margin-top: 8px;
  
  .level-indicator {
    background: rgba(0, 0, 0, 0.1);
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
  }
}

.privilege-hierarchy {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-radius: 12px;
  border: 1px solid #e9ecef;
}

.privilege-table {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  margin-top: var(--spacing-md);
}

.table-header {
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 2px solid #e9ecef;
}

.privilege-name-header {
  padding: var(--spacing-md);
  font-weight: 600;
  color: var(--primary-color);
  border-right: 1px solid #e9ecef;
  display: flex;
  align-items: center;
}

.level-header-cell {
  padding: var(--spacing-sm);
  text-align: center;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  &:last-child {
    border-right: none;
  }
  
  &.level-unlocked {
    background-color: rgba(46, 204, 113, 0.05);
  }
}

.level-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.8rem;
}

.level-status {
  font-size: 0.8rem;
  
  &.unlocked {
    color: var(--success-color);
  }
  
  &.locked {
    color: var(--text-muted);
  }
  
  i {
    font-size: 0.9rem;
  }
}

.table-body {
  display: flex;
  flex-direction: column;
}

.privilege-row {
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr);
  border-bottom: 1px solid #f1f3f4;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(var(--primary-color-rgb), 0.02);
  }
}

.privilege-name-cell {
  padding: var(--spacing-md);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-right: 1px solid #f1f3f4;
  font-weight: 500;
  
  i {
    color: var(--primary-color);
    font-size: 1.1rem;
  }
}

.privilege-cell {
  padding: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #f1f3f4;
  
  &:last-child {
    border-right: none;
  }
  
  i {
    font-size: 1.2rem;
  }
  
  &.cell-active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
  }
  
  &.cell-inactive {
    background-color: rgba(153, 153, 153, 0.05);
    color: var(--text-muted);
  }
  
  &.cell-locked {
    background-color: rgba(231, 76, 60, 0.05);
    color: var(--error-color);
    opacity: 0.6;
  }
}

// 移动端适配 - 增强版
@media (max-width: 768px) {
  .privilege-table {
    font-size: 0.85rem;
    border-radius: 6px;
  }
  
  .table-header,
  .privilege-row {
    grid-template-columns: 1.2fr repeat(5, 0.8fr);
  }
  
  .privilege-name-cell {
    padding: 8px;
    font-size: 0.8rem;
    
    span {
      display: none; /* 隐藏文字，只显示图标 */
    }
    
    i {
      font-size: 0.9rem;
    }
  }
  
  .privilege-name-header {
    padding: 8px;
    font-size: 0.85rem;
  }
  
  .level-badge {
    font-size: 0.65rem;
    padding: 1px 4px;
  }
  
  .level-header-cell {
    padding: 6px 2px;
    gap: 2px;
  }
  
  .privilege-cell {
    padding: 6px 2px;
    
    i {
      font-size: 1rem;
    }
  }
  
  .level-status {
    font-size: 0.7rem;
    
    i {
      font-size: 0.8rem;
    }
  }
}

// 超小屏幕适配（小于480px）
@media (max-width: 480px) {
  .privilege-table {
    font-size: 0.8rem;
  }
  
  .table-header,
  .privilege-row {
    grid-template-columns: 1fr repeat(5, 0.7fr);
  }
  
  .privilege-name-cell,
  .privilege-name-header {
    padding: 6px;
    font-size: 0.75rem;
  }
  
  .level-badge {
    font-size: 0.6rem;
    padding: 1px 3px;
  }
  
  .privilege-cell {
    padding: 4px 1px;
    
    i {
      font-size: 0.9rem;
    }
  }
}

.privilege-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--spacing-md);
  font-weight: 600;
  color: var(--primary-color);
  
  i {
    font-size: 1.1rem;
  }
}

.privilege-list {
  display: grid;
  gap: 8px;
}

.privilege-levels {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.privilege-level-group {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all var(--transition-fast);
  
  &.level-locked {
    opacity: 0.6;
    background-color: #f8f9fa;
  }
}

.level-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  background: linear-gradient(135deg, #f8f9fa, #ffffff);
  border-bottom: 1px solid #e9ecef;
}

.level-badge {
  background-color: var(--primary-color);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-weight: 600;
  font-size: 0.9rem;
}

.level-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  
  &.unlocked {
    color: var(--success-color);
  }
  
  &.locked {
    color: var(--text-muted);
  }
}

.level-privileges {
  padding: var(--spacing-sm);
  display: grid;
  gap: 4px;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all var(--transition-fast);
  
  i {
    font-size: 1rem;
  }
  
  .check-icon {
    margin-left: auto;
    color: var(--success-color);
  }
  
  &.active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
    border-left: 3px solid var(--success-color);
  }
  
  &.inactive {
    background-color: rgba(153, 153, 153, 0.05);
    color: var(--text-muted);
    opacity: 0.6;
  }
  
  &.level-restricted {
    background-color: rgba(153, 153, 153, 0.05);
    color: var(--text-muted);
    opacity: 0.5;
  }
  
  .lock-icon {
    margin-left: auto;
    color: var(--text-muted);
    font-size: 0.9rem;
  }
}

.feature-badge {
  // ... existing code ...
  position: relative;
  
  .feature-level {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--primary-color);
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 600;
  }
  
  &.feature-active .feature-level {
    background: var(--success-color);
  }
  
  &.feature-inactive .feature-level {
    background: var(--text-muted);
  }
}

.vip-features {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.feature-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid transparent;
  
  i {
    font-size: 1rem;
  }
  
  &.feature-active {
    background-color: rgba(46, 204, 113, 0.1);
    color: var(--success-color);
    border-color: var(--success-color);
  }
  
  &.feature-inactive {
    background-color: rgba(153, 153, 153, 0.1);
    color: var(--text-muted);
    border-color: var(--text-muted);
    
    &:hover {
      background-color: rgba(153, 153, 153, 0.2);
      transform: translateY(-1px);
    }
  }
}

.vip-description {
  margin-top: var(--spacing-sm);
  
  p {
    color: var(--text-light);
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 0;
  }
}

.purchase-dialog,
.download-dialog {
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

  .download-options {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
    padding: var(--spacing-md) 0;
  }

  .download-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: white;
    font-weight: 500;
    transition: opacity var(--transition-fast);

    &:hover {
      opacity: 0.9;
    }

    i {
      font-size: 1.2rem;
    }

    &.android {
      background-color: #3DDC84;
    }

    &.ios {
      background-color: #000000;
    }
  }
}

.redeem-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .redeem-form {
    padding: var(--spacing-md) 0;

    .form-group {
      label {
        display: block;
        margin-bottom: var(--spacing-xs);
        color: var(--text-light);
      }

      input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        font-size: 1rem;

        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
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


.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
  .download-btn {
  display: none;
  align-items: center;
  background-color: var(--accent-color);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  @media (min-width: 768px) {
    display: flex;
  }
  
  i {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: var(--accent-dark);
  }
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    display: none;
  }
}
.agreement-grid {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.agreement-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  border: 1px solid var(--border-color);
  
  &:hover {
    background-color: rgba(var(--primary-color-rgb), 0.05);
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  .agreement-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(var(--primary-color-rgb), 0.1);
    border-radius: 50%;
    margin-right: var(--spacing-lg);
    
    i {
      font-size: 1.5rem;
      color: var(--primary-color);
    }
  }
  
  .agreement-content {
    flex: 1;
    
    h3 {
      font-size: 1.1rem;
      color: var(--text-color);
      margin-bottom: var(--spacing-xs);
      font-weight: 600;
    }
    
    p {
      color: var(--text-light);
      font-size: 0.9rem;
      margin: 0;
      line-height: 1.4;
    }
  }
  
  .agreement-arrow {
    color: var(--text-light);
    transition: color var(--transition-fast);
    
    i {
      font-size: 1.2rem;
    }
  }
  
  &:hover .agreement-arrow {
    color: var(--primary-color);
  }
}

// 移动端适配
@media (max-width: 768px) {
  .agreement-item {
    padding: var(--spacing-md);
    
    .agreement-icon {
      width: 40px;
      height: 40px;
      margin-right: var(--spacing-md);
      
      i {
        font-size: 1.3rem;
      }
    }
    
    .agreement-content {
      h3 {
        font-size: 1rem;
      }
      
      p {
        font-size: 0.85rem;
      }
    }
  }
}
  .download-btn {
  display: none;
  align-items: center;
  background-color: var(--accent-color);
  border: none;
  border-radius: 4px;
  color: white;
  padding: 6px 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  @media (min-width: 768px) {
    display: flex;
  }
  
  i {
    margin-right: 5px;
  }
  
  &:hover {
    background-color: var(--accent-dark);
  }
}

.menu-toggle {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  @media (min-width: 768px) {
    display: none;
  }
}
</style>
