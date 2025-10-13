<template>
  <div class="question-container">
    <div class="question-header">
      <h3 class="question-number">Q{{ questionIndex + 1 }}</h3>
      <div class="question-meta">
        <span v-if="hasJlptLevel()" class="difficulty-badge" :class="getDifficultyClass()">
          {{ getJlptLevelText() }}
        </span>
        <!-- 收藏按钮 -->
        <button 
          class="favorite-btn text-btn" 
          :class="{ 'favorited': isFavorited, 'cooldown': favoriteCooldown > 0 }"
          @click="toggleFavorite"
          :disabled="favoriteLoading || favoriteCooldown > 0"
          :title="favoriteCooldown > 0 ? `请等待${favoriteCooldown}秒` : (isFavorited ? '取消收藏' : '收藏题目')"
        >
          <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
          <span v-else-if="favoriteCooldown > 0" class="cooldown-text">{{ favoriteCooldown }}</span>
          <span v-else class="btn-text">{{ isFavorited ? '已收藏' : '我想收藏' }}</span>
        </button>
      </div>
    </div>
    
    <p class="question-text jp-text">{{ question.questionStem }}</p>
    
    <div class="answer-options">
      <label 
        v-for="(option, index) in question.options.split('|')" 
        :key="index"
        :class="[
          'option-item',
          {
            'selected': getUserAnswer(question.questionId) === index,
            'correct': isRandomPractice && hasAnsweredQuestion(question.questionId) && index === parseInt(question.answer) - 1,
            'incorrect': isRandomPractice && hasAnsweredQuestion(question.questionId) && getUserAnswer(question.questionId) === index && index !== parseInt(question.answer) - 1
          }
        ]"
      >
        <input 
          type="radio" 
          :name="`question_${question.questionId}`"
          :value="index"
          :checked="getUserAnswer(question.questionId) === index"
          :disabled="isRandomPractice && hasAnsweredQuestion(question.questionId)"
          @change="handleAnswerSelect(question.questionId, index)"
        >
        <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
        <span class="option-text jp-text">{{ option.trim() }}</span>
        <img 
          v-if="getOptionImage(question, index)" 
          :src="getOptionImage(question, index)" 
          :alt="`选项${String.fromCharCode(65 + index)}图片`" 
          class="option-image"
          @load="handleImageLoad"
          @error="handleImageError"
        >
      </label>
    </div>

    <!-- 随机练习模式的反馈 -->
    <div v-if="isRandomPractice && hasAnsweredQuestion(question.questionId)" class="answer-feedback">
      <div :class="['feedback-message', isAnswerCorrect(question.questionId) ? 'correct' : 'incorrect']">
        <i :class="isAnswerCorrect(question.questionId) ? 'ri-check-circle-line' : 'ri-close-circle-line'"></i>
        {{ isAnswerCorrect(question.questionId) ? '回答正确！' : '回答错误！' }}
        <span class="correct-answer" v-if="!isAnswerCorrect(question.questionId)">
          正确答案：{{ String.fromCharCode(65 + parseInt(question.answer) - 1) }}
        </span>
      </div>
      
      <div class="feedback-actions">
        <button 
          class="btn-explanation" 
          @click="$emit('toggleExplanation', question.questionId)"
          :class="{ 'active': showExplanation[question.questionId] }"
        >
          <i :class="showExplanation[question.questionId] ? 'ri-eye-off-line' : 'ri-eye-line'"></i>
          <span class="btn-text">{{ showExplanation[question.questionId] ? '隐藏解析' : '查看解析' }}</span>
          <i class="expand-icon" :class="showExplanation[question.questionId] ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"></i>
        </button>
        
        <button 
          v-if="question.explanationUrl && hasVideoPermission"
          class="btn-video" 
          @click="playExplanationVideo"
        >
          <i class="ri-video-line"></i>
          <span class="btn-text">讲解视频</span>
          <span v-if="!hasVideoPermission" class="vip-badge">
            <i class="ri-vip-crown-2-line"></i>
          </span>
        </button>
      </div>
      
      <transition name="explanation-slide" mode="out-in">
        <div v-if="showExplanation[question.questionId]" class="explanation-content">
          <div class="explanation-card">
            <div v-if="isListeningQuestion && question.hearingText" class="explanation-section listening-section">
              <div class="explanation-header">
                <div class="explanation-title">
                  <i class="ri-volume-up-line"></i>
                  <span>听力原文</span>
                </div>
                <div class="section-badge listening-badge">听力</div>
              </div>
              <div class="explanation-body">
                <p class="jp-text hearing-text" style="white-space: pre-line">
                  {{ question.hearingText.replace(/<br>/g, '\n') }}
                </p>
              </div>
            </div>
            
            <div v-if="question.analysis" class="explanation-section analysis-section">
              <div class="explanation-header">
                <div class="explanation-title">
                  <i class="ri-lightbulb-line"></i>
                  <span>详细解析</span>
                </div>
                <div class="section-badge analysis-badge">解析</div>
              </div>
              <div class="explanation-body">
                <p class="analysis-text" style="white-space: pre-line">
                  {{ (question.analysis || '').replace(/<br>/g, '\n') }}
                </p>
              </div>
            </div>
            
            <div v-if="!question.analysis && !question.hearingText" class="explanation-section empty-section">
              <div class="explanation-header">
                <div class="explanation-title">
                  <i class="ri-information-line"></i>
                  <span>学习提示</span>
                </div>
                <div class="section-badge tip-badge">提示</div>
              </div>
              <div class="explanation-body">
                <div class="empty-content">
                  <i class="ri-book-open-line empty-icon"></i>
                  <p class="empty-text">暂无详细解析</p>
                  <p class="empty-suggestion">建议查阅相关学习资料或观看讲解视频</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 答题进度指示器 -->
    <div class="question-progress" v-if="!isRandomPractice">
      <div class="progress-indicator">
        <span class="progress-text">题目进度</span>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${getAnswerProgress()}%` }"
          ></div>
        </div>
        <span class="progress-percentage">{{ getAnswerProgress() }}%</span>
      </div>
    </div>
  </div>
  
  <!-- 视频权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showVideoPermissionDialog"
    title="扫码添加客服开通视频权限"
    dialog-class="video-permission-dialog"
  />
  <el-dialog
    v-model="showVideoDialog"
    title="视频讲解"
    width="640px"
    center
    :show-close="false"
    class="video-dialog"
    @closed="stopExplanationVideo"
  >
    <div v-if="explanationVideoUrl" class="video-container">
      <video ref="explanationVideo" controls class="explanation-video" controlsList="nodownload nofullscreen" 
        disablePictureInPicture 
        disableRemotePlayback>
        <source :src="explanationVideoUrl" type="video/mp4">
        您的设备不支持视频播放
      </video>
    </div>
    <div v-else class="no-video-message">
      <i class="ri-film-line"></i>
        <p>纯纯老师的讲解视频正在精心制作中，期待与你相见～</p>
        <p>请关注我们的企微和抖音,您的支持是我们最大的动力</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="showVideoDialog = false">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted, onMounted } from 'vue'
import { getVideoUrl } from '../../utils/crypto'
import { useAuthStore } from '../../stores/auth'
import { APP_CONFIG } from '../../config/app-config'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'
// 添加这行导入
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'
// 导入题库配置
import { questionBanks } from '../../config/questionBanks'

interface Props {
  question: any
  questionIndex: number
  groupIndex: number
  userAnswers: Record<number, number>
  isRandomPractice: boolean
  showExplanation: Record<number, boolean>
  isLastGroup: boolean
  totalQuestions?: number
  questionBankId?: number  // 新增题库ID属性
  jlptLevel?: string       // 新增JLPT等级属性
}

const props = defineProps<Props>()
const emit = defineEmits(['answerSelect', 'toggleExplanation', 'play-explanation-video'])

const authStore = useAuthStore()
const audioPlayer = ref<HTMLAudioElement | null>(null)
const audioStatus = ref('')
const currentPlaybackRate = ref(1.0)

// 收藏相关状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)
const favoriteCooldown = ref(0)
const cooldownInterval = ref<number | null>(null)

// 视频讲解状态
const showVideoDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)
const explanationVideo = ref<HTMLVideoElement | null>(null)

const isListeningQuestion = computed(() => {
  return props.question.hearingUrl !== null && props.question.hearingUrl !== undefined && props.question.hearingUrl !== ''
})

const hasVideoPermission = computed(() => {
  return (authStore.userInfo?.isPaid || 0) >= 3
})

const hasJlptLevel = () => {
  // 优先使用传递的jlptLevel prop，其次使用题目对象中的jlptLevel
  const level = props.jlptLevel || props.question.jlptLevel
  return level && level.trim() !== '' && level !== 'null' && level !== 'undefined'
}

const getJlptLevelText = () => {
  // 优先使用传递的jlptLevel prop，其次使用题目对象中的jlptLevel
  const level = props.jlptLevel || props.question.jlptLevel
  
  if (hasJlptLevel()) {
    return level
  }
  
  return ''
}

const getDifficultyClass = () => {
  // 优先使用传递的jlptLevel prop，其次使用题目对象中的jlptLevel，最后默认为N5
  const level = props.jlptLevel || props.question.jlptLevel || 'N5'
  return `difficulty-${level.toLowerCase()}`
}

const getOptionImage = (question: any, index: number) => {
  const images = [
    question.optionAImage,
    question.optionBImage,
    question.optionCImage,
    question.optionDImage
  ]
  return images[index]
}

const getUserAnswer = (questionId: number) => {
  return props.userAnswers[questionId] ?? -1
}

const hasAnsweredQuestion = (questionId: number) => {
  return typeof props.userAnswers[questionId] !== 'undefined'
}

const isAnswerCorrect = (questionId: number) => {
  return getUserAnswer(questionId) === parseInt(props.question.answer) - 1
}

const getAnswerProgress = () => {
  if (!props.totalQuestions) return 0
  const answeredCount = Object.keys(props.userAnswers).length
  return Math.round((answeredCount / props.totalQuestions) * 100)
}

const handleAnswerSelect = (questionId: number, answerIndex: number) => {
  // 当选择答案时暂停音频
  pauseAndResetAudio()
  
  props.userAnswers[questionId] = answerIndex
  emit('answerSelect', questionId)
}

const setPlaybackRate = (rate: number) => {
  currentPlaybackRate.value = rate
  if (audioPlayer.value) {
    audioPlayer.value.playbackRate = rate
    audioStatus.value = `${rate}x 倍速播放`
    setTimeout(() => {
      audioStatus.value = ''
    }, 2000)
  }
}

const onAudioPlay = (event: Event) => {
  const audio = event.target as HTMLAudioElement
  audio.playbackRate = currentPlaybackRate.value
  audioStatus.value = '播放中...'
}

const onAudioEnded = () => {
  audioStatus.value = '播放完毕'
  setTimeout(() => {
    audioStatus.value = ''
  }, 2000)
}

const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('loaded')
}

const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.classList.add('error')
  img.alt = '图片加载失败'
}

// 题库配置映射 - 用于生成收藏备注
const getQuestionBankInfo = (questionBankId: number) => {
  // 从questionBanks配置中查找对应的题库信息
  const questionBank = questionBanks.find(bank => bank.questionBankId === questionBankId)
  
  if (questionBank) {
    return {
      jlptLevel: questionBank.jlptLevel,
      question: questionBank.question,
      tixing: questionBank.tixing
    }
  }
  
  // 默认返回基本信息（如果没有找到对应的题库）
  const jlptLevel = questionBankId >= 100 && questionBankId < 200 ? 'N1' :
                   questionBankId >= 200 && questionBankId < 300 ? 'N2' :
                   questionBankId >= 300 && questionBankId < 400 ? 'N3' :
                   questionBankId >= 400 && questionBankId < 500 ? 'N4' :
                   questionBankId >= 500 && questionBankId < 600 ? 'N5' : '未知'
  
  return { jlptLevel, question: '练习题目', tixing: '综合' }
}

// 收藏相关功能
const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn || !props.question?.questionId) {
    return
  }
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.checkFavoriteStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      questionId: props.question.questionId.toString()
    })
    
    if (response.data.code === 200) {
      isFavorited.value = response.data.data.isFavorited || false
    }
  } catch (error) {
    console.error('检查收藏状态失败:', error)
  }
}

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
      const response = await axios.post(API_ENDPOINTS.favorite.removeFromFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        questionId: props.question.questionId.toString()
      })
      
      if (response.data.code === 200) {
        isFavorited.value = false
        ElMessage.success(response.data.msg || '已取消收藏')
        startCooldown()
      } else {
        ElMessage.error(response.data.msg || '取消收藏失败')
      }
    } else {
      // 获取题库信息用于生成收藏备注
      // 优先使用prop中的questionBankId，其次是题目对象中的questionBankId
      const questionBankId = props.questionBankId || props.question.questionBankId || 101 // 默认N1题库
      const questionBankInfo = getQuestionBankInfo(questionBankId)
      const favoriteNotes = `(${questionBankInfo.jlptLevel}的)${questionBankInfo.question}\n考察${questionBankInfo.tixing === '词汇' ? '汉字读音、书写和词语用法' : 
                         questionBankInfo.tixing === '文法' ? '语法形式判断和句子组织' :
                         questionBankInfo.tixing === '読解' ? '文章理解和信息检索' :
                         questionBankInfo.tixing === '聴解' ? '听力理解和即时应答' : '综合能力'}`
      
      // 添加收藏
      const response = await axios.post(API_ENDPOINTS.favorite.addToFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        questionId: props.question.questionId.toString(),
        questionBankId: questionBankId, // 使用获取的questionBankId
        favoriteLevel: 2, // 默认重要等级
        favoriteNotes: favoriteNotes, // 使用生成的详细备注
        difficultyLevel: 3 // 默认雾度
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

// 组件加载时检查收藏状态
onMounted(() => {
  checkFavoriteStatus()
})

// 冷却时间管理
const startCooldown = () => {
  // 移除3秒倒计时限制
  favoriteCooldown.value = 0
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
}

// 播放讲解视频
const playExplanationVideo = () => {
  // 检查视频权限
  if (!hasVideoPermission.value) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.question || !props.question.explanationUrl) {
    explanationVideoUrl.value = null
    showVideoDialog.value = true
    return
  }
  
  const videoUrl = getVideoUrl(props.question.explanationUrl)
  if (videoUrl) {
    explanationVideoUrl.value = videoUrl
  } else {
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
}

// 停止讲解视频
const stopExplanationVideo = () => {
  if (explanationVideo.value) {
    explanationVideo.value.pause()
    explanationVideo.value.currentTime = 0
  }
}

// 暂停并重置音频播放状态
const pauseAndResetAudio = () => {
  if (audioPlayer.value) {
    audioPlayer.value.pause()
    audioPlayer.value.currentTime = 0
  }
}

// 组件卸载时停止所有音频和视频
onUnmounted(() => {
  pauseAndResetAudio()
  stopExplanationVideo()
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
})

// 监听视频对话框关闭
watch(showVideoDialog, (newVal) => {
  if (!newVal) {
    stopExplanationVideo()
  }
})

// 导出暂停音频方法，供父组件调用
defineExpose({
  pauseAndResetAudio
})
</script>

<style lang="scss" scoped>
.question-container {
  max-width: 100%;
  margin: 0 auto;
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  border-left: 4px solid var(--primary-color);
}

.question-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  
  .question-number {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--primary-color);
  }

  .question-meta {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    min-height: 28px; // Ensure consistent height even when badge is hidden
  }
  
  .favorite-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 6px 12px;
    border: 2px solid var(--border-color);
    border-radius: 20px;
    background-color: white;
    color: var(--text-color);
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.85rem;
    font-weight: 500;
    min-width: 80px;
    height: 28px;
    margin-left: auto; // Ensure it stays on the right when badge is hidden
    
    &:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-1px);
    }
    
    &.favorited {
      background-color: #e74c3c;
      border-color: #e74c3c;
      color: white;
      
      &:hover {
        background-color: #c0392b;
        border-color: #c0392b;
        color: white;
      }
    }
    
    &.cooldown {
      background-color: #f8f9fa;
      color: #6c757d;
      border-color: #dee2e6;
      
      &:hover {
        background-color: #f8f9fa;
        color: #6c757d;
        transform: none;
      }
      
      .cooldown-text {
        font-size: 0.85rem;
        font-weight: 600;
      }
    }
    
    &:disabled {
      cursor: not-allowed;
      opacity: 0.6;
    }
    
    .loading {
      animation: spin 1s linear infinite;
    }
    
    .btn-text {
      white-space: nowrap;
    }
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.difficulty-badge {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  color: white;
  min-width: 50px;
  text-align: center;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 28px;

  &.difficulty-n1 { background-color: #9C27B0; }
  &.difficulty-n2 { background-color: #F44336; }
  &.difficulty-n3 { background-color: #FF9800; }
  &.difficulty-n4 { background-color: #2196F3; }
  &.difficulty-n5 { background-color: #4CAF50; }
  
  // 默认样式（当没有等级时）
  &:not([class*="difficulty-n"]) {
    background-color: #9E9E9E;
    color: white;
  }
}

.audio-player {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--background-color);
  border-radius: var(--border-radius);
  border-left: 4px solid var(--primary-color);
  
  audio {
    width: 100%;
    margin-bottom: var(--spacing-sm);
  }
  
  .playback-controls {
    display: flex;
    gap: var(--spacing-sm);
    justify-content: center;
    margin-bottom: var(--spacing-sm);
    
    .rate-btn {
      padding: 6px 12px;
      border: 1px solid var(--border-color);
      border-radius: 20px;
      background: white;
      cursor: pointer;
      transition: all var(--transition-fast);
      font-size: 0.9rem;
      
      &.active {
        background-color: var(--primary-color);
        color: white;
        border-color: var(--primary-color);
      }
      
      &:hover:not(.active) {
        border-color: var(--primary-color);
        color: var(--primary-color);
      }
    }
  }
  
  .audio-status {
    text-align: center;
    font-size: 0.9rem;
    color: var(--text-light);
    font-style: italic;
  }
}

.question-image {
  margin-bottom: var(--spacing-lg);
  text-align: center;

  .question-img {
    max-width: 100%;
    height: auto;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  }
}

.question-text {
  font-size: 1.2rem;
  margin-bottom: var(--spacing-lg);
  line-height: 1.8;
  color: var(--text-color);
}

.answer-options {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.option-item {
  display: flex;
  align-items: flex-start;
  padding: var(--spacing-md);
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  background-color: white;

  input {
    margin-top: 5px;
    margin-right: var(--spacing-md);
    cursor: pointer;
  }

  .option-label {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--background-color);
    color: var(--text-color);
    font-weight: 500;
    font-size: 0.9rem;
    margin-right: var(--spacing-md);
    flex-shrink: 0;
  }

  .option-text {
    flex: 1;
    font-size: 1.1rem;
    line-height: 1.6;
  }

  &:hover:not(.selected):not(.correct):not(.incorrect) {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.05);
    
    .option-label {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &.selected {
    border-color: var(--primary-color);
    background-color: rgba(74, 144, 226, 0.1);
    
    .option-label {
      background-color: var(--primary-color);
      color: white;
    }
  }

  &.correct {
    border-color: var(--success-color);
    background-color: rgba(46, 204, 113, 0.1);
    
    .option-label {
      background-color: var(--success-color);
      color: white;
    }
  }

  &.incorrect {
    border-color: var(--error-color);
    background-color: rgba(231, 76, 60, 0.1);
    
    .option-label {
      background-color: var(--error-color);
      color: white;
    }
  }

  .option-image {
    max-width: 200px;
    margin-top: var(--spacing-sm);
    border-radius: 4px;
    transition: opacity 0.3s ease;
    
    &.loaded {
      opacity: 1;
    }
    
    &.error {
      opacity: 0.5;
      filter: grayscale(100%);
    }
  }
}

.answer-feedback {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--background-color);
  border-left: 4px solid var(--primary-color);
}

.feedback-message {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-weight: 500;
  margin-bottom: var(--spacing-md);
  
  i {
    font-size: 1.2rem;
  }
  
  &.correct {
    color: var(--success-color);
  }
  
  &.incorrect {
    color: var(--error-color);
  }

  .correct-answer {
    margin-left: auto;
    font-size: 0.9rem;
    padding: 4px 8px;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 4px;
  }
}

.feedback-actions {
  display: flex;
  gap: 8px;
  margin-bottom: var(--spacing-md);
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 6px;
  }
}

.btn-explanation,
.btn-video {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: 2px solid transparent;
  font-weight: 500;
  cursor: pointer;
  padding: 10px 14px;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.85rem;
    gap: 4px;
    border-radius: 10px;
  }
  
  @media (max-width: 480px) {
    flex: 1;
    justify-content: center;
    min-width: 0;
    
    .btn-text {
      display: inline;
      font-size: 0.8rem;
    }
  }
  
  .expand-icon {
    margin-left: 2px;
    transition: transform 0.3s ease;
  }
}

.btn-explanation {
  color: var(--primary-color);
  background: linear-gradient(135deg, rgba(74, 144, 226, 0.08), rgba(74, 144, 226, 0.12));
  border-color: rgba(74, 144, 226, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, rgba(74, 144, 226, 0.15), rgba(74, 144, 226, 0.2));
    border-color: rgba(74, 144, 226, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
  }
  
  &.active {
    background: linear-gradient(135deg, var(--primary-color), #5a7bc8);
    color: white;
    border-color: var(--primary-color);
    
    .expand-icon {
      transform: rotate(180deg);
    }
  }
}

.btn-video {
  color: #ff9800;
  background: linear-gradient(135deg, rgba(255, 152, 0, 0.08), rgba(255, 152, 0, 0.12));
  border-color: rgba(255, 152, 0, 0.2);
  
  &:hover {
    background: linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(255, 152, 0, 0.2));
    border-color: rgba(255, 152, 0, 0.3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(255, 152, 0, 0.2);
  }
}

.vip-badge {
  display: flex;
  align-items: center;
  gap: 2px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: white;
  padding: 2px 6px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  margin-left: 4px;
  box-shadow: 0 2px 4px rgba(255, 107, 107, 0.3);
  
  @media (max-width: 480px) {
    flex: 1;
    justify-content: center;
    min-width: 0;
    
    .btn-text {
      display: none;  // 这里隐藏了按钮文字
    }
  }
  
  i {
    font-size: 0.8rem;
    
    @media (max-width: 480px) {
      font-size: 0.7rem;
    }
  }
}

// 解析内容动画
.explanation-slide-enter-active,
.explanation-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.explanation-slide-enter-from {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.explanation-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
}

.explanation-content {
  margin-top: var(--spacing-md);
  overflow: hidden;
}

.explanation-card {
  background: linear-gradient(135deg, #f8faff, #f0f4ff);
  border-radius: 16px;
  padding: 16px;
  border: 1px solid rgba(74, 144, 226, 0.1);
  box-shadow: 0 4px 20px rgba(74, 144, 226, 0.08);
  
  @media (max-width: 768px) {
    padding: 12px;
    border-radius: 12px;
  }
}

.explanation-section {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
}

.explanation-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 8px;
  }
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    gap: 6px;
  }
  
  i {
    font-size: 1.1rem;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
  }
}

.section-badge {
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  @media (max-width: 768px) {
    padding: 2px 6px;
    font-size: 0.65rem;
  }
}

.listening-badge {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
}

.analysis-badge {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f57c00;
}

.tip-badge {
  background: linear-gradient(135deg, #f3e5f5, #e1bee7);
  color: #7b1fa2;
}

.explanation-body {
  background: white;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    padding: 10px;
    border-radius: 8px;
  }
}

.hearing-text,
.analysis-text {
  color: var(--text-color);
  font-size: 0.95rem;
  line-height: 1.7;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}

.hearing-text {
  font-weight: 500;
  color: #1976d2;
}

.empty-content {
  text-align: center;
  padding: 20px 10px;
  
  @media (max-width: 768px) {
    padding: 16px 8px;
  }
}

.empty-icon {
  font-size: 2.5rem;
  color: var(--text-light);
  opacity: 0.6;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 8px;
  }
}

.empty-text {
  font-size: 1rem;
  color: var(--text-color);
  margin: 0 0 8px 0;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    margin-bottom: 6px;
  }
}

.empty-suggestion {
  font-size: 0.85rem;
  color: var(--text-light);
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
}

.question-progress {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
}

.progress-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  
  .progress-text {
    font-size: 0.9rem;
    color: var(--text-light);
    white-space: nowrap;
  }
  
  .progress-bar {
    flex: 1;
    height: 6px;
    background-color: var(--border-color);
    border-radius: 3px;
    overflow: hidden;
    
    .progress-fill {
      height: 100%;
      background-color: var(--primary-color);
      transition: width 0.3s ease;
    }
  }
  
  .progress-percentage {
    font-size: 0.9rem;
    color: var(--text-light);
    font-weight: 500;
    white-space: nowrap;
  }
}

.video-dialog {
  :deep(.el-dialog__header) {
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

.video-permission-dialog {
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

// 桌面端音频播放器样式优化
@media (min-width: 769px) {
  .audio-player {
    max-width: 600px;
    margin: 0 auto var(--spacing-lg) auto;
    padding: var(--spacing-lg);
    
    audio {
      height: 50px;
    }
  }
}
</style>
