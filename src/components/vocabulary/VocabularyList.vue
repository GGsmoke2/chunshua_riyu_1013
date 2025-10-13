<template>
  <div class="vocabulary-list">
    <!-- 直接显示词库列表内容，移除模式选择器 -->
    
    <!-- 循环播放控制按钮 -->
    <div class="loop-controls" v-if="words.length > 0">
      <button 
        v-if="!isLoopPlaying" 
        class="loop-btn start-loop" 
        @click="startLoopPlay"
      >
        <i class="ri-play-circle-line"></i>
        开始循环播放
      </button>
      <button 
        v-else 
        class="loop-btn stop-loop" 
        @click="stopLoopPlay"
      >
        <i class="ri-stop-circle-line"></i>
        停止循环播放
      </button>
      <!-- 播放速度选择 -->
      <div class="playback-rate-control" v-if="isLoopPlaying">
        <span class="rate-label">播放速度:</span>
        <select 
          v-model="playbackRate" 
          class="rate-select"
          @change="handlePlaybackRateChange"
        >
          <option value="0.8">0.8x</option>
          <option value="1.0">1.0x</option>
          <option value="1.2">1.2x</option>
          <option value="1.5">1.5x</option>
        </select>
      </div>
      <!-- 播放模式选择 -->
      <div class="playback-mode-control" v-if="isLoopPlaying">
        <button 
          :class="['mode-btn', { 'active': loopType === 'all' }]"
          @click="setLoopType('all')"
        >
          全部播放
        </button>
        <button 
          :class="['mode-btn', { 'active': loopType === 'word' }]"
          @click="setLoopType('word')"
        >
          只播放单词
        </button>
        <button 
          :class="['mode-btn', { 'active': loopType === 'example' }]"
          @click="setLoopType('example')"
        >
          只播放例句
        </button>
      </div>
    </div>
    
    <!-- 桌面端保持原有表格布局 -->
    <div class="desktop-layout">
      <div class="list-header">
        <div class="header-cell kanji-cell">单词</div>
        <div class="header-cell kana-cell">假名</div>
        <div class="header-cell meaning-cell">含义</div>
        <div class="header-cell level-cell">等级</div>
        <div class="header-cell actions-cell">操作</div>
      </div>
      
      <div class="list-body">
        <div 
          v-for="(word, index) in words" 
          :key="word.id"
          class="list-row"
          :class="{ 'playing': isLoopPlaying && currentLoopIndex === index }"
          :ref="(el) => { if (el) wordRows[index] = el as HTMLElement }"
        >
          <div class="list-cell kanji-cell">
            <span class="kanji">{{ word.kanji }}</span>
          </div>
          <div class="list-cell kana-cell">{{ word.kana }}</div>
          <div class="list-cell meaning-cell">{{ word.meaning }}</div>
          <div class="list-cell level-cell">
            <span :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</span>
          </div>
          <div class="list-cell actions-cell">
            <button class="action-btn view-btn" @click="viewDetails(word)">
              <i class="ri-eye-line"></i>
            </button>
            <button v-if="shouldShowAudioButton(word)" class="action-btn sound-btn" @click="playPronunciation(word)">
              <i :class="playingWord === word.id ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            </button>
            <button v-if="shouldShowVideoButton(word)" class="action-btn video-btn" @click="playExplanationVideo(word)">
              <i class="ri-video-line"></i>
            </button>
            <!-- 收藏按钮 -->
            <button 
              class="action-btn favorite-btn"
              :class="{ 'favorited': getFavoriteState(word.id), 'cooldown': getFavoriteCooldown(word.id) > 0 }"
              @click="toggleFavorite(word)"
              :disabled="getFavoriteLoading(word.id) || getFavoriteCooldown(word.id) > 0"
              :title="getFavoriteCooldown(word.id) > 0 ? `请等待${getFavoriteCooldown(word.id)}秒` : (getFavoriteState(word.id) ? '取消收藏' : '收藏单词')"
            >
              <i v-if="getFavoriteLoading(word.id)" class="ri-loader-4-line loading"></i>
              <span v-else-if="getFavoriteCooldown(word.id) > 0 && getFavoriteState(word.id)" class="cooldown-text">{{ getFavoriteCooldown(word.id) }}s</span>
              <template v-else>
                <i :class="getFavoriteState(word.id) ? 'ri-heart-fill' : 'ri-heart-line'"></i>
              </template>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端卡片布局 -->
    <div class="mobile-layout">
      <div 
        v-for="(word, index) in words" 
        :key="word.id"
        class="word-card"
        :class="{ 'playing': isLoopPlaying && currentLoopIndex === index }"
        :ref="(el) => { if (el) wordCards[index] = el as HTMLElement }"
      >
        <!-- 主要信息区域 -->
        <div class="word-main">
          <div class="word-header">
            <div class="word-kanji">
              <span class="kanji-text">{{ word.kanji }}</span>
              <span :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</span>
            </div>
            <div class="word-actions">
              <button class="action-btn view-btn" @click="viewDetails(word)">
                <i class="ri-eye-line"></i>
              </button>
              <button v-if="shouldShowAudioButton(word)" class="action-btn sound-btn" @click="playPronunciation(word)">
                <i :class="playingWord === word.id ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
              </button>
              <button v-if="shouldShowVideoButton(word)" class="action-btn video-btn" @click="playExplanationVideo(word)">
                <i class="ri-video-line"></i>
              </button>
              <!-- 收藏按钮 -->
              <button 
                class="action-btn favorite-btn"
                :class="{ 'favorited': getFavoriteState(word.id), 'cooldown': getFavoriteCooldown(word.id) > 0 }"
                @click="toggleFavorite(word)"
                :disabled="getFavoriteLoading(word.id) || getFavoriteCooldown(word.id) > 0"
                :title="getFavoriteCooldown(word.id) > 0 ? `请等待${getFavoriteCooldown(word.id)}秒` : (getFavoriteState(word.id) ? '取消收藏' : '收藏单词')"
              >
                <i v-if="getFavoriteLoading(word.id)" class="ri-loader-4-line loading"></i>
                <span v-else-if="getFavoriteCooldown(word.id) > 0 && getFavoriteState(word.id)" class="cooldown-text">{{ getFavoriteCooldown(word.id) }}s</span>
                <template v-else>
                  <i :class="getFavoriteState(word.id) ? 'ri-heart-fill' : 'ri-heart-line'"></i>
                </template>
              </button>
            </div>
          </div>
          
          <div class="word-kana">
            <span class="label">假名：</span>
            <span class="kana-text">{{ word.kana }}</span>
          </div>
          
          <div class="word-meaning">
            <span class="label">含义：</span>
            <div class="meaning-content">
              <span 
                :class="['meaning-text', { 'expanded': expandedWords.has(word.id) }]"
                @click="toggleExpand(word.id)"
              >
                {{ word.meaning }}
              </span>
              <!-- <button 
                v-if="isMeaningLong(word.meaning)"
                class="expand-btn"
                @click="toggleExpand(word.id)"
              >
                {{ expandedWords.has(word.id) ? '收起' : '展开' }}
              </button> -->
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 再来一组单词按钮 -->
    <div class="load-more-container" v-if="words.length > 0">
      <button class="btn-load-more" @click="loadMoreWords">
        <i class="ri-refresh-line"></i>
        再来一组单词
      </button>
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
    title="扫码添加客服开通视频权限" 
    dialog-class="video-permission-dialog"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio, setPlaybackRate, getPlaybackRate } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'
import { APP_CONFIG } from '../../config/app-config'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
  tags?: string[]
  explanationUrl?: string
  example?: string
  exampleMeaning?: string
  example2?: string
  example2Meaning?: string
  example3?: string
  example3Meaning?: string
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
  isDisplayMode?: boolean // 添加这个属性
  isMemorized?: number // 添加掌握状态属性
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['view-details', 'play-explanation-video', 'load-more'])

const authStore = useAuthStore()
const playingWord = ref<string | null>(null)
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)
const isAnyAudioPlaying = ref(false)

// 循环播放相关状态
const isLoopPlaying = ref(false)
const currentLoopIndex = ref(0)
const wordPlayCount = ref(0) // 单词播放次数
const exampleIndex = ref(0) // 当前例句索引
const loopType = ref<'all' | 'word' | 'example'>('all') // 播放类型：全部、单词或例句
const loopTimeout = ref<number | null>(null)
const playbackRate = ref('1.0') // 播放速度，默认'1.0'x

// 用于滚动到当前播放单词的引用
const wordRows = ref<HTMLElement[]>([])
const wordCards = ref<HTMLElement[]>([])

// 收藏相关状态
const favoriteStates = ref<Map<string, boolean>>(new Map())
const favoriteLoadingStates = ref<Map<string, boolean>>(new Map())
const favoriteCooldowns = ref<Map<string, number>>(new Map())
const cooldownIntervals = ref<Map<string, number>>(new Map())

// 扩展状态(移动端含义文本)
const expandedWords = ref<Set<string>>(new Set())

// 收藏相关的计算属性辅助函数
const getFavoriteState = (wordId: string): boolean => {
  return favoriteStates.value.get(wordId) || false
}

const getFavoriteLoading = (wordId: string): boolean => {
  return favoriteLoadingStates.value.get(wordId) || false
}

const getFavoriteCooldown = (wordId: string): number => {
  return favoriteCooldowns.value.get(wordId) || 0
}

// 检查收藏状态
const checkFavoriteStatus = async (word: Word) => {
  if (!authStore.isLoggedIn || !word?.id) {
    return
  }
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.checkWordFavoriteStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: word.id.toString()
    })
    
    if (response.data.code === 200) {
      favoriteStates.value.set(word.id, response.data.data.isFavorited || false)
    }
  } catch (error) {
    console.error('检查单词收藏状态失败:', error)
  }
}

// 初始化收藏状态
const initializeFavoriteStates = () => {
  props.words.forEach(word => {
    checkFavoriteStatus(word)
  })
}

// 切换收藏状态
const toggleFavorite = async (word: Word) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行收藏操作')
    return
  }
  
  const wordId = word.id
  if (favoriteLoadingStates.value.get(wordId)) {
    return
  }
  
  favoriteLoadingStates.value.set(wordId, true)
  
  try {
    const isFavorited = favoriteStates.value.get(wordId) || false
    
    if (isFavorited) {
      // 取消收藏
      const response = await axios.post(API_ENDPOINTS.favorite.removeWordFromFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: wordId.toString()
      })
      
      if (response.data.code === 200) {
        favoriteStates.value.set(wordId, false)
        ElMessage.success(response.data.msg || '已取消收藏')
        // 在成功后延迟启动冷却
        setTimeout(() => {
          startCooldown(wordId)
        }, 100)
      } else {
        ElMessage.error(response.data.msg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const favoriteNotes = `${word.level || 'N5'}等级单词\n${word.kanji}（${word.kana}）- ${word.meaning}`
      
      const response = await axios.post(API_ENDPOINTS.favorite.addWordToFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: wordId.toString(),
        tags: word.tags?.join(',') || '',
        customNote: favoriteNotes,
        memorizedTime: null,
        reviewCount: 0,
        lastReviewTime: null,
        nextReviewTime: null,
        difficultyLevel: getDifficultyFromJlptLevel(word.level)
      })
      
      if (response.data.code === 200) {
        favoriteStates.value.set(wordId, true)
        ElMessage.success(response.data.msg || '收藏成功')
        // 在成功后延迟启动冷却
        setTimeout(() => {
          startCooldown(wordId)
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
    favoriteLoadingStates.value.set(wordId, false)
  }
}

// 冷却时间管理
const startCooldown = (wordId: string) => {
  // 根据规范，不显示3秒倒计时，立即改变图标状态
  // 移除冷却状态，允许立即再次操作
  favoriteCooldowns.value.delete(wordId)
  
  // 清除之前的定时器（如果存在）
  if (cooldownIntervals.value.has(wordId)) {
    clearInterval(cooldownIntervals.value.get(wordId))
    cooldownIntervals.value.delete(wordId)
  }
}

// 根据JLPT等级获取难度值的辅助函数
const getDifficultyFromJlptLevel = (jlptLevel: string): number => {
  switch (jlptLevel) {
    case 'N5': return 1
    case 'N4': return 2
    case 'N3': return 3
    case 'N2': return 4
    case 'N1': return 5
    default: return 3
  }
}

// 扩展文本的函数
const isMeaningLong = (meaning: string) => {
  return meaning && meaning.length > 20 // 超过20个字符显示展开按钮
}

const toggleExpand = (wordId: string) => {
  if (expandedWords.value.has(wordId)) {
    expandedWords.value.delete(wordId)
  } else {
    expandedWords.value.add(wordId)
  }
}

const getLevelClass = (level: string) => {
  switch (level) {
    case 'N5': return 'level-n5'
    case 'N4': return 'level-n4'
    case 'N3': return 'level-n3'
    case 'N2': return 'level-n2'
    case 'N1': return 'level-n1'
    default: return ''
  }
}

const viewDetails = (word: Word) => {
  // 如果正在循环播放，停止播放
  if (isLoopPlaying.value) {
    stopLoopPlay()
  }
  emit('view-details', word)
}

const playPronunciation = (word: Word) => {
  // 如果正在循环播放，停止播放
  if (isLoopPlaying.value) {
    stopLoopPlay()
  }
  
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 添加JLPT等级权限检查
  const hasJlptAccess = authStore.userInfo?.[`japanese${word.level}`] === 1
  if (!hasJlptAccess) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 如果有其他音频在播放，则不允许播放
  if (isAnyAudioPlaying.value) {
    return
  }
  
  if (!word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  playWordAudio(
    word.wordAudioUrl,
    () => { 
      playingWord.value = word.id
      isAnyAudioPlaying.value = true
    },
    () => { 
      playingWord.value = null
      isAnyAudioPlaying.value = false
    },
    () => { 
      playingWord.value = null
      isAnyAudioPlaying.value = false
    }
  )
}

const playExplanationVideo = (word: Word) => {
  // 如果正在循环播放，停止播放
  if (isLoopPlaying.value) {
    stopLoopPlay()
  }
  
  // 检查视频权限
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  const videoUrl = getVideoUrl(word.wordSpeakVideoUrl)
  if (videoUrl) {
    emit('play-explanation-video', { ...word, explanationUrl: videoUrl })
  }
}

// 检查是否显示视频按钮
const shouldShowVideoButton = (word: Word) => {
  return word.wordSpeakVideoUrl && 
         word.wordSpeakVideoUrl.trim() !== '' && 
         word.wordSpeakVideoUrl !== 'null' && 
         word.wordSpeakVideoUrl !== null
}

// 检查是否显示音频按钮
const shouldShowAudioButton = (word: Word) => {
  // 首先检查是否有音频URL
  if (!word.wordAudioUrl || word.wordAudioUrl.trim() === '') {
    return false
  }
  
  // 检查用户是否有音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    return false
  }
  
  // 检查JLPT等级权限
  const hasJlptAccess = authStore.userInfo?.[`japanese${word.level}`] === 1
  if (!hasJlptAccess) {
    return false
  }
  
  return true
}

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
  playingWord.value = null
  isAnyAudioPlaying.value = false
}

// 循环播放相关函数
const startLoopPlay = () => {
  if (props.words.length === 0) {
    ElMessage.warning('没有单词可以播放')
    return
  }
  
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 检查JLPT等级权限（检查第一个单词的等级）
  if (props.words.length > 0) {
    const firstWord = props.words[0]
    const hasJlptAccess = authStore.userInfo?.[`japanese${firstWord.level}`] === 1
    if (!hasJlptAccess) {
      showAudioPermissionDialog.value = true
      return
    }
  }
  
  // 重置播放状态
  isLoopPlaying.value = true
  currentLoopIndex.value = 0  // 确保从第一个单词开始播放
  wordPlayCount.value = 0
  exampleIndex.value = 0
  loopType.value = 'word'
  
  // 滚动到第一个单词
  scrollToCurrentWord()
  
  // 开始播放
  playCurrentWord()
}

const stopLoopPlay = () => {
  isLoopPlaying.value = false
  currentLoopIndex.value = 0
  wordPlayCount.value = 0
  exampleIndex.value = 0
  loopType.value = 'word'
  
  // 清除定时器
  if (loopTimeout.value) {
    clearTimeout(loopTimeout.value)
    loopTimeout.value = null
  }
  
  // 停止所有音频
  stopAllAudio()
}

const playCurrentWord = () => {
  if (!isLoopPlaying.value || props.words.length === 0) {
    return
  }
  
  const currentWord = props.words[currentLoopIndex.value]
  if (!currentWord) {
    return
  }
  
  // 检查JLPT等级权限
  const hasJlptAccess = authStore.userInfo?.[`japanese${currentWord.level}`] === 1
  if (!hasJlptAccess) {
    stopLoopPlay()
    showAudioPermissionDialog.value = true
    return
  }
  
  // 根据播放模式决定播放逻辑
  if (loopType.value === 'word') {
    // 只播放单词：一个单词读三遍
    if (wordPlayCount.value < 3) {
      playWordAudio(
        currentWord.wordAudioUrl!,
        () => {
          // 播放开始回调
          isAnyAudioPlaying.value = true
        },
        () => {
          // 播放结束回调
          isAnyAudioPlaying.value = false
          wordPlayCount.value++
          
          // 500ms后继续播放单词或切换到下一个单词
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              // 单词播放3次完成，播放下一个单词
              playNextWord()
            }
          }, 500)
        },
        () => {
          // 播放错误回调
          isAnyAudioPlaying.value = false
          // 出错时也继续播放流程
          wordPlayCount.value++
          
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              playNextWord()
            }
          }, 500)
        }
      )
    } else {
      // 单词已播放3次，播放下一个单词
      playNextWord()
    }
  } else if (loopType.value === 'example') {
    // 只播放例句：一个例句读一遍
    playCurrentExample()
  } else if (loopType.value === 'all') {
    // 全部播放：一个单词读三遍，之后每个例句读一遍
    if (wordPlayCount.value < 3) {
      // 单词播放阶段
      playWordAudio(
        currentWord.wordAudioUrl!,
        () => {
          // 播放开始回调
          isAnyAudioPlaying.value = true
        },
        () => {
          // 播放结束回调
          isAnyAudioPlaying.value = false
          wordPlayCount.value++
          
          // 500ms后继续播放单词或切换到例句播放
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              // 单词播放3次完成，如果有例句则播放例句，否则播放下一个单词
              if (hasExamples(currentWord)) {
                exampleIndex.value = 0
                playCurrentExample()
              } else {
                playNextWord()
              }
            }
          }, 500)
        },
        () => {
          // 播放错误回调
          isAnyAudioPlaying.value = false
          // 出错时也继续播放流程
          wordPlayCount.value++
          
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              // 单词播放3次完成，如果有例句则播放例句，否则播放下一个单词
              if (hasExamples(currentWord)) {
                exampleIndex.value = 0
                playCurrentExample()
              } else {
                playNextWord()
              }
            }
          }, 500)
        }
      )
    } else {
      // 单词已播放3次，播放例句
      playCurrentExample()
    }
  }
}

const hasExamples = (word: Word): boolean => {
  return !!((word.example && word.example.trim() !== '') || 
            (word.example2 && word.example2.trim() !== '') || 
            (word.example3 && word.example3.trim() !== ''))
}

const playCurrentExample = () => {
  if (!isLoopPlaying.value || props.words.length === 0) {
    return
  }
  
  const currentWord = props.words[currentLoopIndex.value]
  if (!currentWord) {
    return
  }
  
  // 获取当前要播放的例句
  let exampleText = ''
  if (exampleIndex.value === 0 && currentWord.example && currentWord.example.trim() !== '') {
    exampleText = currentWord.example
  } else if (exampleIndex.value === 1 && currentWord.example2 && currentWord.example2.trim() !== '') {
    exampleText = currentWord.example2
  } else if (exampleIndex.value === 2 && currentWord.example3 && currentWord.example3.trim() !== '') {
    exampleText = currentWord.example3
  }
  
  if (exampleText) {
    playExampleAudio(
      currentWord.wordAudioUrl!,
      exampleIndex.value,
      () => {
        // 播放开始回调
        isAnyAudioPlaying.value = true
      },
      () => {
        // 播放结束回调
        isAnyAudioPlaying.value = false
        
        // 500ms后继续播放下一个例句或单词
        loopTimeout.value = window.setTimeout(() => {
          // 检查是否还有下一个例句
          let nextExampleExists = false
          if (exampleIndex.value === 0 && currentWord.example2 && currentWord.example2.trim() !== '') {
            nextExampleExists = true
          } else if (exampleIndex.value === 1 && currentWord.example3 && currentWord.example3.trim() !== '') {
            nextExampleExists = true
          }
          
          if (nextExampleExists) {
            // 播放下一个例句
            exampleIndex.value++
            playCurrentExample()
          } else {
            // 已经播放完所有例句，播放下一个单词
            playNextWord()
          }
        }, 500)
      },
      () => {
        // 播放错误回调
        isAnyAudioPlaying.value = false
        
        // 出错时也继续播放流程
        loopTimeout.value = window.setTimeout(() => {
          // 检查是否还有下一个例句
          let nextExampleExists = false
          if (exampleIndex.value === 0 && currentWord.example2 && currentWord.example2.trim() !== '') {
            nextExampleExists = true
          } else if (exampleIndex.value === 1 && currentWord.example3 && currentWord.example3.trim() !== '') {
            nextExampleExists = true
          }
          
          if (nextExampleExists) {
            // 播放下一个例句
            exampleIndex.value++
            playCurrentExample()
          } else {
            // 已经播放完所有例句，播放下一个单词
            playNextWord()
          }
        }, 500)
      }
    )
  } else {
    // 没有例句音频，直接播放下一个单词
    playNextWord()
  }
}

const playNextWord = () => {
  if (!isLoopPlaying.value || props.words.length === 0) {
    return
  }
  
  currentLoopIndex.value++
  
  if (currentLoopIndex.value >= props.words.length) {
    // 播放完所有单词，重新播放当前列表（而不是请求新的一组单词）
    currentLoopIndex.value = 0
  }
  
  // 重置播放状态
  wordPlayCount.value = 0
  exampleIndex.value = 0
  // 只有在不是'全部播放'模式下才重置为'单词'模式
  if (loopType.value !== 'all') {
    loopType.value = 'word'
  }
  
  // 滚动到当前单词
  scrollToCurrentWord()
  
  // 500ms后开始播放下一个单词
  loopTimeout.value = window.setTimeout(() => {
    playCurrentWord()
  }, 500)
}

const scrollToCurrentWord = () => {
  nextTick(() => {
    // 确保DOM已经更新
    setTimeout(() => {
      const isMobile = window.innerWidth <= 768
      const elements = isMobile ? wordCards.value : wordRows.value
      const element = elements[currentLoopIndex.value]
      
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        })
        
        // 添加视觉高亮效果
        element.classList.add('playing-highlight')
        setTimeout(() => {
          element.classList.remove('playing-highlight')
        }, 1000)
      } else {
        // 如果找不到元素，可能是DOM还未完全更新，稍后再试
        setTimeout(() => {
          const retryElements = isMobile ? wordCards.value : wordRows.value
          const retryElement = retryElements[currentLoopIndex.value]
          if (retryElement) {
            retryElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            })
              
              // 添加视觉高亮效果
              retryElement.classList.add('playing-highlight')
              setTimeout(() => {
                retryElement.classList.remove('playing-highlight')
              }, 1000)
          }
        }, 100)
      }
    }, 50)
  })
}

// 处理播放速度变化
const handlePlaybackRateChange = () => {
  const rate = parseFloat(playbackRate.value.toString())
  setPlaybackRate(rate)
}

// 设置播放模式
const setLoopType = (type: 'all' | 'word' | 'example') => {
  loopType.value = type
}

// 加载更多单词（再来一组单词）
const loadMoreWords = () => {
  // 在加载更多单词前，先停止循环播放并重置相关状态
  stopLoopPlay()
  // 重置播放索引，确保下次开始播放时从第一个单词开始
  currentLoopIndex.value = 0
  wordPlayCount.value = 0
  exampleIndex.value = 0
  emit('load-more')
}

// 监听单词列表变化，如果正在播放则重置播放状态
watch(() => props.words, (newWords, oldWords) => {
  // 只有在单词列表实际发生变化时才重置
  if (newWords !== oldWords) {
    // 清空DOM引用数组
    wordRows.value = [];
    wordCards.value = [];
    
    // 如果正在循环播放，重置播放索引并重新开始播放
    if (isLoopPlaying.value) {
      currentLoopIndex.value = 0;
      wordPlayCount.value = 0;
      exampleIndex.value = 0;
      loopType.value = 'word';
      
      // 延迟一段时间确保DOM更新完成后再开始播放
      nextTick(() => {
        setTimeout(() => {
          // 滚动到第一个单词
          scrollToCurrentWord();
          // 重新开始播放
          playCurrentWord();
        }, 100);
      });
    }
  }
}, { deep: true });

// 组件挂载时，初始化相关状态
onMounted(() => {
  if (authStore.isLoggedIn) {
    initializeFavoriteStates()
  }
  // 初始化播放速度为1.0x
  playbackRate.value = '1.0'
  setPlaybackRate(1.0)
})
</script>

<style lang="scss" scoped>
.vocabulary-list {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 循环播放控制按钮
.loop-controls {
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  
  .loop-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 16px;
    border: none;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.start-loop {
      background: linear-gradient(135deg, #28a745, #20c997);
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #20c997, #17a2b8);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
      }
    }
    
    &.stop-loop {
      background: linear-gradient(135deg, #dc3545, #c82333);
      color: white;
      
      &:hover {
        background: linear-gradient(135deg, #c82333, #bd2130);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      }
    }
    
    i {
      font-size: 1.2rem;
    }
  }
  
  // 播放速度控制
  .playback-rate-control {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .rate-label {
      font-size: 0.9rem;
      color: #666;
      white-space: nowrap;
    }
    
    .rate-select {
      padding: 4px 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 0.9rem;
      cursor: pointer;
      
      &:focus {
        outline: none;
        border-color: #409eff;
      }
    }
  }
}

// 添加再来一组单词按钮样式
.load-more-container {
  text-align: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  
  .btn-load-more {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
      background-color: var(--primary-dark);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

// 桌面端布局（保持原有样式）
.desktop-layout {
  display: block;
  
  .list-header {
    display: flex;
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
    padding: 12px 16px;
  }
  
  .list-body {
    max-height: 600px;
    overflow-y: auto;
  }
  
  .list-row {
    display: flex;
    border-bottom: 1px solid #f0f0f0;
    transition: background-color var(--transition-fast);
    
    &:hover {
      background-color: #f5f9ff;
    }
    
    &:last-child {
      border-bottom: none;
    }
    
    // 当前播放单词的高亮样式
    &.playing {
      background-color: #e3f2fd !important;
      border-left: 4px solid var(--primary-color);
      
      .kanji {
        color: var(--primary-dark);
        font-weight: bold;
      }
    }
    
    // 播放时的临时高亮效果
    &.playing-highlight {
      background-color: #d1e7ff !important;
      animation: highlight-pulse 1s ease;
    }
  }
  
  .header-cell,
  .list-cell {
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }
  
  .kanji-cell {
    width: 20%;
    font-weight: 500;
    
    .kanji {
      font-size: 1.2rem;
      color: var(--primary-color);
    }
  }
  
  .kana-cell {
    width: 20%;
  }
  
  .meaning-cell {
    width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .level-cell {
    width: 10%;
  }
  
  .actions-cell {
    width: 20%;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}

// 移动端卡片布局
.mobile-layout {
  display: none;
  padding: 12px;
  
  .word-card {
    background: white;
    border-radius: 12px;
    margin-bottom: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #f0f0f0;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
      transform: translateY(-1px);
    }
    
    &:last-child {
      margin-bottom: 0;
    }
    
    // 当前播放单词的高亮样式
    &.playing {
      background-color: #e3f2fd !important;
      border: 2px solid var(--primary-color);
      
      .kanji-text {
        color: var(--primary-dark);
        font-weight: bold;
      }
    }
    
    // 播放时的临时高亮效果
    &.playing-highlight {
      background-color: #d1e7ff !important;
      animation: highlight-pulse 1s ease;
    }
  }
  
  .word-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  
  .word-kanji {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    
    .kanji-text {
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--primary-color);
      line-height: 1.2;
    }
  }
  
  .word-actions {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }
  
  .word-kana {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    
    .label {
      font-size: 0.85rem;
      color: #666;
      margin-right: 6px;
      flex-shrink: 0;
    }
    
    .kana-text {
      font-size: 1rem;
      color: #333;
      font-weight: 500;
    }
  }
  
  .word-meaning {
    .label {
      font-size: 0.85rem;
      color: #666;
      margin-bottom: 4px;
      display: block;
    }
    
    .meaning-content {
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .meaning-text {
      flex: 1;
      font-size: 0.95rem;
      color: #333;
      line-height: 1.4;
      cursor: pointer;
      
      // 使用现代 CSS 实现多行文本截断
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3; // 现代标准属性
      -webkit-box-orient: vertical;
      box-orient: vertical; // 现代标准属性
      
      &.expanded {
        display: block;
        -webkit-line-clamp: unset;
        line-clamp: unset;
      }
    }
    
    .expand-btn {
      background: none;
      border: none;
      color: var(--primary-color);
      font-size: 0.8rem;
      cursor: pointer;
      padding: 0;
      flex-shrink: 0;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
}

// 通用样式
.level-badge {
  padding: 3px 8px;
  border-radius: 10px;
  font-size: 0.7rem;
  color: white;
  font-weight: 500;
  
  &.level-n5 { background-color: #4CAF50; }
  &.level-n4 { background-color: #2196F3; }
  &.level-n3 { background-color: #FF9800; }
  &.level-n2 { background-color: #F44336; }
  &.level-n1 { background-color: #9C27B0; }
}

.action-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  i {
    font-size: 0.9rem;
  }
  
  &:hover {
    transform: scale(1.1);
  }
  
  &.view-btn {
    background-color: #e3f2fd;
    color: #1976d2;
    
    &:hover {
      background-color: #bbdefb;
    }
  }
  
  &.sound-btn {
    background-color: #e8f5e9;
    color: #43a047;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  &.video-btn {
    background-color: #fff3e0;
    color: #ff9800;
    
    &:hover {
      background-color: #ffe0b2;
    }
  }
  
  &.favorite-btn {
    background: linear-gradient(135deg, #f8f9fa, #e9ecef);
    color: #6c757d;
    border: 2px solid #dee2e6;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e9ecef, #dee2e6);
      color: #495057;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    &.favorited {
      background: linear-gradient(135deg, #e74c3c, #c0392b);
      color: white;
      border-color: #e74c3c;
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #c0392b, #a93226);
        border-color: #c0392b;
      }
    }
    
    &.cooldown {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      color: #6c757d;
      border-color: #dee2e6;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
      }
      
      .cooldown-text {
        font-size: 0.8rem;
        font-weight: 600;
      }
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

// 高亮动画
@keyframes highlight-pulse {
  0% { background-color: #e3f2fd; }
  50% { background-color: #d1e7ff; }
  100% { background-color: #e3f2fd; }
}

// 响应式设计
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
  
  .loop-controls {
    padding: 10px 12px;
    
    .loop-btn {
      padding: 6px 12px;
      font-size: 0.9rem;
      
      i {
        font-size: 1rem;
      }
    }
    
    .playback-rate-control {
      .rate-label {
        font-size: 0.8rem;
      }
      
      .rate-select {
        padding: 3px 6px;
        font-size: 0.8rem;
      }
    }
  }
  
  .load-more-container {
    padding: 10px 12px;
    
    .btn-load-more {
      padding: 6px 12px;
      font-size: 0.9rem;
      
      i {
        font-size: 1rem;
      }
    }
  }
}

@media (min-width: 769px) {
  .desktop-layout {
    display: block;
  }
  
  .mobile-layout {
    display: none;
  }
}

// 保持原有的弹窗样式
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

// 播放模式控制
.playback-mode-control {
  display: flex;
  gap: 8px;
  
  .mode-btn {
    padding: 6px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    color: #666;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #f5f5f5;
      color: #333;
    }
    
    &.active {
      background: linear-gradient(135deg, #409eff, #337ecc);
      color: white;
      border-color: #409eff;
    }
  }
}

// 移动端响应式样式
@media (max-width: 768px) {
  .loop-controls {
    .playback-mode-control {
      .mode-btn {
        padding: 4px 8px;
        font-size: 0.75rem;
      }
    }
  }
}
</style>