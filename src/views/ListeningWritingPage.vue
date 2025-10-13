<template>
  <div class="listening-writing-page">
    <div class="container">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1>
          <i class="ri-headphone-line"></i>
          日语听力跟写练习
        </h1>
        <p>通过听力跟写练习，提升您的日语听力理解和书写能力</p>
      </div>

      <!-- 练习模式选择 -->
      <div v-if="!practiceStarted" class="mode-selection">
        <div class="mode-cards">
          <div 
            v-for="mode in practiceMode" 
            :key="mode.id"
            :class="['mode-card', { active: selectedMode === mode.id }]"
            @click="selectMode(mode.id)"
          >
            <div class="mode-icon">
              <i :class="mode.icon"></i>
            </div>
            <h3>{{ mode.name }}</h3>
            <p>{{ mode.description }}</p>
            <div class="mode-features">
              <span v-for="feature in mode.features" :key="feature" class="feature-tag">
                {{ feature }}
              </span>
            </div>
          </div>
        </div>

        <!-- 练习设置 -->
        <div class="practice-settings" v-if="selectedMode">
          <div class="settings-card">
            <h3>练习设置</h3>
            
            <!-- 等级选择 -->
            <div class="setting-group">
              <label>选择等级</label>
              <div class="level-filters">
                <button 
                  v-for="level in levelOptions" 
                  :key="level"
                  :class="['level-btn', { 
                    active: currentLevel === level,
                    disabled: !hasLevelAccess(level)
                  }]"
                  @click="handleLevelClick(level)"
                  :disabled="!hasLevelAccess(level)"
                >
                  {{ level }}
                  <i v-if="!hasLevelAccess(level)" class="ri-lock-line"></i>
                </button>
              </div>
            </div>

            <!-- 数量选择 -->
            <div class="setting-group">
              <label>{{ selectedMode === 'word' ? '单词数量' : '例句数量' }}</label>
              <select v-model="practiceCount">
                <option v-for="option in countOptions" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </div>

            <!-- 音频设置 -->
            <div class="setting-group">
              <label>音频播放设置</label>
              <div class="audio-settings">
                <div class="setting-item">
                  <label>播放速度</label>
                  <select v-model="audioSpeed">
                    <option value="0.5">0.5x</option>
                    <option value="0.75">0.75x</option>
                    <option value="1.0">1.0x</option>
                    <option value="1.25">1.25x</option>
                    <option value="1.5">1.5x</option>
                    <option value="2.0">2.0x</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label>
                    <input type="checkbox" v-model="showFurigana">
                    显示假名提示
                  </label>
                </div>
              </div>
            </div>

            <button class="btn-start-practice" @click="startPractice">
              <i class="ri-play-line"></i>
              开始练习
            </button>
          </div>
        </div>
      </div>

      <!-- 练习进行中 -->
      <div v-else-if="practiceStarted && !practiceCompleted" class="practice-content">
        <!-- 进度条 -->
        <div class="practice-header">
          <div class="progress-info">
            <span class="progress-text">{{ currentIndex + 1 }} / {{ practiceItems.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${(currentIndex + 1) / practiceItems.length * 100}%` }"></div>
            </div>
          </div>
          <button class="btn-exit" @click="exitPractice">
            <i class="ri-close-line"></i>
            退出练习
          </button>
        </div>

        <!-- 练习卡片 -->
        <div class="question-card" v-if="currentItem">
          <div class="question-header">
            <div :class="['level-badge', getLevelClass(currentItem.level)]">
              {{ currentItem.level }}
            </div>
            <div class="question-type">
              {{ selectedMode === 'word' ? '单词跟写' : '例句跟写' }}
            </div>
          </div>

          <!-- 音频播放区域 -->
          <div class="audio-section">
            <div class="audio-controls">
              <button class="play-btn" @click="playAudio" :disabled="isPlaying">
                <i :class="isPlaying ? 'ri-loader-4-line spinning' : 'ri-volume-up-line'"></i>
                {{ isPlaying ? '播放中...' : '播放音频' }}
              </button>
              <div class="speed-control">
                <label>速度:</label>
                <select v-model="audioSpeed" @change="updateAudioSpeed">
                  <option value="0.5">0.5x</option>
                  <option value="0.75">0.75x</option>
                  <option value="1.0">1.0x</option>
                  <option value="1.25">1.25x</option>
                  <option value="1.5">1.5x</option>
                  <option value="2.0">2.0x</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 输入区域 -->
          <div class="input-section" v-if="!showAnswer">
            <!-- 单词跟写模式 -->
            <div v-if="selectedMode === 'word'" class="word-input">
              <div class="form-group">
                <label>请输入您听到的日语单词：</label>
                <div class="input-container">
                  <!-- 手写输入区域 -->
                  <div class="handwriting-area" v-if="inputMethod === 'handwriting'">
                    <canvas 
                      ref="handwritingCanvas" 
                      class="handwriting-canvas"
                      @mousedown="startDrawing"
                      @mousemove="draw"
                      @mouseup="stopDrawing"
                      @touchstart="startDrawing"
                      @touchmove="draw"
                      @touchend="stopDrawing"
                    ></canvas>
                    <div class="handwriting-controls">
                      <button @click="clearCanvas" class="btn-clear">
                        <i class="ri-eraser-line"></i>
                        清除
                      </button>
                      <button @click="recognizeHandwriting" class="btn-recognize">
                        <i class="ri-search-line"></i>
                        识别
                      </button>
                    </div>
                  </div>
                  
                  <!-- 键盘输入 -->
                  <textarea 
                    v-else
                    v-model="userInput" 
                    rows="2" 
                    placeholder="请在此输入日语单词..."
                    class="text-input"
                  ></textarea>
                </div>
                
                <div class="input-method-toggle">
                  <button 
                    :class="['method-btn', { active: inputMethod === 'keyboard' }]"
                    @click="inputMethod = 'keyboard'"
                  >
                    <i class="ri-keyboard-line"></i>
                    键盘输入
                  </button>
                  <button 
                    :class="['method-btn', { active: inputMethod === 'handwriting' }]"
                    @click="inputMethod = 'handwriting'"
                  >
                    <i class="ri-pencil-line"></i>
                    手写输入
                  </button>
                </div>
              </div>
            </div>

            <!-- 例句跟写模式 -->
            <div v-else class="sentence-input">
              <div class="form-group">
                <label>请输入您听到的日语例句：</label>
                
                <!-- 分词显示区域 -->
                <div class="segmented-input">
                  <div class="segments">
                    <span 
                      v-for="(segment, index) in sentenceSegments" 
                      :key="index"
                      :class="['segment', getSegmentClass(segment, index)]"
                    >
                      <input 
                        v-if="segment.isInput"
                        v-model="segment.userInput"
                        :placeholder="'_'.repeat(segment.length)"
                        @input="checkSegmentInput(segment, index)"
                        class="segment-input"
                      >
                      <span v-else class="segment-text">{{ segment.text }}</span>
                    </span>
                  </div>
                </div>
                
                <!-- 错误提示 -->
                <div v-if="consecutiveErrors >= 5" class="error-hint">
                  <i class="ri-lightbulb-line"></i>
                  提示：正确答案是 "{{ currentItem.correctAnswer }}"
                </div>
              </div>
            </div>

            <!-- 假名提示 -->
            <div v-if="showFurigana && hasPermission('furigana')" class="furigana-hint">
              <span class="hint-label">假名提示：</span>
              <span class="furigana-text">{{ currentItem.furigana }}</span>
            </div>

            <div class="action-buttons">
              <button class="btn-submit" @click="submitAnswer" :disabled="!canSubmit">
                <i class="ri-check-line"></i>
                提交答案
              </button>
              <button class="btn-skip" @click="skipQuestion">
                <i class="ri-skip-forward-line"></i>
                跳过
              </button>
            </div>
          </div>

          <!-- 答案显示 -->
          <div v-else class="answer-section">
            <div :class="['answer-result', { correct: isCorrect, incorrect: !isCorrect }]">
              <div class="result-icon">
                <i :class="isCorrect ? 'ri-check-line' : 'ri-close-line'"></i>
              </div>
              <div class="result-text">
                <h4>{{ isCorrect ? '回答正确！' : '回答错误' }}</h4>
                <p v-if="!isCorrect">正确答案：{{ currentItem.correctAnswer }}</p>
              </div>
            </div>
            
            <div class="answer-details">
              <div class="detail-item">
                <label>您的答案：</label>
                <span :class="{ correct: isCorrect, incorrect: !isCorrect }">{{ userInput }}</span>
              </div>
              <div class="detail-item">
                <label>正确答案：</label>
                <span class="correct">{{ currentItem.correctAnswer }}</span>
              </div>
              <div v-if="currentItem.meaning" class="detail-item">
                <label>中文意思：</label>
                <span>{{ currentItem.meaning }}</span>
              </div>
            </div>

            <button class="btn-next" @click="nextQuestion">
              {{ isLastQuestion ? '完成练习' : '下一题' }}
              <i :class="isLastQuestion ? 'ri-flag-line' : 'ri-arrow-right-line'"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- 练习完成 -->
      <div v-else-if="practiceCompleted" class="practice-results">
        <div class="results-card">
          <div class="results-header">
            <div class="celebration-icon">
              <i class="ri-trophy-line"></i>
            </div>
            <h2>练习完成！</h2>
            <p>恭喜您完成了本次听力跟写练习</p>
          </div>

          <div class="results-stats">
            <div class="stat-item">
              <div class="stat-value">{{ correctCount }}</div>
              <div class="stat-label">正确题数</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ Math.round(accuracy) }}%</div>
              <div class="stat-label">正确率</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ formatTime(practiceTime) }}</div>
              <div class="stat-label">用时</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ averageScore }}</div>
              <div class="stat-label">平均分</div>
            </div>
          </div>

          <div class="results-feedback">
            <div :class="['feedback-card', getFeedbackLevel()]">
              <h3>{{ getFeedbackTitle() }}</h3>
              <p>{{ getFeedbackMessage() }}</p>
            </div>
          </div>

          <div class="results-actions">
            <button class="btn-retry" @click="retryPractice">
              <i class="ri-refresh-line"></i>
              再次练习
            </button>
            <button class="btn-back" @click="backToHome">
              <i class="ri-home-line"></i>
              返回首页
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 权限提示弹窗 -->
    <div v-if="showPermissionDialog" class="permission-dialog-overlay" @click="closePermissionDialog">
      <div class="permission-dialog" @click.stop>
        <div class="dialog-header">
          <h3>权限提示</h3>
          <button class="close-btn" @click="closePermissionDialog">
            <i class="ri-close-line"></i>
          </button>
        </div>
        <div class="dialog-body">
          <p>{{ permissionMessage }}</p>
        </div>
        <div class="dialog-footer">
          <button class="btn-understand" @click="closePermissionDialog">
            我知道了
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { playWordAudio, playExampleAudio, stopAllAudio } from '../utils/audio'
import { ElMessage } from 'element-plus'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 练习模式配置
const practiceMode = [
  {
    id: 'word',
    name: '单词跟写练习',
    description: '听日语单词，练习书写',
    icon: 'ri-font-size-2',
    features: ['单词听力', '书写练习', '假名识别']
  },
  {
    id: 'sentence',
    name: '例句跟写练习', 
    description: '听日语例句，练习完整句子书写',
    icon: 'ri-file-text-line',
    features: ['例句听力', '分词输入', '语法理解']
  }
]

// 响应式数据
const selectedMode = ref('')
const practiceStarted = ref(false)
const practiceCompleted = ref(false)
const currentLevel = ref('全部')
const practiceCount = ref('12')
const audioSpeed = ref(1.0)
const showFurigana = ref(false)
const inputMethod = ref('keyboard')

// 练习数据
const practiceItems = ref([])
const currentIndex = ref(0)
const userInput = ref('')
const showAnswer = ref(false)
const isCorrect = ref(false)
const consecutiveErrors = ref(0)
const practiceResults = ref([])
const practiceStartTime = ref(0)

// 音频相关
const isPlaying = ref(false)
const currentAudio = ref(null)

// 手写相关
const handwritingCanvas = ref(null)
const isDrawing = ref(false)
const drawingContext = ref(null)

// 例句分词
const sentenceSegments = ref([])

// 权限相关
const showPermissionDialog = ref(false)
const permissionMessage = ref('')

// 配置选项
const levelOptions = ['全部', 'N5', 'N4', 'N3', 'N2', 'N1']
const countOptions = [
  { value: '12', label: '12个' },
  { value: '20', label: '20个' },
  { value: '30', label: '30个' }
]

// 计算属性
const currentItem = computed(() => {
  return practiceItems.value[currentIndex.value] || null
})

const isLastQuestion = computed(() => {
  return currentIndex.value >= practiceItems.value.length - 1
})

const canSubmit = computed(() => {
  if (selectedMode.value === 'word') {
    return userInput.value.trim().length > 0
  } else {
    return sentenceSegments.value.every(segment => 
      !segment.isInput || segment.userInput.trim().length > 0
    )
  }
})

const correctCount = computed(() => {
  return practiceResults.value.filter(result => result.isCorrect).length
})

const accuracy = computed(() => {
  if (practiceResults.value.length === 0) return 0
  return (correctCount.value / practiceResults.value.length) * 100
})

const practiceTime = computed(() => {
  return Date.now() - practiceStartTime.value
})

const averageScore = computed(() => {
  if (practiceResults.value.length === 0) return 0
  const totalScore = practiceResults.value.reduce((sum, result) => sum + result.score, 0)
  return Math.round(totalScore / practiceResults.value.length)
})

// 方法实现
const selectMode = (mode: string) => {
  selectedMode.value = mode
}

const hasLevelAccess = (level: string) => {
  if (level === '全部' || level === 'N5') return true
  return (authStore.userInfo?.isPaid || 0) >= 1
}

const handleLevelClick = (level: string) => {
  if (!hasLevelAccess(level)) {
    showPermissionDialog.value = true
    permissionMessage.value = '该等级需要会员权限，请升级会员后使用'
    return
  }
  currentLevel.value = level
}

const hasPermission = (type: string) => {
  switch (type) {
    case 'audio':
      return (authStore.userInfo?.isPaid || 0) >= 2
    case 'furigana':
      return (authStore.userInfo?.isPaid || 0) >= 1
    default:
      return true
  }
}

const startPractice = async () => {
  if (!selectedMode.value) {
    ElMessage.warning('请先选择练习模式')
    return
  }
  
  try {
    // 获取练习数据
    await fetchPracticeData()
    
    practiceStarted.value = true
    practiceStartTime.value = Date.now()
    currentIndex.value = 0
    practiceResults.value = []
    
    // 初始化第一题
    initCurrentQuestion()
  } catch (error) {
    ElMessage.error('获取练习数据失败，请稍后重试')
  }
}

const fetchPracticeData = async () => {
  // 模拟API调用，实际应该从后端获取数据
  // 这里使用示例数据
  const mockData = [
    {
      id: 1,
      level: 'N5',
      word: 'こんにちは',
      meaning: '你好',
      furigana: 'こんにちは',
      audioUrl: 'example-audio-url',
      correctAnswer: 'こんにちは'
    },
    // 更多示例数据...
  ]
  
  practiceItems.value = mockData
}

const initCurrentQuestion = () => {
  userInput.value = ''
  showAnswer.value = false
  isCorrect.value = false
  
  if (selectedMode.value === 'sentence') {
    initSentenceSegments()
  }
}

const initSentenceSegments = () => {
  // 简单的日语分词实现
  const sentence = currentItem.value.correctAnswer
  // 这里应该使用专业的日语分词器
  // 暂时使用简单的字符分割
  sentenceSegments.value = sentence.split('').map((char, index) => ({
    text: char,
    isInput: true,
    userInput: '',
    length: 1,
    isCorrect: false
  }))
}

const playAudio = async () => {
  if (!hasPermission('audio')) {
    showPermissionDialog.value = true
    permissionMessage.value = '音频播放功能需要高级会员权限'
    return
  }
  
  if (!currentItem.value || isPlaying.value) return
  
  try {
    isPlaying.value = true
    
    if (selectedMode.value === 'word') {
      await playWordAudio(
        currentItem.value.audioUrl,
        () => { /* onPlay */ },
        () => { isPlaying.value = false },
        () => { isPlaying.value = false }
      )
    } else {
      await playExampleAudio(
        currentItem.value.audioUrl,
        0,
        () => { /* onPlay */ },
        () => { isPlaying.value = false },
        () => { isPlaying.value = false }
      )
    }
    
    // 设置播放速度
    if (currentAudio.value) {
      currentAudio.value.playbackRate = audioSpeed.value
    }
  } catch (error) {
    isPlaying.value = false
    ElMessage.error('音频播放失败')
  }
}

const updateAudioSpeed = () => {
  if (currentAudio.value) {
    currentAudio.value.playbackRate = audioSpeed.value
  }
}

const submitAnswer = () => {
  if (!canSubmit.value) return
  
  let userAnswer = ''
  let correctAnswer = currentItem.value.correctAnswer
  
  if (selectedMode.value === 'word') {
    userAnswer = userInput.value.trim()
  } else {
    userAnswer = sentenceSegments.value.map(segment => 
      segment.isInput ? segment.userInput : segment.text
    ).join('')
  }
  
  // 计算相似度
  const similarity = calculateSimilarity(userAnswer, correctAnswer)
  isCorrect.value = similarity >= 0.8 // 80%相似度认为正确
  
  if (!isCorrect.value) {
    consecutiveErrors.value++
  } else {
    consecutiveErrors.value = 0
    // 播放成功音效
    playSuccessSound()
  }
  
  // 记录结果
  practiceResults.value.push({
    question: currentItem.value,
    userAnswer,
    correctAnswer,
    isCorrect: isCorrect.value,
    score: isCorrect.value ? 100 : Math.round(similarity * 100),
    time: Date.now() - practiceStartTime.value
  })
  
  showAnswer.value = true
}

const calculateSimilarity = (text1: string, text2: string): number => {
  // 简单的相似度计算
  if (text1 === text2) return 1.0
  
  const len1 = text1.length
  const len2 = text2.length
  const maxLen = Math.max(len1, len2)
  
  if (maxLen === 0) return 1.0
  
  let matches = 0
  for (let i = 0; i < Math.min(len1, len2); i++) {
    if (text1[i] === text2[i]) matches++
  }
  
  return matches / maxLen
}

const checkSegmentInput = (segment: any, index: number) => {
  const correctChar = currentItem.value.correctAnswer[index]
  segment.isCorrect = segment.userInput === correctChar
}

const getSegmentClass = (segment: any, index: number) => {
  if (!segment.isInput) return ''
  if (segment.userInput === '') return ''
  return segment.isCorrect ? 'correct' : 'incorrect'
}

const skipQuestion = () => {
  // 记录跳过的题目
  practiceResults.value.push({
    question: currentItem.value,
    userAnswer: '跳过',
    correctAnswer: currentItem.value.correctAnswer,
    isCorrect: false,
    score: 0,
    time: Date.now() - practiceStartTime.value
  })
  
  nextQuestion()
}

const nextQuestion = () => {
  if (isLastQuestion.value) {
    completePractice()
  } else {
    currentIndex.value++
    initCurrentQuestion()
  }
}

const completePractice = () => {
  practiceCompleted.value = true
  stopAllAudio()
  
  // 显示庆祝特效
  showCelebrationEffect()
}

const playSuccessSound = () => {
  // 播放成功音效
  const audio = new Audio('/success-sound.mp3')
  audio.play().catch(() => {})
}

const showCelebrationEffect = () => {
  // 显示庆祝动画效果
  // 可以使用CSS动画或第三方动画库
}

const getLevelClass = (level: string) => {
  const levelMap: Record<string, string> = {
    'N1': 'level-n1',
    'N2': 'level-n2', 
    'N3': 'level-n3',
    'N4': 'level-n4',
    'N5': 'level-n5'
  }
  return levelMap[level] || 'level-default'
}

const getFeedbackLevel = () => {
  if (accuracy.value >= 90) return 'excellent'
  if (accuracy.value >= 70) return 'good'
  if (accuracy.value >= 50) return 'average'
  return 'poor'
}

const getFeedbackTitle = () => {
  const level = getFeedbackLevel()
  const titles = {
    excellent: '太棒了！',
    good: '做得不错！',
    average: '继续加油！',
    poor: '需要努力！'
  }
  return titles[level]
}

const getFeedbackMessage = () => {
  const level = getFeedbackLevel()
  const messages = {
    excellent: '您的听力跟写能力非常出色，继续保持！',
    good: '您的听力跟写能力很好，再接再厉！',
    average: '您的听力跟写能力有待提高，建议多加练习。',
    poor: '您的听力跟写能力需要加强，建议多听多练。'
  }
  return messages[level]
}

const formatTime = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const retryPractice = () => {
  practiceStarted.value = false
  practiceCompleted.value = false
  currentIndex.value = 0
  practiceResults.value = []
  consecutiveErrors.value = 0
}

const backToHome = () => {
  router.push('/')
}

const exitPractice = () => {
  if (confirm('确定要退出练习吗？当前进度将不会保存。')) {
    retryPractice()
  }
}

const closePermissionDialog = () => {
  showPermissionDialog.value = false
  permissionMessage.value = ''
}

// 手写相关方法
const initHandwritingCanvas = () => {
  if (!handwritingCanvas.value) return
  
  const canvas = handwritingCanvas.value
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width
  canvas.height = rect.height
  
  drawingContext.value = canvas.getContext('2d')
  drawingContext.value.strokeStyle = '#333'
  drawingContext.value.lineWidth = 2
  drawingContext.value.lineCap = 'round'
}

const startDrawing = (event: MouseEvent | TouchEvent) => {
  isDrawing.value = true
  const pos = getEventPos(event)
  drawingContext.value.beginPath()
  drawingContext.value.moveTo(pos.x, pos.y)
}

const draw = (event: MouseEvent | TouchEvent) => {
  if (!isDrawing.value) return
  
  const pos = getEventPos(event)
  drawingContext.value.lineTo(pos.x, pos.y)
  drawingContext.value.stroke()
}

const stopDrawing = () => {
  isDrawing.value = false
}

const getEventPos = (event: MouseEvent | TouchEvent) => {
  const canvas = handwritingCanvas.value
  const rect = canvas.getBoundingClientRect()
  
  if (event instanceof MouseEvent) {
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    }
  } else {
    const touch = event.touches[0] || event.changedTouches[0]
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    }
  }
}

const clearCanvas = () => {
  if (!drawingContext.value || !handwritingCanvas.value) return
  
  drawingContext.value.clearRect(0, 0, handwritingCanvas.value.width, handwritingCanvas.value.height)
}

const recognizeHandwriting = async () => {
  // 手写识别功能
  // 这里应该调用手写识别API
  ElMessage.info('手写识别功能开发中...')
}

// 生命周期
onMounted(() => {
  nextTick(() => {
    initHandwritingCanvas()
  })
})

onUnmounted(() => {
  stopAllAudio()
})
</script>

<style lang="scss" scoped>
.listening-writing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
  
  h1 {
    font-size: 2.5rem;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    
    i {
      font-size: 2.2rem;
    }
  }
  
  p {
    font-size: 1.1rem;
    opacity: 0.9;
  }
}

.mode-selection {
  .mode-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .mode-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 3px solid transparent;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    &.active {
      border-color: var(--primary-color);
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
    }
    
    .mode-icon {
      font-size: 3rem;
      margin-bottom: 15px;
      color: var(--primary-color);
      
      .active & {
        color: white;
      }
    }
    
    h3 {
      font-size: 1.3rem;
      margin-bottom: 10px;
    }
    
    p {
      color: #666;
      margin-bottom: 15px;
      
      .active & {
        color: rgba(255, 255, 255, 0.9);
      }
    }
    
    .mode-features {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      
      .feature-tag {
        background: #f0f0f0;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.8rem;
        color: #666;
        
        .active & {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }
      }
    }
  }
}

.practice-settings {
  .settings-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    
    h3 {
      margin-bottom: 20px;
      color: var(--primary-color);
    }
    
    .setting-group {
      margin-bottom: 20px;
      
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #333;
      }
      
      select {
        width: 100%;
        padding: 10px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 1rem;
        
        &:focus {
          outline: none;
          border-color: var(--primary-color);
        }
      }
    }
    
    .level-filters {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      
      .level-btn {
        padding: 8px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 20px;
        background: white;
        cursor: pointer;
        transition: all 0.2s;
        
        &:hover:not(.disabled) {
          border-color: var(--primary-color);
        }
        
        &.active {
          background: var(--primary-color);
          color: white;
          border-color: var(--primary-color);
        }
        
        &.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      }
    }
    
    .audio-settings {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      
      .setting-item {
        label {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 0;
          
          input[type="checkbox"] {
            margin: 0;
          }
        }
      }
    }
    
    .btn-start-practice {
      width: 100%;
      padding: 15px;
      background: linear-gradient(135deg, #4CAF50, #45a049);
      color: white;
      border: none;
      border-radius: 25px;
      font-size: 1.1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
      }
    }
  }
}

.practice-content {
  .practice-header {
    background: white;
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    .progress-info {
      flex: 1;
      
      .progress-text {
        font-weight: 500;
        margin-bottom: 8px;
        display: block;
      }
      
      .progress-bar {
        height: 8px;
        background: #e0e0e0;
        border-radius: 4px;
        overflow: hidden;
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color), #4CAF50);
          transition: width 0.3s ease;
        }
      }
    }
    
    .btn-exit {
      padding: 8px 16px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 5px;
      
      &:hover {
        background: #d32f2f;
      }
    }
  }
  
  .question-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    
    .question-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
      
      .level-badge {
        padding: 6px 12px;
        border-radius: 15px;
        font-size: 0.9rem;
        font-weight: 500;
        
        &.level-n1 { background: #f44336; color: white; }
        &.level-n2 { background: #ff9800; color: white; }
        &.level-n3 { background: #ffeb3b; color: #333; }
        &.level-n4 { background: #4caf50; color: white; }
        &.level-n5 { background: #2196f3; color: white; }
      }
      
      .question-type {
        color: #666;
        font-size: 0.9rem;
      }
    }
    
    .audio-section {
      text-align: center;
      margin-bottom: 30px;
      
      .audio-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        
        .play-btn {
          padding: 15px 30px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 25px;
          font-size: 1.1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: all 0.3s;
          
          &:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
          }
          
          &:disabled {
            opacity: 0.7;
            cursor: not-allowed;
          }
          
          .spinning {
            animation: spin 1s linear infinite;
          }
        }
        
        .speed-control {
          display: flex;
          align-items: center;
          gap: 8px;
          
          label {
            font-size: 0.9rem;
            color: #666;
          }
          
          select {
            padding: 5px 10px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
        }
      }
    }
    
    .input-section {
      .form-group {
        margin-bottom: 20px;
        
        label {
          display: block;
          margin-bottom: 10px;
          font-weight: 500;
          color: #333;
        }
        
        .input-container {
          .handwriting-area {
            border: 2px dashed #ddd;
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            
            .handwriting-canvas {
              width: 100%;
              height: 200px;
              border: 1px solid #eee;
              border-radius: 5px;
              cursor: crosshair;
            }
            
            .handwriting-controls {
              margin-top: 10px;
              display: flex;
              justify-content: center;
              gap: 10px;
              
              button {
                padding: 8px 16px;
                border: 1px solid #ddd;
                border-radius: 5px;
                background: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 5px;
                
                &:hover {
                  background: #f5f5f5;
                }
              }
            }
          }
          
          .text-input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1.1rem;
            resize: vertical;
            
            &:focus {
              outline: none;
              border-color: var(--primary-color);
            }
          }
        }
        
        .input-method-toggle {
          margin-top: 10px;
          display: flex;
          gap: 10px;
          
          .method-btn {
            padding: 8px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 20px;
            background: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
            transition: all 0.2s;
            
            &:hover {
              border-color: var(--primary-color);
            }
            
            &.active {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }
          }
        }
      }
      
      .segmented-input {
        .segments {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          align-items: center;
          
          .segment {
            display: inline-block;
            
            .segment-input {
              padding: 5px 8px;
              border: 2px solid #e0e0e0;
              border-radius: 5px;
              text-align: center;
              font-size: 1.1rem;
              width: 40px;
              
              &:focus {
                outline: none;
                border-color: var(--primary-color);
              }
            }
            
            .segment-text {
              padding: 5px 8px;
              color: #666;
            }
            
            &.correct .segment-input {
              border-color: #4CAF50;
              background: #e8f5e8;
            }
            
            &.incorrect .segment-input {
              border-color: #f44336;
              background: #ffeaea;
            }
          }
        }
      }
      
      .error-hint {
        background: #fff3cd;
        border: 1px solid #ffeaa7;
        border-radius: 8px;
        padding: 10px;
        margin-top: 10px;
        display: flex;
        align-items: center;
        gap: 8px;
        color: #856404;
        
        i {
          color: #f39c12;
        }
      }
      
      .furigana-hint {
        background: #e3f2fd;
        border-radius: 8px;
        padding: 10px;
        margin-top: 10px;
        
        .hint-label {
          font-weight: 500;
          color: #1976d2;
        }
        
        .furigana-text {
          font-size: 1.1rem;
          color: #333;
        }
      }
      
      .action-buttons {
        display: flex;
        gap: 15px;
        margin-top: 20px;
        
        button {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
          
          &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }
        
        .btn-submit {
          background: #4CAF50;
          color: white;
          
          &:hover:not(:disabled) {
            background: #45a049;
          }
        }
        
        .btn-skip {
          background: #ff9800;
          color: white;
          
          &:hover {
            background: #f57c00;
          }
        }
      }
    }
    
    .answer-section {
      .answer-result {
        text-align: center;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
        
        &.correct {
          background: #e8f5e8;
          border: 2px solid #4CAF50;
          
          .result-icon {
            color: #4CAF50;
          }
        }
        
        &.incorrect {
          background: #ffeaea;
          border: 2px solid #f44336;
          
          .result-icon {
            color: #f44336;
          }
        }
        
        .result-icon {
          font-size: 3rem;
          margin-bottom: 10px;
        }
        
        .result-text {
          h4 {
            margin-bottom: 5px;
          }
        }
      }
      
      .answer-details {
        .detail-item {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
          
          label {
            font-weight: 500;
            min-width: 80px;
          }
          
          span {
            &.correct {
              color: #4CAF50;
              font-weight: 500;
            }
            
            &.incorrect {
              color: #f44336;
              font-weight: 500;
            }
          }
        }
      }
      
      .btn-next {
        width: 100%;
        padding: 15px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        margin-top: 20px;
        
        &:hover {
          background: #5a67d8;
        }
      }
    }
  }
}

.practice-results {
  .results-card {
    background: white;
    border-radius: 15px;
    padding: 40px;
    text-align: center;
    
    .results-header {
      margin-bottom: 30px;
      
      .celebration-icon {
        font-size: 4rem;
        color: #FFD700;
        margin-bottom: 15px;
        animation: bounce 2s infinite;
      }
      
      h2 {
        color: var(--primary-color);
        margin-bottom: 10px;
      }
      
      p {
        color: #666;
      }
    }
    
    .results-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
      
      .stat-item {
        .stat-value {
          font-size: 2rem;
          font-weight: bold;
          color: var(--primary-color);
          margin-bottom: 5px;
        }
        
        .stat-label {
          color: #666;
          font-size: 0.9rem;
        }
      }
    }
    
    .results-feedback {
      margin-bottom: 30px;
      
      .feedback-card {
        padding: 20px;
        border-radius: 10px;
        
        &.excellent {
          background: #e8f5e8;
          border: 2px solid #4CAF50;
        }
        
        &.good {
          background: #e3f2fd;
          border: 2px solid #2196F3;
        }
        
        &.average {
          background: #fff3e0;
          border: 2px solid #ff9800;
        }
        
        &.poor {
          background: #ffeaea;
          border: 2px solid #f44336;
        }
        
        h3 {
          margin-bottom: 10px;
        }
      }
    }
    
    .results-actions {
      display: flex;
      gap: 15px;
      
      button {
        flex: 1;
        padding: 15px;
        border: none;
        border-radius: 8px;
        font-size: 1rem;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s;
      }
      
      .btn-retry {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      }
      
      .btn-back {
        background: #666;
        color: white;
        
        &:hover {
          background: #555;
        }
      }
    }
  }
}

.permission-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  .permission-dialog {
    background: white;
    border-radius: 15px;
    max-width: 400px;
    width: 90%;
    
    .dialog-header {
      padding: 20px 20px 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      h3 {
        margin: 0;
        color: var(--primary-color);
      }
      
      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
        
        &:hover {
          color: #666;
        }
      }
    }
    
    .dialog-body {
      padding: 20px;
      
      p {
        margin: 0;
        color: #666;
        line-height: 1.5;
      }
    }
    
    .dialog-footer {
      padding: 0 20px 20px;
      text-align: center;
      
      .btn-understand {
        padding: 10px 20px;
        background: var(--primary-color);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        
        &:hover {
          background: #5a67d8;
        }
      }
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .mode-cards {
    grid-template-columns: 1fr;
  }
  
  .practice-content .question-card {
    padding: 20px;
  }
  
  .audio-controls {
    flex-direction: column;
    gap: 15px;
  }
  
  .results-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .results-actions {
    flex-direction: column;
  }
}
</style>