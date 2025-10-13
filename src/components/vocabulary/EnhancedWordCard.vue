<template>
  <div class="word-card-container">
    <!-- 导航栏 -->
    <div class="card-navigation">
      <button 
        class="nav-btn prev" 
        @click="prevWord" 
        :disabled="currentIndex === 0"
      >
        <i class="ri-arrow-left-line"></i>
        上一个
      </button>
      
      <div class="word-counter">
        <span class="current">{{ currentIndex + 1 }}</span>
        <span class="separator">/</span>
        <span class="total">{{ words.length }}</span>
      </div>
      
      <button 
        class="nav-btn next" 
        @click="nextWord" 
        :disabled="currentIndex === words.length - 1"
      >
        下一个
        <i class="ri-arrow-right-line"></i>
      </button>
    </div>

    <!-- 主卡片内容 -->
    <div class="word-card">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="word-actions">
          <!-- 根据模式显示不同的按钮 -->
          <template v-if="mode === 'vocabulary'">
            <!-- 词库模式：显示收藏按钮 -->
            <button 
              class="action-btn favorite-btn" 
              :class="{ 'favorited': isFavorited, 'cooldown': favoriteCooldown > 0 }"
              @click="toggleFavorite"
              :disabled="favoriteLoading || (favoriteCooldown > 0 && isFavorited)"
              :title="favoriteCooldown > 0 ? '操作过于频繁，请稍后再试' : (isFavorited ? '取消收藏' : '收藏单词')"
            >
              <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
              <template v-else>
                <i :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'"></i>
              </template>
            </button>
            
            <!-- 词库模式：只有收藏后才显示掌握按钮 -->
            <button 
              v-if="isFavorited"
              class="action-btn mastery-btn" 
              :class="{ 'mastered': masteryStatus === 1, 'unmastered': masteryStatus === 0, 'cooldown': masteryCooldown > 0 }"
              @click="toggleMasteryStatus"
              :disabled="masteryLoading || masteryCooldown > 0"
              :title="masteryCooldown > 0 ? `请等待${masteryCooldown}秒` : (masteryStatus === 1 ? '标记为未掌握' : '标记为已掌握')"
            >
              <i v-if="masteryLoading" class="ri-loader-4-line loading"></i>
              <span v-else-if="masteryCooldown > 0" class="cooldown-text">{{ masteryCooldown }}</span>
              <template v-else>
                <i :class="masteryStatus === 1 ? 'ri-check-line' : 'ri-question-line'"></i>
                <span>{{ masteryStatus === 1 ? '已掌握' : '未掌握' }}</span>
              </template>
            </button>
          </template>
          
          <template v-else-if="mode === 'favorite'">
            <!-- 收藏模式：显示掌握按钮 -->
            <button 
              class="action-btn mastery-btn" 
              :class="{ 'mastered': masteryStatus === 1, 'unmastered': masteryStatus === 0, 'cooldown': masteryCooldown > 0 }"
              @click="toggleMasteryStatus"
              :disabled="masteryLoading || masteryCooldown > 0"
              :title="masteryCooldown > 0 ? `请等待${masteryCooldown}秒` : (masteryStatus === 1 ? '标记为未掌握' : '标记为已掌握')"
            >
              <i v-if="masteryLoading" class="ri-loader-4-line loading"></i>
              <span v-else-if="masteryCooldown > 0" class="cooldown-text">{{ masteryCooldown }}</span>
              <template v-else>
                <i :class="masteryStatus === 1 ? 'ri-check-line' : 'ri-question-line'"></i>
                <span>{{ masteryStatus === 1 ? '已掌握' : '未掌握' }}</span>
              </template>
            </button>
            
            <!-- 收藏模式：显示移除收藏按钮 -->
            <button 
              class="action-btn remove-btn" 
              @click="removeFromFavorites"
              :disabled="removeLoading"
              title="从收藏中移除"
            >
              <i v-if="removeLoading" class="ri-loader-4-line loading"></i>
              <template v-else>
                <i class="ri-delete-bin-line"></i>
                <span>移除</span>
              </template>
            </button>
          </template>
          
          <button 
            v-if="shouldShowWordAudioButton"
            class="action-btn sound-btn" 
            @click="playPronunciation" 
            :disabled="isPlaying"
          >
            <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            <span>{{ isPlaying ? '播放中...' : '单词发音' }}</span>
          </button>
          <button v-if="showVideoButton" class="action-btn video-btn" @click="playExplanationVideo">
            <i class="ri-video-line"></i>
            <span>讲解视频</span>
          </button>
        </div>
      </div>

      <!-- 单词主体 -->
      <div class="word-main">
        <div class="word-display">
          <h1 class="kanji">{{ word.kanji }}</h1>
          <p class="kana">{{ word.kana }}</p>
          <p class="meaning">{{ word.meaning }}</p>
        </div>

        <!-- 标签 -->
        <div class="tags-section" v-if="word.tags && word.tags.length > 0">
          <span v-for="(tag, index) in word.tags" :key="index" class="tag">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- 例句部分 -->
      <div class="examples-section" v-if="allExamples.length > 0">
        <h3 class="section-title">
          <i class="ri-chat-quote-line"></i>
          例句
        </h3>
        
        <div class="examples-list">
          <div 
            v-for="example in allExamples" 
            :key="example.index"
            :disabled="isPlaying || isAnyAudioPlaying"
          >
            <div class="example-header">
              <span class="example-number">例句 {{ example.index + 1 }}</span>
              <button 
                v-if="hasAudioPermission"
                class="example-play-btn" 
                @click="playExamplePronunciation(example.index)"
                :disabled="isExamplePlaying === example.index || isAnyAudioPlaying"
              >
                <i :class="isExamplePlaying === example.index ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
                {{ isExamplePlaying === example.index ? '播放中' : '朗读' }}
              </button>
            </div>
            
            <div class="example-content">
              <p class="jp-text" v-html="getExampleText(example.text)"></p>
              <p class="cn-text" v-if="example.meaning">{{ example.meaning }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 音频权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showAudioPermissionDialog"
    title="扫码添加客服开通音频权限"
    dialog-class="audio-permission-dialog"
  />
  
  <!-- 视频权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showVideoPermissionDialog"
    title="扫码添加客服开通音频权限"
    tip-text="需要用户购买讲解视频播放权限"
    dialog-class="video-permission-dialog"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'
import { APP_CONFIG } from '../../config/app-config'
import { addFurigana } from '../../utils/furigana'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  example?: string
  exampleMeaning?: string
  example2?: string
  exampleMeaning2?: string
  example3?: string
  exampleMeaning3?: string
  level: string
  tags?: string[]
  explanationUrl?: string
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
  isMemorized?: number
  wordFavoriteId?: string
}

const props = defineProps<{
  word: Word
  words: Word[]
  currentIndex: number
  mode: 'vocabulary' | 'favorite' // 新增mode属性
}>()

const emit = defineEmits(['play-explanation-video', 'update:current-index', 'word-removed'])

const authStore = useAuthStore()
const isPlaying = ref(false)
const isExamplePlaying = ref<number | null>(null)
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

// 收藏相关状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)
const favoriteCooldown = ref(0)
const cooldownInterval = ref<number | null>(null)

// 掌握状态相关
const masteryStatus = ref<number | null>(null) // 0=未掌握, 1=已掌握, null=未收藏
const masteryLoading = ref(false)
const masteryCooldown = ref(0)
const masteryCooldownInterval = ref<number | null>(null)

// 移除收藏相关
const removeLoading = ref(false)

// 添加音频权限检查的计算属性
const hasAudioPermission = computed(() => {
  // 检查用户是否有音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    return false
  }
  
  // 检查JLPT等级权限
  const wordLevel = props.word.level
  const hasJlptAccess = authStore.userInfo?.[`japanese${wordLevel}`] === 1
  if (!hasJlptAccess) {
    return false
  }
  
  return true
})

// 检查是否显示单词音频按钮
const shouldShowWordAudioButton = computed(() => {
  return props.word.wordAudioUrl && 
         props.word.wordAudioUrl.trim() !== '' && 
         hasAudioPermission.value
})

const levelClass = computed(() => {
  switch (props.word.level) {
    case 'N5': return 'level-n5'
    case 'N4': return 'level-n4'
    case 'N3': return 'level-n3'
    case 'N2': return 'level-n2'
    case 'N1': return 'level-n1'
    default: return ''
  }
})

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && 
         props.word.wordSpeakVideoUrl.trim() !== '' && 
         props.word.wordSpeakVideoUrl !== 'null'
})

// 获取所有例句
const allExamples = computed(() => {
  const examples: Array<{ text: string; meaning?: string; index: number }> = []
  if (props.word.example) {
    examples.push({
      text: props.word.example,
      meaning: props.word.exampleMeaning,
      index: 0
    })
  }
  if (props.word.example2) {
    examples.push({
      text: props.word.example2,
      meaning: props.word.exampleMeaning2,
      index: 1
    })
  }
  if (props.word.example3) {
    examples.push({
      text: props.word.example3,
      meaning: props.word.exampleMeaning3,
      index: 2
    })
  }
  return examples
})

const playPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 添加JLPT等级权限检查
  const wordLevel = props.word.level // 获取单词的JLPT等级
  const hasJlptAccess = authStore.userInfo?.[`japanese${wordLevel}`] === 1
  if (!hasJlptAccess) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playWordAudio(
    props.word.wordAudioUrl,
    () => { 
      isPlaying.value = true
      isAnyAudioPlaying.value = true
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    },
    () => { 
      isPlaying.value = false
      isAnyAudioPlaying.value = false
    }
  )
}

const playExamplePronunciation = (exampleIndex: number) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 添加JLPT等级权限检查
  const wordLevel = props.word.level
  const hasJlptAccess = authStore.userInfo?.[`japanese${wordLevel}`] === 1
  if (!hasJlptAccess) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playExampleAudio(
    props.word.wordAudioUrl,
    exampleIndex,
    () => { 
      isExamplePlaying.value = exampleIndex
      isAnyAudioPlaying.value = true
    },
    () => { 
      isExamplePlaying.value = null
      isAnyAudioPlaying.value = false
    },
    () => { 
      isExamplePlaying.value = null
      isAnyAudioPlaying.value = false
    }
  )
}

const playExplanationVideo = () => {
  // 检查视频权限
  if ((authStore.userInfo?.isPaid || 0) < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(props.word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...props.word, explanationUrl: videoUrl })
  }
}

// 上一个单词
const prevWord = () => {
  // 停止所有音频播放
  stopAllAudio()
  
  if (props.currentIndex > 0) {
    emit('update:current-index', props.currentIndex - 1)
  }
}

// 下一个单词
const nextWord = () => {
  // 停止所有音频播放
  stopAllAudio()
  
  if (props.currentIndex < props.words.length - 1) {
    emit('update:current-index', props.currentIndex + 1)
  }
}

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
  isPlaying.value = false
  isExamplePlaying.value = null
  isAnyAudioPlaying.value = false
}

// 添加权限检查函数
const getExampleText = (text: string) => {
  if (!text) return ''
  
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    return text
  }
  
  return addFurigana(text)
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
  if (masteryCooldownInterval.value) {
    clearInterval(masteryCooldownInterval.value)
  }
})

// 组件挂载时检查收藏状态
const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn || !props.word?.id) {
    return
  }
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.checkWordFavoriteStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: props.word.id.toString()
    })
    
    if (response.data.code === 200) {
      isFavorited.value = response.data.data.isFavorited || false
      // 获取掌握状态
      if (response.data.data.isFavorited && response.data.data.favoriteInfo) {
        masteryStatus.value = response.data.data.favoriteInfo.isMemorized || 0
      } else {
        masteryStatus.value = null
      }
    }
  } catch (error) {
    console.error('检查单词收藏状态失败:', error)
  }
}

// 切换收藏状态（词库模式）
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
        wordId: props.word.id.toString()
      })
      
      if (response.data.code === 200) {
        isFavorited.value = false
        masteryStatus.value = null // 取消收藏后清除掌握状态
        ElMessage.success(response.data.msg || '已取消收藏')
        // 在成功后延迟启动冷却
        setTimeout(() => {
          startCooldown()
        }, 100)
      } else {
        ElMessage.error(response.data.msg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const favoriteNotes = `${props.word.level || 'N5'}等级单词\n${props.word.kanji}（${props.word.kana}）- ${props.word.meaning}`
      
      const response = await axios.post(API_ENDPOINTS.favorite.addWordToFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: props.word.id.toString(),
        tags: props.word.tags?.join(',') || '',
        customNote: favoriteNotes,
        memorizedTime: null, // 暂未掌握
        reviewCount: 0, // 初始复习次数
        lastReviewTime: null, // 暂无复习记录
        nextReviewTime: null, // 系统将根据算法计算
        difficultyLevel: getDifficultyFromJlptLevel(props.word.level) // 根据JLPT等级设置雾度
      })
      
      if (response.data.code === 200) {
        isFavorited.value = true
        masteryStatus.value = 0 // 新收藏的单词默认为未掌握
        ElMessage.success(response.data.msg || '收藏成功')
        // 在成功后延迟启动冷却
        setTimeout(() => {
          startCooldown()
        }, 100)
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

// 切换掌握状态
const toggleMasteryStatus = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行操作')
    return
  }
  
  // 在收藏模式下，如果还没有检查过收藏状态，则先检查
  if (props.mode === 'favorite' && isFavorited.value === false) {
    await checkFavoriteStatus()
  }
  
  // 如果在词库模式下且未收藏，则提示先收藏
  if (props.mode === 'vocabulary' && !isFavorited.value) {
    ElMessage.warning('请先收藏单词后再设置掌握状态')
    return
  }
  
  if (masteryLoading.value) {
    return
  }
  
  masteryLoading.value = true
  
  try {
    const newStatus = masteryStatus.value === 1 ? 0 : 1
    
    const response = await axios.post(API_ENDPOINTS.favorite.updateWordMasteryStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: props.word.id.toString(),
      isMemorized: newStatus
    })
    
    if (response.data.code === 200) {
      masteryStatus.value = newStatus
      const statusText = newStatus === 1 ? '已掌握' : '未掌握'
      // ElMessage.success(`单词状态更新为：${statusText}`)
      // 在成功后延迟启动冷却
      setTimeout(() => {
        startMasteryCooldown()
      }, 100)
    } else {
      ElMessage.error(response.data.msg || '更新状态失败')
    }
  } catch (error) {
    console.error('更新掌握状态失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    masteryLoading.value = false
  }
}

// 掌握状态冷却时间管理
const startMasteryCooldown = () => {
  masteryCooldown.value = 3
  if (masteryCooldownInterval.value) {
    clearInterval(masteryCooldownInterval.value)
  }
  
  masteryCooldownInterval.value = setInterval(() => {
    masteryCooldown.value--
    if (masteryCooldown.value <= 0) {
      clearInterval(masteryCooldownInterval.value!)
      masteryCooldownInterval.value = null
    }
  }, 1000)
}

// 从收藏中移除（收藏模式）
const removeFromFavorites = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行操作')
    return
  }
  
  if (removeLoading.value) {
    return
  }
  
  removeLoading.value = true
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.removeWordFromFavorites, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: props.word.id.toString()
    })
    
    if (response.data.code === 200) {
      // 通知父组件单词已被移除
      emit('word-removed', props.word.id)
      ElMessage.success(response.data.msg || '已从收藏中移除')
    } else {
      ElMessage.error(response.data.msg || '移除失败')
    }
  } catch (error) {
    console.error('移除收藏失败:', error)
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('操作失败，请稍后重试')
    }
  } finally {
    removeLoading.value = false
  }
}

// 监听单词变化时重新检查收藏状态
watch(() => props.word.id, () => {
  // 重置状态
  isFavorited.value = false
  masteryStatus.value = null
  favoriteCooldown.value = 0
  masteryCooldown.value = 0
  
  // 清除之前的冷却定时器
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
    cooldownInterval.value = null
  }
  if (masteryCooldownInterval.value) {
    clearInterval(masteryCooldownInterval.value)
    masteryCooldownInterval.value = null
  }
  
  // 根据模式初始化状态
  if (props.mode === 'favorite') {
    // 收藏模式直接使用传入的掌握状态
    isFavorited.value = true
    masteryStatus.value = props.word.isMemorized ?? 0
  } else {
    // 词库模式需要检查收藏状态
    checkFavoriteStatus()
  }
})

// 组件挂载时初始化
onMounted(() => {
  if (props.mode === 'favorite') {
    // 收藏模式直接使用传入的掌握状态
    isFavorited.value = true
    masteryStatus.value = props.word.isMemorized ?? 0
  } else {
    // 词库模式需要检查收藏状态
    checkFavoriteStatus()
  }
})

// 根据JLPT等级获取难度值的辅助函数
const getDifficultyFromJlptLevel = (jlptLevel: string): number => {
  switch (jlptLevel) {
    case 'N5': return 1 // 最简单
    case 'N4': return 2
    case 'N3': return 3
    case 'N2': return 4
    case 'N1': return 5 // 最难
    default: return 3 // 默认中等难度
  }
}
</script>

<style lang="scss" scoped>
.word-card-container {
  width: 100%;
  max-height: 85vh; // 限制最大高度为视窗的85%
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.card-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px; // 减小padding
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px; // 减小gap
  padding: 8px 14px; // 减小padding
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem; // 减小字体
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  i {
    font-size: 1rem; // 减小图标
  }
}

.word-counter {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 1rem; // 减小字体
  font-weight: 600;
  color: var(--primary-color);
  
  .current {
    font-size: 1.2rem; // 减小字体
    color: var(--primary-dark);
  }
  
  .separator {
    color: var(--text-light);
    margin: 0 4px;
  }
  
  .total {
    color: var(--text-light);
  }
}

.word-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  margin: 0;
  overflow-y: auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px; // 减小padding
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
}

.level-badge {
  padding: 6px 12px; // 减小padding
  border-radius: 25px;
  font-size: 0.8rem; // 减小字体
  font-weight: 700;
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &.level-n5 { 
    background: linear-gradient(135deg, #4CAF50, #45a049);
  }
  &.level-n4 { 
    background: linear-gradient(135deg, #2196F3, #1976d2);
  }
  &.level-n3 { 
    background: linear-gradient(135deg, #FF9800, #f57c00);
  }
  &.level-n2 { 
    background: linear-gradient(135deg, #F44336, #d32f2f);
  }
  &.level-n1 { 
    background: linear-gradient(135deg, #9C27B0, #7b1fa2);
  }
}

.word-actions {
  display: flex;
  gap: 8px; // 减小gap
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px; // 减小gap
  padding: 8px 12px; // 减小padding
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.8rem; // 减小字体
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 1rem; // 减小图标
  }
}

.sound-btn {
  background: linear-gradient(135deg, #e3f2fd, #bbdefb);
  color: #1976d2;
  border: 2px solid #e3f2fd;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #bbdefb, #90caf9);
    border-color: #2196f3;
  }
}

.video-btn {
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f57c00;
  border: 2px solid #fff3e0;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffe0b2, #ffcc80);
    border-color: #ff9800;
  }
}

.favorite-btn {
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #6c757d;
  border: 2px solid #dee2e6;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e9ecef, #dee2e6);
    color: #495057;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
  
  &.favorited {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    border-color: #e74c3c;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #c0392b, #a93226);
      border-color: #c0392b;
      color: white;
    }
  }
  
  &.cooldown {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #6c757d;
    border-color: #dee2e6;
    
    &:hover {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      color: #6c757d;
      transform: none;
    }
    
    .cooldown-text {
      font-size: 0.85rem;
      font-weight: 600;
    }
  }
  
  .loading {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.mastery-btn {
  background: linear-gradient(135deg, #fff8e1, #ffecb3);
  color: #f57c00;
  border: 2px solid #ffe082;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffecb3, #ffe082);
    color: #ef6c00;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(245, 124, 0, 0.2);
  }
  
  &.mastered {
    background: linear-gradient(135deg, #4caf50, #388e3c);
    color: white;
    border-color: #4caf50;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #388e3c, #2e7d32);
      border-color: #388e3c;
      color: white;
    }
  }
  
  &.unmastered {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    color: #ff9800;
    border-color: #ffcc80;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #ffe0b2, #ffcc80);
      border-color: #ff9800;
      color: #f57c00;
    }
  }
  
  &.cooldown {
    background: linear-gradient(135deg, #fff8e1, #ffecb3);
    color: #f57c00;
    border-color: #ffe082;
    
    &:hover {
      background: linear-gradient(135deg, #fff8e1, #ffecb3);
      color: #f57c00;
      transform: none;
    }
    
    .cooldown-text {
      font-size: 0.85rem;
      font-weight: 600;
    }
  }
  
  .loading {
    animation: spin 1s linear infinite;
  }
}

.remove-btn {
  background: linear-gradient(135deg, #ffebee, #ffcdd2);
  color: #c62828;
  border: 2px solid #ffcdd2;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #ffcdd2, #ef9a9a);
    border-color: #ef5350;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(244, 67, 54, 0.2);
  }
  
  .loading {
    animation: spin 1s linear infinite;
  }
}

.word-main {
  padding: 20px 20px; // 减小padding
  text-align: center;
  background: linear-gradient(180deg, white 0%, #f8faff 100%);
}

.word-display {
  margin-bottom: 16px; // 减小margin
  
  .kanji {
    font-size: 2.8rem; // 大幅减小字体
    font-weight: 800;
    margin-bottom: 8px; // 减小margin
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    line-height: 1.2;
  }
  
  .kana {
    font-size: 1.3rem; // 减小字体
    color: var(--text-light);
    margin-bottom: 12px; // 减小margin
    font-weight: 400;
    letter-spacing: 1px; // 减小字间距
  }
  
  .meaning {
    font-size: 1.1rem; // 减小字体
    color: var(--text-color);
    line-height: 1.5; // 减小行高
    font-weight: 500;
    max-width: 350px; // 减小最大宽度
    margin: 0 auto;
  }
}

.tags-section {
  display: flex;
  flex-wrap: wrap;
  gap: 6px; // 减小gap
  justify-content: center;
  margin-top: 12px; // 减小margin
  
  .tag {
    padding: 4px 10px; // 减小padding
    background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
    color: #2e7d32;
    border-radius: 15px;
    font-size: 0.8rem; // 减小字体
    font-weight: 500;
    border: 1px solid #a5d6a7;
  }
}

.examples-section {
  padding: 16px 20px; // 减小padding
  background: #fafbff;
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  
  .section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 1.1rem; // 减小字体
    font-weight: 600;
    color: var(--primary-color);
    margin-bottom: 12px; // 减小margin
    
    i {
      font-size: 1.2rem;
      color: var(--accent-color);
    }
  }
}

.examples-list {
  display: flex;
  flex-direction: column;
  gap: 12px; // 减小gap
}

.example-item {
  padding: 12px 16px; // 减小padding
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(74, 144, 226, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: rgba(74, 144, 226, 0.3);
    box-shadow: 0 4px 15px rgba(74, 144, 226, 0.1);
  }
}

.example-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px; // 减小margin
}

.example-number {
  font-size: 0.8rem; // 减小字体
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(74, 144, 226, 0.1);
  padding: 3px 8px; // 减小padding
  border-radius: 10px;
}

.example-play-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px; // 减小padding
  border: none;
  border-radius: 15px;
  background: linear-gradient(135deg, #e8f5e8, #c8e6c9);
  color: #2e7d32;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.8rem; // 减小字体
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #c8e6c9, #a5d6a7);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
  
  i {
    font-size: 0.9rem; // 减小图标
  }
}

.example-content {
  .jp-text {
    font-size: 1rem; // 减小字体
    line-height: 1.6; // 减小行高
    margin-bottom: 6px; // 减小margin
    color: var(--text-color);
    font-weight: 500;
  }
  
  .cn-text {
    font-size: 0.9rem; // 减小字体
    color: var(--text-light);
    line-height: 1.5; // 减小行高
  }
}

.card-footer {
  padding: 16px 20px; // 减小padding
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  text-align: center;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px; // 减小gap
  padding: 10px 20px; // 减小padding
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--accent-color), var(--accent-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.9rem; // 减小字体
  box-shadow: 0 4px 15px rgba(245, 166, 35, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(245, 166, 35, 0.4);
  }
  
  i {
    font-size: 1.1rem;
  }
}

/* 权限弹窗样式 */
.audio-permission-dialog,
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
      border-radius: 12px;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .word-display .kanji {
    font-size: 2.2rem; // 进一步减小
  }
  
  .word-display .kana {
    font-size: 1.1rem;
  }
  
  .word-display .meaning {
    font-size: 1rem;
  }
  
  .card-navigation {
    padding: 10px 16px;
  }
  
  .nav-btn {
    padding: 6px 10px;
    font-size: 0.8rem;
  }
  
  .word-main {
    padding: 16px 16px;
  }
  
  .examples-section {
    padding: 14px 16px;
  }
  
  .example-item {
    padding: 10px 12px;
  }
}

@media (max-width: 480px) {
  .word-display .kanji {
    font-size: 1.8rem; // 进一步减小
  }
  
  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  
  .word-actions {
    width: 100%;
    justify-content: center;
  }
  
  .action-btn {
    flex: 1;
    justify-content: center;
  }
}

/* 假名标注样式 */
.jp-text {
  ruby {
    ruby-align: center;
    
    rt {
      font-size: 0.7em;
      color: #666;
      font-weight: normal;
      line-height: 1;
    }
  }
}
</style>