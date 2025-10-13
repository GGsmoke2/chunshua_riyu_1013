<template>
  <div class="vocabulary-favorites-list-mode">
    <!-- 循环播放控制按钮 -->
    <div class="loop-controls">
      <button 
        v-if="!isLoopPlaying && words.length > 0" 
        class="loop-btn start-loop" 
        @click="startLoopPlay"
      >
        <i class="ri-play-circle-line"></i>
        开始循环播放
      </button>
      <button 
        v-else-if="isLoopPlaying" 
        class="loop-btn stop-loop" 
        @click="stopLoopPlay"
      >
        <i class="ri-stop-circle-line"></i>
        停止循环播放
      </button>
      <div v-else class="loop-placeholder">
        <p>暂无收藏单词，无法开始循环播放</p>
      </div>
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
    <div class="desktop-layout">
      <div class="list-header">
        <div class="header-cell kanji-cell">单词</div>
        <div class="header-cell kana-cell">假名</div>
        <div class="header-cell meaning-cell">含义</div>
        <div class="header-cell level-cell">等级</div>
        <div class="header-cell mastery-cell">掌握状态</div>
        <div class="header-cell actions-cell">操作</div>
      </div>
      
      <div class="list-body">
        <div v-if="words.length === 0" class="empty-state">
          <i class="ri-heart-line"></i>
          <h4>暂无收藏单词</h4>
          <p>您还没有收藏任何单词</p>
        </div>
        <div 
          v-for="word in words" 
          :key="word.id"
          class="list-row"
        >
          <div class="list-cell kanji-cell">
            <span class="kanji">{{ word.kanji }}</span>
          </div>
          <div class="list-cell kana-cell">{{ word.kana }}</div>
          <div class="list-cell meaning-cell">{{ word.meaning }}</div>
          <div class="list-cell level-cell">
            <span :class="['level-badge', getLevelClass(word.level)]">{{ word.level }}</span>
          </div>
          <div class="list-cell mastery-cell">
            <button 
              class="mastery-btn"
              :class="{ 'mastered': word.isMemorized === 1, 'cooldown': getMasteryCooldown(word.id) > 0 }"
              @click="toggleMastery(word)"
              :disabled="getMasteryLoading(word.id) || getMasteryCooldown(word.id) > 0"
              :title="getMasteryCooldown(word.id) > 0 ? '操作过于频繁，请稍后再试' : (word.isMemorized === 1 ? '标记为未掌握' : '标记为已掌握')"
            >
              <i v-if="getMasteryLoading(word.id)" class="ri-loader-4-line loading"></i>
              <i v-else :class="word.isMemorized === 1 ? 'ri-check-line' : 'ri-time-line'"></i>
              <span class="mastery-text">{{ word.isMemorized === 1 ? '已掌握' : '未掌握' }}</span>
            </button>
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
            <button 
              class="action-btn remove-btn"
              :class="{ 'cooldown': getRemoveCooldown(word.id) > 0 }"
              @click="removeFavorite(word)"
              :disabled="getRemoveLoading(word.id) || getRemoveCooldown(word.id) > 0"
              :title="getRemoveCooldown(word.id) > 0 ? '操作过于频繁，请稍后再试' : '取消收藏'"
            >
              <i v-if="getRemoveLoading(word.id)" class="ri-loader-4-line loading"></i>
              <i v-else class="ri-heart-fill"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 移动端卡片布局 -->
    <div class="mobile-layout">
      <!-- 循环播放控制按钮（移动端） -->
      <div class="loop-controls-mobile">
        <button 
          v-if="!isLoopPlaying && words.length > 0" 
          class="loop-btn start-loop" 
          @click="startLoopPlay"
        >
          <i class="ri-play-circle-line"></i>
          开始循环播放
        </button>
        <button 
          v-else-if="isLoopPlaying" 
          class="loop-btn stop-loop" 
          @click="stopLoopPlay"
        >
          <i class="ri-stop-circle-line"></i>
          停止循环播放
        </button>
        <div v-else class="loop-placeholder">
          <p>暂无收藏单词</p>
        </div>
        <!-- 播放速度选择（移动端） -->
        <div class="playback-rate-control-mobile" v-if="isLoopPlaying">
          <span class="rate-label">速度:</span>
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
        <!-- 播放模式选择（移动端） -->
        <div class="playback-mode-control-mobile" v-if="isLoopPlaying">
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
      <div v-if="words.length === 0" class="empty-state-mobile">
        <i class="ri-heart-line"></i>
        <h4>暂无收藏单词</h4>
        <p>您还没有收藏任何单词</p>
      </div>
      <div 
        v-for="word in words" 
        :key="word.id"
        class="word-card"
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
              <button 
                class="action-btn remove-btn"
                :class="{ 'cooldown': getRemoveCooldown(word.id) > 0 }"
                @click="removeFavorite(word)"
                :disabled="getRemoveLoading(word.id) || getRemoveCooldown(word.id) > 0"
                :title="getRemoveCooldown(word.id) > 0 ? '操作过于频繁，请稍后再试' : '取消收藏'"
              >
                <i v-if="getRemoveLoading(word.id)" class="ri-loader-4-line loading"></i>
                <i v-else class="ri-heart-fill"></i>
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
              <button 
                v-if="isMeaningLong(word.meaning)"
                class="expand-btn"
                @click="toggleExpand(word.id)"
              >
                {{ expandedWords.has(word.id) ? '收起' : '展开' }}
              </button>
            </div>
          </div>
          
          <!-- 移动端掌握状态按钮 -->
          <div class="word-mastery">
            <span class="label">掌握状态：</span>
            <button 
              class="mastery-btn-mobile"
              :class="{ 'mastered': word.isMemorized === 1, 'cooldown': getMasteryCooldown(word.id) > 0 }"
              @click="toggleMastery(word)"
              :disabled="getMasteryLoading(word.id) || getMasteryCooldown(word.id) > 0"
              :title="getMasteryCooldown(word.id) > 0 ? '操作过于频繁，请稍后再试' : (word.isMemorized === 1 ? '标记为未掌握' : '标记为已掌握')"
            >
              <i v-if="getMasteryLoading(word.id)" class="ri-loader-4-line loading"></i>
              <i v-else :class="word.isMemorized === 1 ? 'ri-check-line' : 'ri-time-line'"></i>
              <span class="mastery-text">{{ word.isMemorized === 1 ? '已掌握' : '未掌握' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio, stopAllAudio, setPlaybackRate, getPlaybackRate } from '../../utils/audio'
import { getVideoUrl } from '../../utils/crypto'
import { ElMessage } from 'element-plus'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
  tags?: string[]
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
  isMemorized?: number
  wordFavoriteId?: string
  example?: string
  example2?: string
  example3?: string
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['view-details', 'play-explanation-video', 'toggle-mastery', 'remove-favorite', 'load-more'])

const authStore = useAuthStore()
const playingWord = ref<string | null>(null)

// 循环播放相关状态
const isLoopPlaying = ref(false)
const currentLoopIndex = ref(0)
const wordPlayCount = ref(0) // 单词播放次数
const exampleIndex = ref(0) // 当前例句索引
const loopTimeout = ref<number | null>(null)
const playbackRate = ref(1.0) // 播放速度
const loopType = ref<'all' | 'word' | 'example'>('all') // 播放类型：全部、单词或例句

// 掌握状态相关状态
const masteryLoadingStates = ref<Map<string, boolean>>(new Map())
const masteryCooldowns = ref<Map<string, number>>(new Map())
const masteryCooldownIntervals = ref<Map<string, number>>(new Map())

// 移除收藏相关状态
const removeLoadingStates = ref<Map<string, boolean>>(new Map())
const removeCooldowns = ref<Map<string, number>>(new Map())
const removeCooldownIntervals = ref<Map<string, number>>(new Map())

// 扩展状态(移动端含义文本)
const expandedWords = ref<Set<string>>(new Set())

// 掌握状态相关的计算属性辅助函数
const getMasteryLoading = (wordId: string): boolean => {
  return masteryLoadingStates.value.get(wordId) || false
}

const getMasteryCooldown = (wordId: string): number => {
  return masteryCooldowns.value.get(wordId) || 0
}

// 移除收藏相关的计算属性辅助函数
const getRemoveLoading = (wordId: string): boolean => {
  return removeLoadingStates.value.get(wordId) || false
}

const getRemoveCooldown = (wordId: string): number => {
  return removeCooldowns.value.get(wordId) || 0
}

// 设置播放类型
const setLoopType = (type: 'all' | 'word' | 'example') => {
  loopType.value = type
}

// 切换掌握状态
const toggleMastery = (word: Word) => {
  if (getMasteryLoading(word.id) || getMasteryCooldown(word.id) > 0) {
    return
  }
  
  masteryLoadingStates.value.set(word.id, true)
  
  const newMasteryStatus = word.isMemorized === 1 ? 0 : 1
  emit('toggle-mastery', { word, masteryStatus: newMasteryStatus })
}

// 移除收藏
const removeFavorite = (word: Word) => {
  if (getRemoveLoading(word.id) || getRemoveCooldown(word.id) > 0) {
    return
  }
  
  removeLoadingStates.value.set(word.id, true)
  emit('remove-favorite', word)
}

// 冷却时间管理 - 掌握状态
const startMasteryCooldown = (wordId: string) => {
  // 根据用户需求，移除3秒冷却时间限制
  // 立即清除冷却状态，允许立即再次操作
  masteryCooldowns.value.delete(wordId)
  
  if (masteryCooldownIntervals.value.has(wordId)) {
    clearInterval(masteryCooldownIntervals.value.get(wordId)!)
    masteryCooldownIntervals.value.delete(wordId)
  }
}

// 冷却时间管理 - 移除收藏
const startRemoveCooldown = (wordId: string) => {
  removeCooldowns.value.set(wordId, 3)
  
  if (removeCooldownIntervals.value.has(wordId)) {
    clearInterval(removeCooldownIntervals.value.get(wordId)!)
  }
  
  const intervalId = setInterval(() => {
    const currentCooldown = removeCooldowns.value.get(wordId) || 0
    const newCooldown = currentCooldown - 1
    
    if (newCooldown <= 0) {
      removeCooldowns.value.delete(wordId)
      clearInterval(intervalId)
      removeCooldownIntervals.value.delete(wordId)
    } else {
      removeCooldowns.value.set(wordId, newCooldown)
    }
  }, 1000)
  
  removeCooldownIntervals.value.set(wordId, intervalId)
}

// 更新掌握状态加载状态
const updateMasteryLoading = (wordId: string, loading: boolean) => {
  masteryLoadingStates.value.set(wordId, loading)
}

// 更新移除收藏加载状态
const updateRemoveLoading = (wordId: string, loading: boolean) => {
  removeLoadingStates.value.set(wordId, loading)
}

// 定义提供给父组件调用的方法
defineExpose({
  updateMasteryLoading,
  updateRemoveLoading,
  startMasteryCooldown,
  startRemoveCooldown
})

// 扩展文本的函数
const isMeaningLong = (meaning: string) => {
  return meaning && meaning.length > 20
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
  emit('view-details', word)
}

const playPronunciation = (word: Word) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    ElMessage.warning('您还没有音频权限，请联系客服开通')
    return
  }
  
  if (!word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  playWordAudio(
    word.wordAudioUrl,
    () => { playingWord.value = word.id },
    () => { playingWord.value = null },
    () => { playingWord.value = null }
  )
}

const playExplanationVideo = (word: Word) => {
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
  if (!word.wordAudioUrl || word.wordAudioUrl.trim() === '') {
    return false
  }
  
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    return false
  }
  
  const hasJlptAccess = authStore.userInfo?.[`japanese${word.level}`] === 1
  if (!hasJlptAccess) {
    return false
  }
  
  return true
}

// 循环播放相关函数
const startLoopPlay = () => {
  if (props.words.length === 0) {
    ElMessage.warning('没有单词可以播放')
    return
  }
  
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    ElMessage.warning('您还没有音频权限，请联系客服开通')
    return
  }
  
  // 检查JLPT等级权限（检查第一个单词的等级）
  if (props.words.length > 0) {
    const firstWord = props.words[0]
    const hasJlptAccess = authStore.userInfo?.[`japanese${firstWord.level}`] === 1
    if (!hasJlptAccess) {
      ElMessage.warning('您没有该等级的音频权限，请联系客服开通')
      return
    }
  }
  
  // 重置播放状态
  isLoopPlaying.value = true
  currentLoopIndex.value = 0
  loopType.value = 'all'
  
  // 开始播放
  playCurrentWord()
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
    ElMessage.warning('您没有该等级的音频权限，请联系客服开通')
    return
  }
  
  // 根据播放模式决定播放内容
  if (loopType.value === 'word') {
    // 只播放单词：一个单词读三遍
    if (wordPlayCount.value < 3) {
      playWordAudio(
        currentWord.wordAudioUrl!,
        () => {
          // 播放开始回调
        },
        () => {
          // 播放结束回调
          wordPlayCount.value++
          
          // 500ms后继续播放单词或切换到下一个单词
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              // 单词播放3次完成，重置计数器并播放下一个单词
              wordPlayCount.value = 0
              playNextWord()
            }
          }, 500)
        },
        () => {
          // 播放错误回调
          // 出错时也继续播放流程
          wordPlayCount.value++
          
          loopTimeout.value = window.setTimeout(() => {
            if (wordPlayCount.value < 3) {
              playCurrentWord()
            } else {
              // 单词播放3次完成，重置计数器并播放下一个单词
              wordPlayCount.value = 0
              playNextWord()
            }
          }, 500)
        }
      )
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
        },
        () => {
          // 播放结束回调
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
                // 重置计数器并播放下一个单词
                wordPlayCount.value = 0
                playNextWord()
              }
            }
          }, 500)
        },
        () => {
          // 播放错误回调
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
                // 重置计数器并播放下一个单词
                wordPlayCount.value = 0
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

// 检查是否有例句
const hasExamples = (word: Word): boolean => {
  return !!((word.example && word.example.trim() !== '') || 
            (word.example2 && word.example2.trim() !== '') || 
            (word.example3 && word.example3.trim() !== ''))
}

// 播放当前例句
const playCurrentExample = () => {
  if (!isLoopPlaying.value || props.words.length === 0) {
    playNextWord()
    return
  }
  
  const currentWord = props.words[currentLoopIndex.value]
  if (!currentWord) {
    playNextWord()
    return
  }
  
  // 按顺序播放例句
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
      },
      () => {
        // 播放结束回调
        // 500ms后播放下一个例句或单词
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
            // 已经播放完所有例句，重置计数器并播放下一个单词
            wordPlayCount.value = 0
            exampleIndex.value = 0
            playNextWord()
          }
        }, 500)
      },
      () => {
        // 播放错误回调
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
            // 已经播放完所有例句，重置计数器并播放下一个单词
            wordPlayCount.value = 0
            exampleIndex.value = 0
            playNextWord()
          }
        }, 500)
      }
    )
  } else {
    // 没有例句，重置计数器并播放下一个单词
    wordPlayCount.value = 0
    exampleIndex.value = 0
    playNextWord()
  }
}

// 停止循环播放
const stopLoopPlay = () => {
  isLoopPlaying.value = false
  currentLoopIndex.value = 0
  wordPlayCount.value = 0
  exampleIndex.value = 0
  loopType.value = 'all'
  
  // 清除定时器
  if (loopTimeout.value) {
    clearTimeout(loopTimeout.value)
    loopTimeout.value = null
  }
  
  // 停止所有音频
  stopAllAudio()
}

const playNextWord = () => {
  if (!isLoopPlaying.value || props.words.length === 0) {
    return
  }
  
  currentLoopIndex.value++
  
  if (currentLoopIndex.value >= props.words.length) {
    // 播放完所有单词，请求新的一组单词
    emit('load-more')
    // 重置到第一个单词
    currentLoopIndex.value = 0
  }
  
  // 重置播放状态
  wordPlayCount.value = 0
  exampleIndex.value = 0
  
  // 500ms后开始播放下一个单词
  loopTimeout.value = window.setTimeout(() => {
    playCurrentWord()
  }, 500)
}

// 处理播放速度变化
const handlePlaybackRateChange = () => {
  const rate = parseFloat(playbackRate.value.toString())
  setPlaybackRate(rate)
}

// 页面可见性变化处理
const handleVisibilityChange = () => {
  if (document.hidden && isLoopPlaying.value) {
    // 页面隐藏时暂停播放
    stopAllAudio()
  } else if (!document.hidden && isLoopPlaying.value) {
    // 页面重新显示且应该在播放状态时，恢复播放
    playCurrentWord()
  }
}

// 组件挂载时添加页面可见性监听
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange)
  // 初始化播放速度
  playbackRate.value = getPlaybackRate()
})

// 组件卸载时移除页面可见性监听
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  // 停止播放
  stopLoopPlay()
})
</script>

<style lang="scss" scoped>
.vocabulary-favorites-list-mode {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 桌面端布局
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
  }
  
  .header-cell,
  .list-cell {
    padding: 12px 16px;
    display: flex;
    align-items: center;
  }
  
  .kanji-cell {
    width: 15%;
    font-weight: 500;
    
    .kanji {
      font-size: 1.2rem;
      color: var(--primary-color);
    }
  }
  
  .kana-cell {
    width: 15%;
  }
  
  .meaning-cell {
    width: 25%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .level-cell {
    width: 8%;
  }
  
  .mastery-cell {
    width: 12%;
  }
  
  .actions-cell {
    width: 25%;
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
  
  .word-kana, .word-meaning, .word-mastery {
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
    align-items: flex-start;
    
    .meaning-content {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      flex: 1;
    }
    
    .meaning-text {
      flex: 1;
      font-size: 0.95rem;
      color: #333;
      line-height: 1.4;
      cursor: pointer;
      
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      box-orient: vertical;
      
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

// 空状态样式
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  
  i {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 16px;
    display: block;
  }
  
  h4 {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 8px;
  }
  
  p {
    font-size: 0.9rem;
    line-height: 1.6;
  }
}

.empty-state-mobile {
  text-align: center;
  padding: 40px 20px;
  color: #999;
  
  i {
    font-size: 3rem;
    color: #ddd;
    margin-bottom: 12px;
    display: block;
  }
  
  h4 {
    font-size: 1.1rem;
    color: #666;
    margin-bottom: 6px;
  }
  
  p {
    font-size: 0.85rem;
    line-height: 1.5;
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
  
  &.remove-btn {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #c0392b, #a93226);
    }
    
    &.cooldown {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      color: #6c757d;
      cursor: not-allowed;
      
      &:hover {
        transform: none;
      }
    }
  }
}

.mastery-btn, .mastery-btn-mobile {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  border: 2px solid #dee2e6;
  background: linear-gradient(135deg, #f8f9fa, #e9ecef);
  color: #6c757d;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  
  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #e9ecef, #dee2e6);
    color: #495057;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &.mastered {
    background: linear-gradient(135deg, #28a745, #20c997);
    color: white;
    border-color: #28a745;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #20c997, #17a2b8);
      border-color: #20c997;
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
  }
  
  i {
    font-size: 0.9rem;
  }
  
  .mastery-text {
    font-weight: 500;
  }
  
  .cooldown-text {
    font-weight: 600;
    color: #dc3545;
  }
  
  .loading {
    animation: spin 1s linear infinite;
  }
}

.mastery-btn-mobile {
  font-size: 0.8rem;
  padding: 5px 10px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading {
  animation: spin 1s linear infinite;
}

.cooldown-text {
  font-weight: 600;
  color: #dc3545;
}

// 循环播放控制按钮
.loop-controls, .loop-controls-mobile {
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
  
  .loop-placeholder {
    padding: 8px 16px;
    color: #999;
    font-size: 0.9rem;
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

.loop-controls-mobile {
  padding: 10px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  
  .loop-btn {
    padding: 6px 12px;
    font-size: 0.9rem;
    
    i {
      font-size: 1rem;
    }
  }
  
  // 播放速度控制（移动端）
  .playback-rate-control-mobile {
    display: flex;
    align-items: center;
    gap: 6px;
    
    .rate-label {
      font-size: 0.8rem;
      color: #666;
      white-space: nowrap;
    }
    
    .rate-select {
      padding: 3px 6px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 0.8rem;
      cursor: pointer;
      
      &:focus {
        outline: none;
        border-color: #409eff;
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

// 播放模式控制（移动端）
.playback-mode-control-mobile {
  display: flex;
  gap: 6px;
  
  .mode-btn {
    padding: 4px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: white;
    color: #666;
    font-size: 0.75rem;
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

// 响应式设计
@media (max-width: 768px) {
  .desktop-layout {
    display: none;
  }
  
  .mobile-layout {
    display: block;
  }
  
  // 循环播放控制按钮（移动端响应式）
  .loop-controls-mobile {
    padding: 8px 12px;
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
    
    .loop-btn {
      padding: 6px 12px;
      justify-content: center;
    }
    
    .loop-placeholder {
      text-align: center;
      padding: 6px 12px;
      font-size: 0.8rem;
    }
    
    .playback-rate-control-mobile {
      justify-content: center;
      
      .rate-label {
        font-size: 0.75rem;
      }
      
      .rate-select {
        padding: 2px 4px;
        font-size: 0.75rem;
      }
    }
    
    .playback-mode-control-mobile {
      justify-content: center;
      
      .mode-btn {
        padding: 3px 6px;
        font-size: 0.7rem;
      }
    }
  }
}
</style>