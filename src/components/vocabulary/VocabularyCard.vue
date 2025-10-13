<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue'
import { playWordAudio, playExampleAudio } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

const props = defineProps<{
  word: {
    id: string
    kanji: string
    kana: string
    meaning: string
    example: string
    exampleMeaning?: string
    example2?: string
    example2Meaning?: string
    example3?: string
    example3Meaning?: string
    level: string
    tags?: string[]
    wordAudioUrl?: string
    wordSpeakVideoUrl?: string
  }
}>()

const emit = defineEmits(['play-explanation-video'])

const authStore = useAuthStore()
const isFlipped = ref(false)
const currentExampleIndex = ref(0)
const isPlaying = ref(false)
const isExamplePlaying = ref(false)

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

const toggleFlip = () => {
  isFlipped.value = !isFlipped.value
}

const playPronunciation = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  playWordAudio(
    props.word.wordAudioUrl,
    () => { isPlaying.value = true },
    () => { isPlaying.value = false },
    () => { isPlaying.value = false }
  )
}

const playExamplePronunciation = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  playExampleAudio(
    props.word.wordAudioUrl,
    currentExampleIndex.value,
    () => { isExamplePlaying.value = true },
    () => { isExamplePlaying.value = false },
    () => { isExamplePlaying.value = false }
  )
}

const playExplanationVideo = (event: Event) => {
  event.stopPropagation()
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(props.word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...props.word, explanationUrl: videoUrl })
  }
}

// 计算是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && props.word.wordSpeakVideoUrl.trim() !== ''
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

const currentExample = computed(() => {
  switch (currentExampleIndex.value) {
    case 0:
      return {
        text: props.word.example,
        meaning: props.word.exampleMeaning
      }
    case 1:
      return {
        text: props.word.example2,
        meaning: props.word.example2Meaning
      }
    case 2:
      return {
        text: props.word.example3,
        meaning: props.word.example3Meaning
      }
    default:
      return {
        text: '',
        meaning: ''
      }
  }
})

const hasExample = computed(() => {
  return props.word.example || props.word.example2 || props.word.example3
})

const setExample = (index: number, event: Event) => {
  event.stopPropagation()
  currentExampleIndex.value = index
}

// 检查收藏状态
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

// 切换收藏状态
const toggleFavorite = async (event: Event) => {
  event.stopPropagation()
  
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
const toggleMasteryStatus = async (event: Event) => {
  event.stopPropagation()
  
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行操作')
    return
  }
  
  if (!isFavorited.value) {
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

// 组件挂载时检查收藏状态
checkFavoriteStatus()

// 组件卸载时清理定时器
onUnmounted(() => {
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
  if (masteryCooldownInterval.value) {
    clearInterval(masteryCooldownInterval.value)
  }
})

// 根据JLPT等级获取雾度值的辅助函数
const getDifficultyFromJlptLevel = (jlptLevel: string): number => {
  switch (jlptLevel) {
    case 'N5': return 1 // 最简单
    case 'N4': return 2
    case 'N3': return 3
    case 'N2': return 4
    case 'N1': return 5 // 最雾
    default: return 3 // 默认中等雾度
  }
}
</script>

<template>
  <div :class="['word-card', { 'is-flipped': isFlipped }]" @click="toggleFlip">
    <div class="card-inner">
      <div class="card-front">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="sound-btn" @click="playPronunciation">
          <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        </div>
        
        <!-- 收藏按钮 -->
        <div 
          class="favorite-btn" 
          :class="{ 'favorited': isFavorited, 'cooldown': favoriteCooldown > 0 }"
          @click="toggleFavorite"
          :title="favoriteCooldown > 0 ? `请等待${favoriteCooldown}秒` : (isFavorited ? '取消收藏' : '收藏单词')"
        >
          <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
          <span v-else-if="favoriteCooldown > 0" class="cooldown-text">{{ favoriteCooldown }}</span>
          <i v-else :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'"></i>
        </div>
        
        <!-- 掌握状态按钮 -->
        <div 
          v-if="isFavorited"
          class="mastery-btn" 
          :class="{ 'mastered': masteryStatus === 1, 'unmastered': masteryStatus === 0, 'cooldown': masteryCooldown > 0 }"
          @click="toggleMasteryStatus"
          :title="masteryCooldown > 0 ? `请等待${masteryCooldown}秒` : (masteryStatus === 1 ? '标记为未掌握' : '标记为已掌握')"
        >
          <i v-if="masteryLoading" class="ri-loader-4-line loading"></i>
          <span v-else-if="masteryCooldown > 0" class="cooldown-text">{{ masteryCooldown }}</span>
          <i v-else :class="masteryStatus === 1 ? 'ri-check-line' : 'ri-question-line'"></i>
        </div>
        
        <div class="card-content">
          <h3 class="kanji">{{ word.kanji }}</h3>
          <p class="kana">{{ word.kana }}</p>
          <p class="meaning">{{ word.meaning }}</p>
          
          <div class="card-action">
            <p class="card-hint">点击查看例句</p>
          </div>
        </div>
      </div>
      
      <div class="card-back">
        <div :class="['level-badge', levelClass]">{{ word.level }}</div>
        <div class="sound-btn" @click="playPronunciation">
          <i :class="isPlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        </div>
        
        <!-- 收藏按钮 -->
        <div 
          class="favorite-btn" 
          :class="{ 'favorited': isFavorited, 'cooldown': favoriteCooldown > 0 }"
          @click="toggleFavorite"
          :title="favoriteCooldown > 0 ? `请等待${favoriteCooldown}秒` : (isFavorited ? '取消收藏' : '收藏单词')"
        >
          <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
          <span v-else-if="favoriteCooldown > 0" class="cooldown-text">{{ favoriteCooldown }}</span>
          <i v-else :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'"></i>
        </div>
        
        <!-- 掌握状态按钮 -->
        <div 
          v-if="isFavorited"
          class="mastery-btn" 
          :class="{ 'mastered': masteryStatus === 1, 'unmastered': masteryStatus === 0, 'cooldown': masteryCooldown > 0 }"
          @click="toggleMasteryStatus"
          :title="masteryCooldown > 0 ? `请等待${masteryCooldown}秒` : (masteryStatus === 1 ? '标记为未掌握' : '标记为已掌握')"
        >
          <i v-if="masteryLoading" class="ri-loader-4-line loading"></i>
          <span v-else-if="masteryCooldown > 0" class="cooldown-text">{{ masteryCooldown }}</span>
          <i v-else :class="masteryStatus === 1 ? 'ri-check-line' : 'ri-question-line'"></i>
        </div>
        
        <div class="card-content">
          <div class="word-info">
            <h3 class="kanji">{{ word.kanji }}</h3>
            <p class="kana">{{ word.kana }}</p>
          </div>
          
          <div class="examples" v-if="hasExample">
            <div class="example" v-if="currentExample.text">
              <p class="jp-text">{{ currentExample.text }}</p>
              <p v-if="currentExample.meaning" class="example-meaning">{{ currentExample.meaning }}</p>
              <div class="example-actions">
                <button class="example-sound-btn" @click="playExamplePronunciation">
                  <i :class="isExamplePlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
                  朗读例句
                </button>
                <button v-if="showVideoButton" class="example-video-btn" @click="playExplanationVideo">
                  <i class="ri-video-line"></i>
                  讲解视频
                </button>
              </div>
            </div>
            
            <div class="example-tabs">
              <button 
                v-if="word.example"
                :class="['tab-btn', { active: currentExampleIndex === 0 }]"
                @click="setExample(0, $event)"
              >
                例句1
              </button>
              <button 
                v-if="word.example2"
                :class="['tab-btn', { active: currentExampleIndex === 1 }]"
                @click="setExample(1, $event)"
              >
                例句2
              </button>
              <button 
                v-if="word.example3"
                :class="['tab-btn', { active: currentExampleIndex === 2 }]"
                @click="setExample(2, $event)"
              >
                例句3
              </button>
            </div>
          </div>
          
          <div class="tags" v-if="word.tags && word.tags.length > 0">
            <span v-for="(tag, index) in word.tags" :key="index" class="tag">
              {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use "sass:color";
.word-card {
  perspective: 1000px;
  height: 280px;
  cursor: pointer;
  user-select: none;
}

.card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.is-flipped .card-inner {
  transform: rotateY(180deg);
}

.card-front, .card-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 16px;
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  background: white;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 5px;
    background: var(--primary-color);
  }
}

.card-back {
  transform: rotateY(180deg);
  overflow-y: auto;
}

.level-badge {
  position: absolute;
  top: var(--spacing-sm);
  left: var(--spacing-sm);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  &.level-n5 { 
    background-color: #4CAF50;
  }
  &.level-n4 { 
    background-color: #2196F3;
  }
  &.level-n3 { 
    background-color: #FF9800;
  }
  &.level-n2 { 
    background-color: #F44336;
  }
  &.level-n1 { 
    background-color: #9C27B0;
  }
}

.sound-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  i {
    font-size: 1.1rem;
    color: var(--primary-color);
    transition: all var(--transition-fast);
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
}

.favorite-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: calc(var(--spacing-sm) + 40px); // 位于声音按钮左侧
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  i {
    font-size: 1.1rem;
    color: #6c757d;
    transition: all var(--transition-fast);
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.favorited {
    background-color: #e74c3c;
    
    i {
      color: white;
    }
    
    &:hover {
      background-color: #c0392b;
    }
  }
  
  &.cooldown {
    background-color: #f8f9fa;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
    
    .cooldown-text {
      font-size: 0.8rem;
      font-weight: 600;
      color: #6c757d;
    }
  }
  
  .loading {
    animation: spin 1s linear infinite;
    color: var(--primary-color);
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
}

.mastery-btn {
  position: absolute;
  top: var(--spacing-sm);
  right: calc(var(--spacing-sm) + 80px); // 位于收藏按钮左侧
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  border-radius: 50%;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1;
  
  i {
    font-size: 1.1rem;
    color: #f57c00;
    transition: all var(--transition-fast);
  }
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.mastered {
    background-color: #4caf50;
    
    i {
      color: white;
    }
    
    &:hover {
      background-color: #388e3c;
    }
  }
  
  &.unmastered {
    background-color: #ff9800;
    
    i {
      color: white;
    }
    
    &:hover {
      background-color: #f57c00;
    }
  }
  
  &.cooldown {
    background-color: #f8f9fa;
    cursor: not-allowed;
    
    &:hover {
      transform: none;
    }
    
    .cooldown-text {
      font-size: 0.8rem;
      font-weight: 600;
      color: #f57c00;
    }
  }
  
  .loading {
    animation: spin 1s linear infinite;
    color: var(--primary-color);
  }
}

.card-content {
  display: flex;
  flex-direction: column;
  flex: 1;
  margin-top: var(--spacing-xl);
  padding: 0 var(--spacing-sm);
  position: relative;
  z-index: 0;
}

.word-info {
  margin-bottom: var(--spacing-md);
}

.kanji {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
  text-align: center;
  color: var(--primary-color);
  
  .card-front & {
    margin-top: var(--spacing-lg);
    font-size: 3rem;
  }
}

.kana {
  font-size: 1.2rem;
  color: var(--text-light);
  margin-bottom: var(--spacing-sm);
  text-align: center;
}

.meaning {
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: var(--spacing-md);
  text-align: center;
  line-height: 1.4;
}

.card-hint {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: auto;
  text-align: center;
  padding: 8px;
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: 20px;
  animation: pulse 2s infinite;
}

.examples {
  margin-bottom: var(--spacing-md);
  flex: 1;
}

.example {
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-sm);
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--primary-color);

  .jp-text {
    font-size: 1rem;
    line-height: 1.6;
    margin-bottom: 4px;
    word-break: break-all;
  }

  .example-meaning {
    font-size: 0.9rem;
    color: var(--text-light);
    margin-bottom: 8px;
  }
  
  .example-sound-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 0.9rem;
    cursor: pointer;
    padding: 4px 0;
    
    &:hover {
      text-decoration: underline;
    }
    
    i {
      font-size: 1rem;
    }
  }
}

.example-tabs {
  display: flex;
  gap: var(--spacing-xs);
  margin-top: var(--spacing-sm);
}

.tab-btn {
  flex: 1;
  padding: 6px;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  background: none;
  color: var(--text-color);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  background-color: rgba(74, 144, 226, 0.1);
  color: var(--primary-color);
  font-size: 0.8rem;
  padding: 3px 8px;
  border-radius: 12px;
}

@keyframes pulse {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.6;
  }
}
</style>