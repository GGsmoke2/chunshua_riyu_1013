<template>
  <div class="vocabulary-review">
    <div class="review-header">
      <div class="header-content">
        <div class="header-title">
          <h2>学习时刻</h2>
          <p>每天坚持背单词的你，真的超级酷！</p>
        </div>
        
        <div class="level-filters">
          <button 
            v-for="level in ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']" 
            :key="level"
            :class="['level-btn', { 
              active: currentLevel === level,
              disabled: disabledLevels.includes(level)
            }]"
            @click="handleLevelClick(level)"
          >
            {{ level }}
            <i v-if="disabledLevels.includes(level)" class="ri-lock-line"></i>
          </button>
        </div>
        
        <div class="count-selector">
          <label>单词数量</label>
          <select v-model="wordCount" @change="handleCountChange">
            <option value="12">12个</option>
            <option value="20">20个</option>
            <option value="30">30个</option>
            <option value="40">40个</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="review-content">
      <div v-if="filteredWords.length > 0 && currentIndex < filteredWords.length" class="review-card">
        <ReviewCardHeader 
          :current-word="currentWord"
          :current-index="currentIndex"
          :filtered-words="filteredWords"
        />
        
        <div class="card-body">
          <WordSection 
            :current-word="currentWord"
            @play-pronunciation="playPronunciation"
            @play-explanation-video="$emit('play-explanation-video', currentWord)"
          />
          
          <MeaningSection 
            :meaning-revealed="meaningRevealed"
            :current-word="currentWord"
            @reveal-meaning="revealMeaning"
          />
          
          <ExampleSection 
            :example-revealed="exampleRevealed"
            :current-example="currentExample"
            :is-example-playing="isExamplePlaying"
            @reveal-example="revealExample"
            @play-example-pronunciation="playExamplePronunciation"
          />
        </div>
        
        <ReviewCardFooter 
          @review-good="nextWord" 
          @show-contact="showContactDialog = true"
          :current-word="currentWord"
          :is-favorited="isFavorited"
          :favorite-loading="favoriteLoading"
          :favorite-cooldown="favoriteCooldown"
          :toggle-favorite="toggleFavorite"
        />
        
        <!-- 在最后一个单词的卡片上显示加载中 -->
        <div v-if="isLoading && currentIndex === filteredWords.length - 1" class="loading-overlay">
          <div class="loading-indicator">
            <i class="ri-loader-4-line spinning"></i>
            <span>加载中...</span>
          </div>
        </div>
      </div>
      
      <div v-else-if="!filteredWords.length && !isLoading" class="empty-state">
        <button class="btn-start-review" @click="fetchMoreWords">
          开始学习
          <i class="ri-arrow-right-line"></i>
        </button>
      </div>
      
      <div v-else-if="isLoading && !filteredWords.length" class="loading-state">
        <div class="loading-indicator">
          <i class="ri-loader-4-line spinning"></i>
          <span>加载中...</span>
        </div>
      </div>
    </div>
    
    <!-- 联系客服弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showContactDialog"
      title="联系客服"
      mobile-description="联系客服获取帮助"
      dialog-class="contact-dialog"
    />
  </div>
  
  <!-- 音频权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showAudioPermissionDialog"
    title="扫码添加客服开通音频权限"
    dialog-class="audio-permission-dialog"
  />
  
  <!-- JLPT权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showJlptPermissionDialog"
    title="未开通权限"
    mobile-description="未开通权限，请联系客服开通"
    tip-text="联系客服开通权限"
    dialog-class="jlpt-permission-dialog"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'
import { ElMessage } from 'element-plus'

import { useAuthStore } from '../../stores/auth'
import ReviewCardHeader from './review/ReviewCardHeader.vue'
import WordSection from './review/WordSection.vue'
import MeaningSection from './review/MeaningSection.vue'
import ExampleSection from './review/ExampleSection.vue'
import ReviewCardFooter from './review/ReviewCardFooter.vue'
import { VOCABULARY_API, DEFAULT_PARAMS } from '../../config/api-vocabulary'
import { playWordAudio, playExampleAudio, stopAllAudio as stopUtilAudio } from '../../utils/audio'
import { API_ENDPOINTS } from '../../config/api'


interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  example?: string
  exampleMeaning?: string
  example2?: string
  example2Meaning?: string
  example3?: string
  example3Meaning?: string
  level: string
  explanationUrl?: string
  wordAudioUrl?: string
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['changeLevel', 'changeCount', 'play-explanation-video'])
const authStore = useAuthStore()

const currentIndex = ref(0)
const meaningRevealed = ref(false)
const exampleRevealed = ref(false)
const showContactDialog = ref(false)
const isExamplePlaying = ref(false)
const currentLevel = ref('全部')
const wordCount = ref('12')
const originalWords = ref<Word[]>([])
const filteredWords = ref<Word[]>([])
const isLoading = ref(false)
const showAudioPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const reviewStats = ref({
  total: 0,
  completed: 0,
  mastered: 0
})

// 收藏相关状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)
const favoriteCooldown = ref(0)
const cooldownInterval = ref<number | null>(null)

// 计算属性：获取当前单词
const currentWord = computed(() => {
  return filteredWords.value[currentIndex.value] || { id: '', kanji: '', kana: '', meaning: '', example: '', level: '' }
})

// 监听当前单词变化，检查收藏状态
watch(currentWord, () => {
  if (currentWord.value && currentWord.value.id) {
    checkFavoriteStatus()
  }
})

const currentExample = computed(() => {
  return {
    text: currentWord.value.example,
    meaning: currentWord.value.exampleMeaning
  }
})

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn || !currentWord.value?.id) {
    return
  }
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.checkWordFavoriteStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: currentWord.value.id.toString()
    })
    
    if (response.data.code === 200) {
      isFavorited.value = response.data.data.isFavorited || false
    }
  } catch (error) {
    console.error('检查单词收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行收藏操作')
    return
  }
  
  if (favoriteLoading.value) {
    return
  }
  
  favoriteLoading.value = true
  
  try {
    if (isFavorited.value) {
      // 取消收藏
      const response = await axios.post(API_ENDPOINTS.favorite.removeWordFromFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: currentWord.value.id.toString()
      })
      
      if (response.data.code === 200) {
        isFavorited.value = false
        ElMessage.success(response.data.msg || '已取消收藏')
        startCooldown()
      } else {
        ElMessage.error(response.data.msg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const response = await axios.post(API_ENDPOINTS.favorite.addWordToFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: currentWord.value.id.toString()
      })
      
      if (response.data.code === 200) {
        isFavorited.value = true
        ElMessage.success(response.data.msg || '收藏成功')
        startCooldown()
      } else {
        ElMessage.error(response.data.msg || '收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    favoriteLoading.value = false
  }
}

// 冷却时间管理
const startCooldown = () => {
  // 移除3秒倒计时限制
  favoriteCooldown.value = 0
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
}

const setLevel = (level: string) => {
  currentLevel.value = level
  emit('changeLevel', level)
  resetReviewState()
  fetchMoreWords()
}

const handleCountChange = () => {
  emit('changeCount', wordCount.value)
  resetReviewState()
  fetchMoreWords()
}

// 重置方法
const resetReviewState = () => {
  currentIndex.value = 0
  meaningRevealed.value = false
  exampleRevealed.value = false
  filteredWords.value = []
  reviewStats.value = {
    total: 0,
    completed: 0,
    mastered: 0
  }
}

// 检查用户是否拥有任何JLPT等级权限
const hasAnyJlptAccess = () => {
  const permissions = authStore.permissions
  return permissions.N1 || permissions.N2 || permissions.N3 || permissions.N4 || permissions.N5
}

// 从API获取更多单词
const fetchMoreWords = async () => {
  // 检查用户是否登录
  if (!authStore.isLoggedIn) {
    console.warn('用户未登录')
    return
  }
  
  // 检查用户是否拥有任何JLPT权限
  if (!hasAnyJlptAccess()) {
    console.warn('用户没有任何JLPT权限')
    // 显示权限不足的提示
    showJlptPermissionDialog.value = true
    return
  }
  
  isLoading.value = true
  
  try {
    // 构建API请求参数
    const params = {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      loginType: DEFAULT_PARAMS.loginType,
      useType: DEFAULT_PARAMS.useType,
      userTypeUseWordId: 0, // 默认词库ID
      jpltLevel: currentLevel.value === '全部' ? 'N' : currentLevel.value,
      wordCount: parseInt(wordCount.value)
    }

    // 发送API请求
    const response = await axios.post(VOCABULARY_API.WORD_CARDS, params)

    if (response.data.code === 200) {
      // 处理API返回的数据
      const newWords = response.data.data.map((word: any) => ({
        id: word.wordId,
        kanji: word.wordKanji,
        kana: word.wordKana,
        meaning: word.wordMeaning,
        level: word.jlptLevel,
        tags: word.tags ? word.tags.split(',') : [],
        example: word.wordExampleSentence1,
        exampleMeaning: word.wordExampleTranslation1,
        example2: word.wordExampleSentence2,
        exampleMeaning2: word.wordExampleTranslation2,
        example3: word.wordExampleSentence3,
        exampleMeaning3: word.wordExampleTranslation3,
        wordAudioUrl: word.wordAudioUrl
      }))
      
      // 打乱顺序
      const shuffledWords = newWords.sort(() => Math.random() - 0.5)
      
      // 更新过滤后的单词数组
      filteredWords.value = shuffledWords
      
      // 更新复习统计
      reviewStats.value = {
        total: shuffledWords.length,
        completed: 0,
        mastered: 0
      }
      
      // 重置索引和状态
      currentIndex.value = 0
      meaningRevealed.value = false
      exampleRevealed.value = false
    } else {
      // 如果API返回错误，使用本地数据作为备份
      await fetchLocalWords()
    }
  } catch (err) {
    console.error('API请求失败，使用本地数据', err)
    await fetchLocalWords()
  } finally {
    isLoading.value = false
  }
}

// 从本地JSON文件获取单词（作为备份）
const fetchLocalWords = async () => {
  try {
    const response = await fetch('/db.json')
    const data = await response.json()
    
    let localWords = data.vocabulary
    
    if (currentLevel.value !== '全部') {
      localWords = localWords.filter((word: any) => word.level === currentLevel.value)
    }
    
    // 限制单词数量
    localWords = localWords.slice(0, parseInt(wordCount.value))
    
    // 打乱顺序
    const shuffledWords = localWords.sort(() => Math.random() - 0.5)
    
    // 更新过滤后的单词数组
    filteredWords.value = shuffledWords
    
    // 更新复习统计
    reviewStats.value = {
      total: shuffledWords.length,
      completed: 0,
      mastered: 0
    }
  } catch (err) {
    console.error('获取本地单词失败', err)
  }
}

const revealMeaning = () => {
  meaningRevealed.value = true
}

const revealExample = () => {
  exampleRevealed.value = true
}

// 在playPronunciation函数中
const playPronunciation = () => {
  if (!currentWord.value?.wordAudioUrl) return
  
  stopUtilAudio()
  
  playWordAudio(
    currentWord.value.wordAudioUrl,
    () => { isAnyAudioPlaying.value = true },
    () => { isAnyAudioPlaying.value = false },
    () => { isAnyAudioPlaying.value = false }
  )
}

// 在playExample函数后面添加
const playExamplePronunciation = () => {
  if (!currentWord.value?.wordAudioUrl) return
  
  stopUtilAudio()
  
  playExampleAudio(
    currentWord.value.wordAudioUrl,
    0, // 例句1
    () => { 
      isExamplePlaying.value = true
      isAnyAudioPlaying.value = true
    },
    () => { 
      isExamplePlaying.value = false
      isAnyAudioPlaying.value = false
    },
    () => { 
      isExamplePlaying.value = false
      isAnyAudioPlaying.value = false
    }
  )
}

const stopExplanationVideo = () => {
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }
}


const nextWord = () => {
  // 先停止所有音频播放
  stopAllAudio()
  
  currentIndex.value++
  meaningRevealed.value = false
  exampleRevealed.value = false
  reviewStats.value.completed++
  reviewStats.value.mastered++
  
  // 如果已经到达最后一个单词，自动获取更多单词
  if (currentIndex.value >= filteredWords.value.length) {
    fetchMoreWords()
  }
}

// 监听props.words变化
watch(() => props.words, (newWords) => {
  originalWords.value = [...newWords]
  
  // 如果没有单词，自动获取
  if (newWords.length === 0) {
    fetchMoreWords()
  } else {
    filteredWords.value = [...newWords]
    reviewStats.value.total = newWords.length
  }
}, { immediate: true, deep: true })

// 组件卸载时停止所有音频和视频
onUnmounted(() => {
  stopAllAudio()
  stopExplanationVideo()
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})

// 停止所有音频的函数
const stopAllAudio = () => {
  // 停止语音合成
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
  
  // 停止所有audio元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.currentTime = 0
  })
  
  // 重置播放状态
  isExamplePlaying.value = false
  isAnyAudioPlaying.value = false
}

const showJlptPermissionDialog = ref(false)

// 获取用户拥有权限的最近级别
const getLatestAvailableLevel = () => {
  // 如果用户未登录或未付费，返回默认值
  if (!authStore.isLoggedIn || !authStore.isPaid) {
    return '全部'
  }
  
  // 按照从高到低的顺序检查权限
  const levelPriority = ['N1', 'N2', 'N3', 'N4', 'N5']
  
  for (const level of levelPriority) {
    if (!disabledLevels.value.includes(level)) {
      return level
    }
  }
  
  // 如果没有任何权限，返回默认值
  return '全部'
}

// 初始化默认级别选择
const initializeDefaultLevel = () => {
  // 检查用户是否拥有任何JLPT权限
  if (!hasAnyJlptAccess()) {
    // 如果没有任何权限，保持当前选择，让用户看到权限提示
    return
  }
  
  // 检查当前选择的级别是否被禁用
  if (disabledLevels.value.includes(currentLevel.value)) {
    // 如果当前选择的级别被禁用，自动选择最近的可用级别
    const availableLevel = getLatestAvailableLevel()
    currentLevel.value = availableLevel
  }
}


// 组件挂载时初始化默认级别选择
onMounted(() => {
  initializeDefaultLevel()
})

// 计算禁用的等级
const disabledLevels = computed(() => {
  const disabled: string[] = []
  
  // 如果用户未登录，不禁用任何等级
  if (!authStore.isLoggedIn) {
    return disabled
  }
  
  // 如果用户未付费，禁用所有等级
  if (!authStore.isPaid) {
    return ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']
  }
  
  // 如果用户已付费，检查具体的JLPT权限
  const permissions = authStore.permissions
  
  if (!permissions.N5) disabled.push('N5')
  if (!permissions.N4) disabled.push('N4')
  if (!permissions.N3) disabled.push('N3')
  if (!permissions.N2) disabled.push('N2')
  if (!permissions.N1) disabled.push('N1')
  
  // 如果不是所有N1-N5都有权限，则禁用"全部"
  if (!permissions.N1 || !permissions.N2 || !permissions.N3 || !permissions.N4 || !permissions.N5) {
    disabled.push('全部')
  }
  
  return disabled
})

// 处理等级点击
const handleLevelClick = (level: string) => {
  if (disabledLevels.value.includes(level)) {
    showJlptPermissionDialog.value = true
    return
  }
  
  setLevel(level)
}
</script>

<style lang="scss" scoped>
.vocabulary-review {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.review-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
  
  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .header-title {
    text-align: center;
    margin-bottom: var(--spacing-md);
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: var(--spacing-xs);
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    p {
      opacity: 0.9;
      font-size: 1.1rem;
      font-weight: 300;
    }
  }
}

.level-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  
  .level-btn {
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 4px;

    &:hover:not(.disabled) {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      background-color: white;
      border-color: white;
      color: var(--primary-color);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
    
    &.disabled {
      opacity: 0.5;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
        background: rgba(255, 255, 255, 0.1);
      }
      
      i {
        font-size: 0.8rem;
      }
    }
  }
}

.count-selector {
  margin-bottom: var(--spacing-md);
  text-align: center;
  
  label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: 0.9rem;
    opacity: 0.9;
  }
  
  select {
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    width: 150px;
    cursor: pointer;
    font-size: 0.95rem;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 16px;
    padding-right: 30px;
    
    &:focus {
      outline: none;
      border-color: white;
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
    }
    
    option {
      background-color: var(--primary-color);
      color: white;
    }
  }
}

.review-stats {
  display: flex;
  justify-content: center;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-md);
  
  .stat-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 10px 20px;
    border-radius: 10px;
    min-width: 80px;
    
    .stat-value {
      font-size: 1.8rem;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }
  }
}

.review-content {
  flex: 1;
  padding: var(--spacing-lg) var(--spacing-lg) var(--spacing-xxl);
  min-height: 500px;
  position: relative;
}

.review-card {
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
}

.card-body {
  padding: var(--spacing-lg);
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 500;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-start-review {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  i {
    transition: transform var(--transition-fast);
  }

  &:hover i {
    transform: translateX(4px);
  }
}

.contact-dialog {
  .el-dialog__header {
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

.video-dialog {
  .el-dialog__header {
    margin-right: 0;
    text-align: center;
  }

  .video-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .explanation-video {
    width: 100%;
    border-radius: var(--border-radius);
  }

  .no-video-message {
    text-align: center;
    padding: var(--spacing-xl) 0;
    color: var(--text-light);

    i {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
    }
  }
}

.audio-permission-dialog {
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
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>