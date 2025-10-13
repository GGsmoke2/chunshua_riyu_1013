<template>
  <div class="practice-detail">
    <ExamIntro
      v-if="!examStarted && !examCompleted"
      :currentQuestion="currentQuestion"
      :timeLimit="timeLimit"
      @startRandomPractice="startRandomPractice"
      @startMockTest="startMockTest"
      @startFavoritePractice="startFavoritePractice"
      @startWrongPractice="startWrongPractice"
    />

    <div v-else-if="examStarted && !examCompleted" class="exam-content">
      <ExamHeader
        :currentGroupIndex="currentGroupIndex"
        :totalGroups="totalGroups"
        :currentQuestionIndex="currentQuestionIndex"
        :questions="questions"
        :isCombinationQuestion="isCombinationQuestion"
        :isRandomPractice="isRandomPractice"
        :remainingTime="remainingTime"
      />

      <div class="container">
        <QuestionGroup
          v-for="(group, groupIndex) in questionGroups"
          :key="groupIndex"
          :group="group"
          :groupIndex="groupIndex"
          :isActive="currentGroupIndex === groupIndex"
          :userAnswers="userAnswers"
          :isRandomPractice="isRandomPractice || isFavoritePractice || isWrongPractice"
          :showExplanation="showExplanation"
          :isLastGroup="isLastGroup"
          :playbackRate="playbackRate"
          :jlptLevel="jlptLevel"
          :totalQuestions="questions.length"
          :questionBankId="group[0]?.questionBankId"
          @answerSelect="handleAnswerSelect"
          @toggleExplanation="toggleExplanation"
          ref="questionGroupRefs"
        />

        <!-- 导航按钮 -->
        <div class="question-navigation" v-if="!isRandomPractice || isFavoritePractice || isWrongPractice || questionGroups.length > 1">
          <button 
            class="nav-btn prev" 
            @click="prevGroup"
            :disabled="isFirstGroup"
          >
            <i class="ri-arrow-left-s-line"></i>
            上一题
          </button>
          
          <div class="nav-info">
            <span class="current-group">第 {{ currentGroupIndex + 1 }} 题</span>
            <span class="total-groups">共 {{ totalGroups }} 题</span>
          </div>
          
          <button 
            class="nav-btn next" 
            @click="nextGroup"
            :disabled="isLastGroup"
          >
            下一题
            <i class="ri-arrow-right-s-line"></i>
          </button>
        </div>

        <!-- 随机练习提交按钮 -->
        <div v-if="(isRandomPractice || isFavoritePractice || isWrongPractice) && isLastGroup && hasAnsweredCurrentGroup" class="random-submit-section">
          <div class="submit-info">
            <p>已完成 {{ getAnsweredCount() }} / {{ questions.length }} 题</p>
            <p v-if="getUnansweredCount() > 0" class="warning-text">
              还有 {{ getUnansweredCount() }} 题未完成，提交后将在报告中单独显示
            </p>
          </div>
          <button 
            class="btn-submit-random" 
            @click="submitRandomPractice"
          >
            <i class="ri-send-plane-line"></i>
            提交练习
          </button>
        </div>

        <!-- 答题进度总览 -->
        <div class="exam-progress-overview" v-if="!isRandomPractice && !isFavoritePractice && !isWrongPractice">
          <h3>答题进度</h3>
          <div class="progress-grid">
            <div 
              v-for="(question, index) in questions" 
              :key="question.questionId"
              :class="['progress-item', {
                'answered': hasAnsweredQuestion(question.questionId),
                'current': currentQuestionIndex === index  // 直接使用 ref 变量
              }]"
              @click="jumpToQuestion(index)"
            >
              {{ index + 1 }}
            </div>
          </div>
          <div class="progress-summary">
            <span>已答题：{{ getAnsweredCount() }} / {{ questions.length }}</span>
            <span>完成度：{{ Math.round((getAnsweredCount() / questions.length) * 100) }}%</span>
          </div>
        </div>

        <div class="exam-actions" v-if="!isRandomPractice && !isFavoritePractice && !isWrongPractice">
          <button 
            class="btn-submit" 
            @click="submitExam"
            :disabled="!canSubmit"
          >
            <div class="submit-content">
              <i class="ri-send-plane-line"></i>
              <span class="submit-text">提交答案</span>
              <span class="submit-count">({{ getAnsweredCount() }}/{{ questions.length }})</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <ExamResults
      v-else
      :isRandomPractice="isRandomPractice"
      :examResults="examResults"
      :questionGroups="questionGroups"
      :userAnswers="userAnswers"
      :jlptLevel="jlptLevel"
      @backToPractice="backToPractice"
      @retryExam="retryExam"
    />
    
    <!-- 全局加载动画 -->
    <LoadingSpinner 
      :show="globalLoading" 
      text="加载题目中..."
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import LoadingSpinner from '../components/common/LoadingSpinner.vue'
import { FEATURE_FLAGS } from '../config/features'
import { getVideoUrl } from '../utils/crypto'
import { trackEvent, EVENT_TYPES } from '../utils/eventTracking'
import ExamIntro from '../components/practice/ExamIntro.vue'
import ExamHeader from '../components/practice/ExamHeader.vue'
import QuestionGroup from '../components/practice/QuestionGroup.vue'
import ExamResults from '../components/practice/ExamResults.vue'
import { API_ENDPOINTS } from '../config/api'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

interface Question {
  questionId: number
  questionDescription: string
  questionStem: string
  options: string
  optionAImage: string | null
  optionBImage: string | null
  optionCImage: string | null
  optionDImage: string | null
  gid: number
  answer: string
  analysis: string | null
  questionStemImage: string | null
  hearingText: string | null
  hearingUrl: string | null
  explanationUrl: string | null
  explanationUrlStem: string | null
  questionStemText: string | null
  hearingTextUrl: string | null
  questionBankId?: number 
  apiEndpoint?: string 
  jlptLevel?: string
  tixing?: string
}

const timeLimit = 30 
const examStarted = ref(false)
const examCompleted = ref(false)
const currentGroupIndex = ref(0)
const remainingTime = ref(timeLimit * 60)
const userAnswers = ref<Record<number, number>>({})
const timer = ref<number | null>(null)
const questions = ref<Question[]>([])
const currentQuestion = ref<Question | null>(null)
const isRandomPractice = ref(false)
const isFavoritePractice = ref(false)
const isWrongPractice = ref(false)
const showExplanation = ref<Record<number, boolean>>({})
const playbackRate = ref(1.0)
const jlptLevel = ref('')
const questionGroupRefs = ref<any[]>([])
const globalLoading = ref(false)

const examResults = ref({
  score: 0,
  correctCount: 0,
  accuracy: 0,
  timeSpent: 0
})

// 组合题相关计算属性
const questionGroups = computed(() => {
  const groups: Question[][] = []
  const groupGids = new Set(questions.value.map(q => q.gid))
  
  groupGids.forEach(gid => {
    groups.push(questions.value.filter(q => q.gid === gid))
  })
  return groups
})

const totalGroups = computed(() => questionGroups.value.length)
const isCombinationQuestion = computed(() => {
  // 检查是否存在任何一个组包含多个题目
  return questionGroups.value.some(group => group.length > 1)
})
const isFirstGroup = computed(() => currentGroupIndex.value === 0)
const isLastGroup = computed(() => currentGroupIndex.value === totalGroups.value - 1)

const canSubmit = computed(() => {
  return questions.value.every(q => typeof userAnswers.value[q.questionId] !== 'undefined')
})

// 检查当前组是否已回答
const hasAnsweredCurrentGroup = computed(() => {
  if (!questionGroups.value[currentGroupIndex.value]) return false
  return questionGroups.value[currentGroupIndex.value].some(q => 
    typeof userAnswers.value[q.questionId] !== 'undefined'
  )
})

const hasAnsweredQuestion = (questionId: number) => {
  return typeof userAnswers.value[questionId] !== 'undefined'
}

const getAnsweredCount = () => {
  return Object.keys(userAnswers.value).length
}

const getUnansweredCount = () => {
  return questions.value.length - getAnsweredCount()
}

const currentQuestionIndex = computed(() => {
  // 计算当前正在显示的题目在全局中的索引
  let index = 0
  for (let i = 0; i < currentGroupIndex.value; i++) {
    index += questionGroups.value[i].length
  }
  return index
})

const jumpToQuestion = (questionIndex: number) => {
  // 根据题目索引跳转到对应的组
  let currentIndex = 0
  for (let groupIndex = 0; groupIndex < questionGroups.value.length; groupIndex++) {
    const groupLength = questionGroups.value[groupIndex].length
    if (questionIndex < currentIndex + groupLength) {
      // 暂停当前组的音频
      pauseCurrentGroupAudio()
      currentGroupIndex.value = groupIndex
      break
    }
    currentIndex += groupLength
  }
}

const startRandomPractice = () => {
  isRandomPractice.value = true
  startExam()
}

const startMockTest = () => {
  isRandomPractice.value = false
  isFavoritePractice.value = false
  startExam()
}

const startFavoritePractice = () => {
  isRandomPractice.value = true  // 收藏练习使用随机练习模式（不限时、可查看解析）
  isFavoritePractice.value = true
  startFavoriteExam()
}

const startWrongPractice = () => {
  isRandomPractice.value = true  // 错题练习使用随机练习模式（不限时、可查看解析）
  isWrongPractice.value = true
  startWrongExam()
}

const startExam = async () => {
  if (!currentQuestion.value) return

  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  // 添加埋点 - 开始练习
  trackEvent(`${EVENT_TYPES.practice_start}_${currentQuestion.value.questionBankId || 'unknown'}`)
  
  // 根据 questionBankId 范围设置 isReadAllQuestions
  let isReadAllQuestions = 0
  const bankId = currentQuestion.value.questionBankId || 0
  
  if (bankId >= 100 && bankId < 200) {
    isReadAllQuestions = authStore.permissions.N1 ? 1 : 0
    jlptLevel.value = 'N1'
  } else if (bankId >= 200 && bankId < 300) {
    isReadAllQuestions = authStore.permissions.N2 ? 1 : 0
    jlptLevel.value = 'N2'
  } else if (bankId >= 300 && bankId < 400) {
    isReadAllQuestions = authStore.permissions.N3 ? 1 : 0
    jlptLevel.value = 'N3'
  } else if (bankId >= 400 && bankId < 500) {
    isReadAllQuestions = authStore.permissions.N4 ? 1 : 0
    jlptLevel.value = 'N4'
  } else if (bankId >= 500 && bankId < 600) {
    isReadAllQuestions = authStore.permissions.N5 ? 1 : 0
    jlptLevel.value = 'N5'
  }
  
  try {
    const response = await axios.post(currentQuestion.value.apiEndpoint || '', {
      userId: authStore.userInfo?.userId || '',
      token: authStore.token || '',
      user_phone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      isPaid: authStore.isPaid || 0,
      isReadAllQuestions: isReadAllQuestions,
      usedGids: [],
      questionBankId: currentQuestion.value.questionBankId
    })

    if (response.data.code === 200) {
      if (response.data.data && response.data.data.length > 0) {
        questions.value = response.data.data.map((question: any) => ({
          ...question,
        }))
        questions.value.sort((a, b) => a.gid - b.gid)
        currentGroupIndex.value = 0
        examStarted.value = true
        if (!isRandomPractice.value) {
          startTimer()
        }
      } else {
        // 处理空数据情况
        ElMessage.warning('当前题正在补充，请期待')
        examStarted.value = false
      }
    } else {
      throw new Error(response.data.msg || '获取题目失败')
    }
  } catch (err) {
    // 处理错误情况
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      ElMessage.warning('当前题正在补充，请期待')
    } else if (axios.isAxiosError(err) && err.response?.status === 405) {
      ElMessage.warning('题目服务暂时不可用，请稍后再试或联系客服')
    } else {
      ElMessage.error(err instanceof Error ? err.message : '获取题目失败，请稍后重试')
    }
    examStarted.value = false
  } finally {
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

// 开始收藏练习
const startFavoriteExam = async () => {
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  // 添加埋点 - 开始收藏练习
  trackEvent(`${EVENT_TYPES.practice_start}_FAVORITE_${currentQuestion.value?.questionBankId || 'unknown'}`)
  
  try {
    // 调用收藏题目API
    const response = await axios.post(API_ENDPOINTS.favorite.getFavoriteQuestionsForPractice, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      userPhone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      isPaid: authStore.isPaid || 0,
      questionType: '全部', // 不过滤题型，返回所有收藏题目
      maxQuestions: 20, // 限制最多20题
      onlyUnmemorized: false, // 包含所有收藏题目
      questionsBankId: currentQuestion.value?.questionBankId || null // 题库ID用于分类过滤
    })

    if (response.data.code === 200) {
      if (response.data.data && response.data.data.length > 0) {
        questions.value = response.data.data.map((question: any) => ({
          ...question,
        }))
        questions.value.sort((a, b) => a.gid - b.gid)
        currentGroupIndex.value = 0
        examStarted.value = true
        
        // 收藏练习不计时，直接可以查看解析
        ElMessage.success(`已加载 ${questions.value.length} 道收藏题目，开始练习吧！`)
      } else {
        // 没有收藏题目
        ElMessage.warning('暂无收藏题目，请先收藏一些题目后再进行练习')
        examStarted.value = false
        isFavoritePractice.value = false
      }
    } else {
      throw new Error(response.data.msg || '获取收藏题目失败')
    }
  } catch (err) {
    // 处理错误情况
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      ElMessage.warning('收藏服务暂时不可用，请稍后再试')
    } else {
      ElMessage.error(err instanceof Error ? err.message : '获取收藏题目失败，请稍后重试')
    }
    examStarted.value = false
    isFavoritePractice.value = false
  } finally {
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

// 开始错题练习
const startWrongExam = async () => {
  if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
    globalLoading.value = true
  }
  
  // 添加埋点 - 开始错题练习
  trackEvent(`${EVENT_TYPES.practice_start}_WRONG_${currentQuestion.value?.questionBankId || 'unknown'}`)
  
  try {
    // 调用错题题目API
    const response = await axios.post(API_ENDPOINTS.wrong.getWrongQuestionsForPractice, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      userPhone: authStore.phoneNumber?.replace(/^\+/, '') || '',
      isPaid: authStore.isPaid || 0,
      questionType: '全部', // 不过滤题型，返回所有错题
      maxQuestions: 20, // 限制最多20题
      onlyUnmemorized: false, // 包含所有错题
      questionsBankId: currentQuestion.value?.questionBankId || null // 题库ID用于分类过滤
    })

    if (response.data.code === 200) {
      if (response.data.data && response.data.data.length > 0) {
        questions.value = response.data.data.map((question: any) => ({
          ...question,
        }))
        questions.value.sort((a, b) => a.gid - b.gid)
        currentGroupIndex.value = 0
        examStarted.value = true
        
        // 错题练习不计时，直接可以查看解析
        ElMessage.success(`已加载 ${questions.value.length} 道错题，开始练习吧！`)
      } else {
        // 没有错题
        ElMessage.warning('暂无错题，请先在练习中做错一些题目后再进行练习')
        examStarted.value = false
        isWrongPractice.value = false
      }
    } else {
      throw new Error(response.data.msg || '获取错题失败')
    }
  } catch (err) {
    // 处理错误情况
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      ElMessage.warning('错题服务暂时不可用，请稍后再试')
    } else {
      ElMessage.error(err instanceof Error ? err.message : '获取错题失败，请稍后重试')
    }
    examStarted.value = false
    isWrongPractice.value = false
  } finally {
    if (FEATURE_FLAGS.ENABLE_LOADING_ANIMATION) {
      globalLoading.value = false
    }
  }
}

const startTimer = () => {
  timer.value = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      ElMessage.warning('时间到！自动提交答案')
      submitExam()
    }
  }, 1000)
}

const stopTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
}

const handleAnswerSelect = async (questionId: number) => {
  if (isRandomPractice.value || isFavoritePractice.value || isWrongPractice.value) {
    const currentQuestion = questions.value.find(q => q.questionId === questionId)
    if (currentQuestion) {
      showExplanation.value[questionId] = true
      
      // 如果是随机练习或模拟测试或收藏练习模式，且答案错误，则记录错题
      if (!isWrongPractice.value) {
        const userAnswer = userAnswers.value[questionId];
        const correctAnswer = parseInt(currentQuestion.answer) - 1;
        

        
        // 如果答案错误，记录错题
        if (userAnswer !== correctAnswer) {
          // 检查用户是否已登录且有有效的用户ID
          const userId = authStore.userInfo?.userId;
          if (!userId) {
            console.warn('用户未登录或没有有效的用户ID，无法记录错题');
            return;
          }
          
          try {
            const response = await axios.post(API_ENDPOINTS.wrong.recordWrongAnswer, {
              userId: userId,
              questionId: questionId,
              questionBankId: currentQuestion.questionBankId || '',
              userAnswer: userAnswer.toString(),
              correctAnswer: correctAnswer.toString()
            });
          } catch (error) {
            console.error('记录错题失败:', error);
          }
        }
      }
      // 如果是错题练习模式，更新正确次数
      else if (isWrongPractice.value) {
        const userAnswer = userAnswers.value[questionId];
        const correctAnswer = parseInt(currentQuestion.answer) - 1;
        const isCorrect = userAnswer === correctAnswer;
        
        try {
          const response = await axios.post(API_ENDPOINTS.wrong.updateCorrectCount, {
            userId: authStore.userInfo?.userId || '',
            token: authStore.token || '',
            questionId: questionId,
            isCorrect: isCorrect
          });
          
          // 如果连续答对3次，显示提示信息
          if (response.data.msg && response.data.msg.includes('已从错题本中移除')) {
            ElMessage.success(response.data.msg);
          }
        } catch (error) {
          console.error('更新正确次数失败:', error);
        }
      }
    }
  }
}

// 暂停当前组的音频
const pauseCurrentGroupAudio = () => {
  if (questionGroupRefs.value && questionGroupRefs.value[currentGroupIndex.value]) {
    questionGroupRefs.value[currentGroupIndex.value].pauseAndResetAudio()
  }
}

const prevGroup = () => {
  if (currentGroupIndex.value > 0) {
    // 暂停当前组的音频
    pauseCurrentGroupAudio()
    currentGroupIndex.value--
  }
  resetGroupState()
}

const nextGroup = () => {
  if (currentGroupIndex.value < totalGroups.value - 1) {
    // 暂停当前组的音频
    pauseCurrentGroupAudio()
    currentGroupIndex.value++
  }
  resetGroupState()
}

const resetGroupState = () => {
  const currentGroup = questionGroups.value[currentGroupIndex.value]
  if (currentGroup) {
    currentGroup.forEach(question => {
      showExplanation.value[question.questionId] = false
    })
  }
}

const toggleExplanation = (questionId: number) => {
  showExplanation.value[questionId] = !showExplanation.value[questionId]
}

const endExam = () => {
  stopTimer()
  calculateResults()
  
  // 添加埋点 - 完成练习
  trackEvent(`${EVENT_TYPES.practice_complete}_${currentQuestion.value?.questionBankId || 'unknown'}_score_${examResults.value.score}`)
  
  examCompleted.value = true
}

const submitRandomPractice = async () => {
  // 暂停所有音频
  pauseAllAudio()
  
  // 如果是随机练习、模拟测试或收藏练习模式，记录错题
  if (!isWrongPractice.value) {
    // 遍历所有题目，记录答错的题目
    for (const question of questions.value) {
      const questionId = question.questionId;
      const userAnswer = userAnswers.value[questionId];
      
      // 如果用户回答了这道题
      if (userAnswer !== undefined) {
        const correctAnswer = parseInt(question.answer) - 1;
        
        // 如果答案错误，记录错题
        if (userAnswer !== correctAnswer) {
          // 检查用户是否已登录且有有效的用户ID
          const userId = authStore.userInfo?.userId;
          if (!userId) {
            console.warn('用户未登录或没有有效的用户ID，无法记录错题 (随机练习提交)');
            return;
          }
          
          try {
            const response = await axios.post(API_ENDPOINTS.wrong.recordWrongAnswer, {
              userId: userId,
              questionId: questionId,
              questionBankId: question.questionBankId || '',
              userAnswer: userAnswer.toString(),
              correctAnswer: correctAnswer.toString()
            });
          } catch (error) {
            console.error('记录错题失败 (随机练习提交):', error);
          }
        }
      }
    }
  }
  
  endExam()
  
  // 添加埋点 - 完成错题练习
  if (isWrongPractice.value) {
    trackEvent(`${EVENT_TYPES.practice_complete}_WRONG_${currentQuestion.value?.questionBankId || 'unknown'}_score_${examResults.value.score}`)
  }
}

const submitExam = async () => {
  if (!isRandomPractice.value && !canSubmit.value) {
    try {
      await ElMessageBox.confirm(
        `您还有 ${questions.value.length - getAnsweredCount()} 道题未完成，确定要提交吗？`,
        '确认提交',
        {
          confirmButtonText: '确定提交',
          cancelButtonText: '继续答题',
          type: 'warning',
        }
      )
    } catch {
      return // 用户取消提交
    }
  }
  
  // 暂停所有音频
  pauseAllAudio()
  
  // 记录错题
  // 遍历所有题目，记录答错的题目
  for (const question of questions.value) {
    const questionId = question.questionId;
    const userAnswer = userAnswers.value[questionId];
    
    // 如果用户回答了这道题
    if (userAnswer !== undefined) {
      const correctAnswer = parseInt(question.answer) - 1;
      

      
      // 如果答案错误，记录错题
      if (userAnswer !== correctAnswer) {
        // 检查用户是否已登录且有有效的用户ID
        const userId = authStore.userInfo?.userId;
        if (!userId) {
          console.warn('用户未登录或没有有效的用户ID，无法记录错题 (考试提交)');
          return;
        }
        
        try {
          const response = await axios.post(API_ENDPOINTS.wrong.recordWrongAnswer, {
            userId: userId,
            questionId: questionId,
            questionBankId: question.questionBankId || '',
            userAnswer: userAnswer.toString(),
            correctAnswer: correctAnswer.toString()
          });
        } catch (error) {
          console.error('记录错题失败 (考试提交):', error);
        }
      }
    }
  }
  
  endExam()
}

// 暂停所有音频
const pauseAllAudio = () => {
  if (questionGroupRefs.value) {
    questionGroupRefs.value.forEach(groupRef => {
      if (groupRef && typeof groupRef.pauseAndResetAudio === 'function') {
        groupRef.pauseAndResetAudio()
      }
    })
  }
}

const calculateResults = () => {
  let correctCount = 0
  questions.value.forEach(question => {
    if (userAnswers.value[question.questionId] === parseInt(question.answer) - 1) {
      correctCount++
    }
  })

  const timeSpent = isRandomPractice.value ? 0 : (timeLimit * 60 - remainingTime.value)
  const accuracy = Math.round((correctCount / questions.value.length) * 100)
  const score = Math.round((correctCount / questions.value.length) * 100)

  examResults.value = {
    score,
    correctCount,
    accuracy,
    timeSpent
  }
}

const retryExam = () => {
  examStarted.value = false
  examCompleted.value = false
  currentGroupIndex.value = 0
  remainingTime.value = timeLimit * 60
  userAnswers.value = {}
  questions.value = []
  examResults.value = {
    score: 0,
    correctCount: 0,
    accuracy: 0,
    timeSpent: 0
  }
  showExplanation.value = {}
}

const backToPractice = () => {
  router.push('/practice')
}

watch(currentGroupIndex, () => {
  resetGroupState()
})

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push({
      path: '/auth/login',
      query: { redirect: route.fullPath }
    })
    return
  }

  const storedQuestion = sessionStorage.getItem('currentQuestion')
  if (storedQuestion) {
    currentQuestion.value = JSON.parse(storedQuestion)
  } else {
    router.push('/practice')
  }
})

onUnmounted(() => {
  stopTimer()
})
</script>

<style lang="scss" scoped>
.practice-detail {
  padding-bottom: var(--spacing-xxl);
  min-height: calc(100vh - 60px);
  background-color: var(--background-color);
}

.exam-content {
  min-height: calc(100vh - 60px);
  display: flex;
  flex-direction: column;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;

  &:hover:not(:disabled) {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.nav-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .current-group {
    font-weight: 600;
    color: var(--primary-color);
  }
  
  .total-groups {
    font-size: 0.9rem;
    color: var(--text-light);
  }
}

.random-submit-section {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin: var(--spacing-xl) 0;
  text-align: center;
  border-left: 4px solid var(--primary-color);
}

.submit-info {
  margin-bottom: var(--spacing-md);
  
  p {
    margin-bottom: var(--spacing-xs);
    
    &.warning-text {
      color: var(--warning-color);
      font-size: 0.9rem;
    }
  }
}

.btn-submit-random {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.exam-progress-overview {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin: var(--spacing-xl) 0;
  
  h3 {
    color: var(--primary-color);
    margin-bottom: var(--spacing-md);
  }
}

.progress-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.progress-item {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--border-color);
  border-radius: 50%;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-weight: 500;
  
  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }
  
  &.answered {
    background-color: var(--success-color);
    border-color: var(--success-color);
    color: white;
  }
  
  &.current {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
    animation: pulse 2s infinite;
  }
}

.progress-summary {
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--text-light);
}

.exam-actions {
  text-align: center;
  margin: var(--spacing-xl) 0;
}

.btn-submit {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  border: none;
  padding: 12px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .submit-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .submit-text {
    margin-right: 4px;
  }

  .submit-count {
    font-size: 0.9rem;
    opacity: 0.9;
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(74, 144, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
  }
}

</style>
