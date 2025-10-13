<template>
  <div class="grammar-page">
    <div class="page-header">
      <div class="container">
        <h1>文法</h1>
        <p>千条语法 从初级到高级 全覆盖 全面学习</p>
      </div>
    </div>

    <div class="container">
      <GrammarTabs 
        :current-tab="currentTab"
        :tabs="tabs"
        @tab-change="currentTab = $event"
      />

      <!-- 语法列表模式 -->
      <div v-if="currentTab === 'list'" class="tab-content">
        <GrammarFilters
          :current-level="currentLevel"
          :display-mode="displayMode"
          :levels="levels"
          @level-change="setLevel"
          @display-mode-change="displayMode = $event"
        />

        <GrammarLoadingState v-if="loading && !grammarPoints.length" />

        <GrammarErrorState v-else-if="error" :error="error" @retry="fetchGrammar" />

        <div v-else>
          <!-- 卡片模式 -->
          <div v-if="displayMode === 'card'" class="grammar-grid">
            <GrammarCard
              v-for="point in grammarPoints" 
              :key="point.grammarId"
              :grammar="point"
              @show-explanation="showGrammarExplanation"
            />
          </div>
          
          <!-- 列表模式 -->
          <div v-else class="grammar-list">
            <GrammarListItem
              v-for="point in grammarPoints" 
              :key="point.grammarId"
              :grammar="point"
              @navigate-to-detail="navigateToDetail"
              @show-explanation="showGrammarExplanation"
            />
          </div>
        </div>

        <div class="load-more" v-if="grammarPoints.length > 0">
          <button 
            class="btn btn-primary" 
            @click="loadMore"
            :disabled="loading"
          >
            {{ loading ? '加载中...' : '再来一组语法' }}
          </button>
        </div>
      </div>

      <!-- 练习模式 -->
      <div v-if="currentTab === 'practice'" class="tab-content">
        <GrammarPracticeMode
          :practice-started="practiceStarted"
          :practice-level-value="practiceLevelValue"
          :current-grammar="currentGrammar"
          :current-grammar-index="currentGrammarIndex"
          :practice-grammar-points="practiceGrammarPoints"
          :meaning-revealed="meaningRevealed"
          :example-revealed="exampleRevealed"
          :is-loading="isLoading"
          @practice-level-change="handlePracticeLevelChange"
          @start-practice="startPractice"
          @reveal-meaning="revealMeaning"
          @reveal-example="revealExample"
          @next-grammar="nextGrammar"
          @show-contact="showContactDialog = true"
        />
      </div>
    </div>

    <!-- 联系客服弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showContactDialog"
      title="咨询客服"
      qr-description="扫码二维码添加客服微信"
      mobile-description=""
      dialog-class="contact-dialog"
    />
    
    <!-- 语法讲解视频弹窗 -->
    <GrammarVideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
    
    <!-- 全局加载动画 -->
    <LoadingSpinner 
      :show="globalLoading" 
      text="加载中..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { trackEvent, EVENT_TYPES } from '../utils/eventTracking'
import GrammarTabs from '../components/grammar/GrammarTabs.vue'
import GrammarFilters from '../components/grammar/GrammarFilters.vue'
import GrammarCard from '../components/grammar/GrammarCard.vue'
import GrammarListItem from '../components/grammar/GrammarListItem.vue'
import GrammarPracticeMode from '../components/grammar/GrammarPracticeMode.vue'
import GrammarVideoDialog from '../components/grammar/GrammarVideoDialog.vue'
import GrammarLoadingState from '../components/grammar/GrammarLoadingState.vue'
import CustomerServiceDialog from '../components/common/CustomerServiceDialog.vue'
import GrammarErrorState from '../components/grammar/GrammarErrorState.vue'
import { FEATURE_FLAGS } from '../config/features'
import { getVideoUrl } from '../utils/crypto'

const router = useRouter()
const authStore = useAuthStore()

const API_URL = 'https://www.dlmy.tech/chunshua-api/chunshua_questions/grammar/grammerCards'

const getConfig = () => {
  return {
    userId: authStore.userInfo?.userId || '',
    token: authStore.token || '',
    user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
    loginType: 2,
    useType: 2,
    userTypeUseGrammarId: 0,
    jpltLevel: currentLevel.value === '全部' ? 'N' : currentLevel.value,
    grammarCount: 6
  }
}

interface GrammarPoint {
  grammarId: number
  grammarName: string
  grammarForm: string
  grammarMeaning: string
  exampleSentence1: string
  exampleTranslation1: string
  exampleSentence2: string
  exampleTranslation2: string
  exampleSentence3: string
  exampleTranslation3: string
  jlptLevel: string
  grammarSpeakVideoUrl?: string
}

// 通用状态
const tabs = [
  { id: 'list', name: '语法列表', icon: 'ri-list-check' },
  { id: 'practice', name: '学习时刻', icon: 'ri-book-read-line' }
]
const currentTab = ref('list')
const currentLevel = ref('全部')
const displayMode = ref('list')
const grammarPoints = ref<GrammarPoint[]>([])
const loading = ref(false)
const error = ref('')
const globalLoading = ref(false)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 错误纠正对话框
const showContactDialog = ref(false)

// 练习模式状态
const practiceStarted = ref(false)
const practiceLevelValue = ref('全部')
const practiceGrammarPoints = ref<GrammarPoint[]>([])
const currentGrammarIndex = ref(0)
const meaningRevealed = ref(false)
const exampleRevealed = ref(false)
const isLoading = ref(false)

const levels = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']

const currentGrammar = computed(() => {
  return practiceGrammarPoints.value[currentGrammarIndex.value] || null
})

const setLevel = async (level: string) => {
  if (level === currentLevel.value) return
  
  currentLevel.value = level
  grammarPoints.value = []
  await fetchGrammar()
}

const fetchGrammar = async () => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }

  loading.value = true
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  error.value = ''

  try {
    const config = getConfig()
    const response = await axios.post(API_URL, config)

    if (response.data.code === 200) {
      grammarPoints.value = response.data.data
    } else {
      throw new Error(response.data.msg || '获取语法失败')
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取语法失败，请稍后重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

const loadMore = () => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  fetchGrammar()
}

const navigateToDetail = (grammar: GrammarPoint) => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  
  // Store grammar data in sessionStorage
  sessionStorage.setItem('currentGrammar', JSON.stringify(grammar))
  router.push(`/grammar/${grammar.grammarId}`)
}

// 显示语法讲解视频
const showGrammarExplanation = (grammar: GrammarPoint) => {
  if (!grammar.grammarSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(grammar.grammarSpeakVideoUrl)
  explanationVideoUrl.value = videoUrl
  showVideoDialog.value = true
}

// 练习模式相关方法
const handlePracticeLevelChange = (level: string) => {
  practiceLevelValue.value = level
}

const startPractice = async () => {
  isLoading.value = true
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  // 添加埋点 - 开始语法练习
  trackEvent('grammar_practice_start')
  
  try {
    const config = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: 2,
      useType: 2,
      userTypeUseGrammarId: 0,
      jpltLevel: practiceLevelValue.value === '全部' ? 'N' : practiceLevelValue.value,
      grammarCount: 10
    }
    
    const response = await axios.post(API_URL, config)

    if (response.data.code === 200) {
      practiceGrammarPoints.value = response.data.data
      currentGrammarIndex.value = 0
      meaningRevealed.value = false
      exampleRevealed.value = false
      practiceStarted.value = true
    } else {
      throw new Error(response.data.msg || '获取语法失败')
    }
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : '获取语法失败，请稍后重试')
  } finally {
    isLoading.value = false
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

const revealMeaning = () => {
  meaningRevealed.value = true
}

const revealExample = () => {
  exampleRevealed.value = true
}

const nextGrammar = async () => {
  // 先重置状态
  meaningRevealed.value = false
  exampleRevealed.value = false
  
  // 移动到下一个语法
  currentGrammarIndex.value++
  
  // 如果已经到达最后一个语法，自动获取更多语法
  if (currentGrammarIndex.value >= practiceGrammarPoints.value.length) {
    isLoading.value = true
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = true
    }
    
    try {
      const config = {
        userId: authStore.userInfo?.userId || '',
        token: authStore.token || '',
        user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
        loginType: 2,
        useType: 2,
        userTypeUseGrammarId: 0,
        jpltLevel: practiceLevelValue.value === '全部' ? 'N' : practiceLevelValue.value,
        grammarCount: 10
      }
      
      const response = await axios.post(API_URL, config)

      if (response.data.code === 200) {
        practiceGrammarPoints.value = response.data.data
        currentGrammarIndex.value = 0
      } else {
        throw new Error(response.data.msg || '获取语法失败')
      }
    } catch (err) {
      ElMessage.error(err instanceof Error ? err.message : '获取语法失败，请稍后重试')
    } finally {
      isLoading.value = false
      if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
        globalLoading.value = false
      }
    }
  }
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/auth/login')
    return
  }
  
  // 添加埋点 - 进入语法学习页面
  trackEvent(EVENT_TYPES['page_view_grammar'])
  
  fetchGrammar()
})
</script>

<style lang="scss" scoped>
.grammar-page {
  padding-bottom: var(--spacing-xxl);
}

.page-header {
  background-color: var(--primary-color);
  color: white;
  padding: var(--spacing-xl) 0;
  margin-bottom: var(--spacing-xl);

  h1 {
    font-size: 2rem;
    margin-bottom: var(--spacing-sm);
  }

  p {
    opacity: 0.9;
    font-size: 1.1rem;
  }
}

.grammar-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: var(--spacing-lg);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: var(--spacing-md);
  }
}

.grammar-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.load-more {
  text-align: center;
  margin-top: var(--spacing-xl);

  button {
    padding: 12px 30px;
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  }
}

.contact-dialog {
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
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>