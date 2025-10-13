<template>
  <div class="vocabulary-favorites-list">
    <div class="favorites-header">
      <div class="left-controls">
        <LevelSelector 
          :current-level="currentLevel" 
          :levels="WORD_LEVELS"
          @change-level="setLevel"
        />
        <TimeFilterSelector 
          :current-time-filter="currentTimeFilter"
          @change-time-filter="setTimeFilter"
        />
        <MasteryFilterSelector 
          :current-mastery-filter="currentMasteryFilter"
          @change-mastery-filter="setMasteryFilter"
        />
      </div>
      
      <div class="right-controls">
        <CountSelector 
          :word-count="wordCount"
          @change-count="changeWordCount"
        />
      </div>
    </div>

    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>
    
    <div v-else-if="error" class="error-state">
      <i class="ri-error-warning-line"></i>
      <p>{{ error }}</p>
      <button class="btn btn-primary" @click="fetchFavoriteWords">重试</button>
    </div>
    
    <div v-else-if="favoriteWords.length === 0" class="empty-state">
      <i class="ri-heart-line"></i>
      <h4>暂无收藏单词</h4>
      <p>您还没有收藏任何单词</p>
      <p>在单词列表、学习模式中点击心形按钮即可收藏单词</p>
    </div>
    

    
    <!-- 直接显示列表模式 -->
    <div v-if="favoriteWords.length > 0">
      <VocabularyFavoriteListMode 
        ref="favoriteListRef"
        :words="favoriteWords"
        @view-details="$emit('view-details', $event)"
        @play-explanation-video="$emit('play-explanation-video', $event)"
        @toggle-mastery="handleToggleMastery"
        @remove-favorite="handleRemoveFavorite"
        @load-more="$emit('load-more')"
      />
    </div>
    
    <!-- 分页控件 -->
    <div v-if="favoriteWords.length > 0 && totalPages > 1" class="pagination-controls">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="parseInt(wordCount)"
        :total="totalWords"
        layout="prev, pager, next"
        @current-change="handlePageChange"
      />
    </div>
        <!-- 分页信息 -->
    <div v-else class="pagination-info">
      <p>共 {{ totalWords }} 个收藏单词，当前显示第 {{ currentPage }} 页，共 {{ totalPages }} 页</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted, nextTick } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'
import { WORD_LEVELS, WORD_COUNT_OPTIONS } from '../../config/api-vocabulary'
import { playWordAudio, playExampleAudio, stopAllAudio, pauseCurrentAudio, isAudioPlaying, setPlaybackRate, getPlaybackRate } from '../../utils/audio'

// 导入组件
import LevelSelector from './LevelSelector.vue'
import CountSelector from './CountSelector.vue'
import VocabularyList from './VocabularyList.vue'
import WordCard from './WordCard.vue'
import TimeFilterSelector from './TimeFilterSelector.vue'
import MasteryFilterSelector from './MasteryFilterSelector.vue'
import VocabularyFavoriteListMode from './VocabularyFavoriteListMode.vue'

const emit = defineEmits(['view-details', 'play-explanation-video', 'load-more'])

const authStore = useAuthStore()

// 页面状态
const currentLevel = ref('全部')
const currentTimeFilter = ref('all')
const currentMasteryFilter = ref('all')
const wordCount = ref('12')
const currentPage = ref(1)
const totalWords = ref(0)
const favoriteWords = ref<any[]>([])
const loading = ref(false)
const error = ref('')
const displayMode = ref('list')
const currentCardIndex = ref(0)

// 循环播放相关状态
const isLoopPlaying = ref(false)
const currentLoopIndex = ref(0)
const loopType = ref<'word' | 'example'>('word') // 'word'表示读单词，'example'表示读例句
const wordPlayCount = ref(0) // 单词已播放次数
const exampleIndex = ref(0) // 当前例句索引
const playbackRate = ref(1.0) // 播放速度

// 引用子组件
const favoriteListRef = ref<InstanceType<typeof VocabularyFavoriteListMode> | null>(null)

// 添加页面可见性状态
const isPageVisible = ref(true)

// 计算是否应该显示为播放状态（考虑页面可见性）
const shouldShowPlaying = computed(() => {
  return isLoopPlaying.value && isPageVisible.value && isAudioPlaying()
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(totalWords.value / parseInt(wordCount.value))
})

// 计算是否有音频权限
const hasAudioPermission = computed(() => {
  return authStore.isLoggedIn && 
         (authStore.userInfo?.isPaid || 0) >= 2 && 
         ((authStore.userInfo?.japaneseN5 || 0) === 1 || 
          (authStore.userInfo?.japaneseN4 || 0) === 1 || 
          (authStore.userInfo?.japaneseN3 || 0) === 1 || 
          (authStore.userInfo?.japaneseN2 || 0) === 1 || 
          (authStore.userInfo?.japaneseN1 || 0) === 1)
})

// 从API获取收藏单词
const fetchFavoriteWords = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  loading.value = true
  error.value = ''

  try {
    // 构建API请求参数
    const params = {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordCount: wordCount.value,
      masteryFilter: currentMasteryFilter.value,
      timeFilter: currentTimeFilter.value,
      levelFilter: currentLevel.value, // 直接使用当前选择的等级值，不进行转换
      page: currentPage.value
    }

    // 发送API请求到新的过滤接口
    const response = await axios.post(API_ENDPOINTS.favorite.getFavoriteWordsWithFilter, params)

    if (response.data.code === 200) {
      // 处理API返回的数据
      let processedWords = response.data.data.words.map((word: any) => ({
        id: word.wordId.toString(),
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
        wordAudioUrl: word.wordAudioUrl,
        wordSpeakVideoUrl: word.wordSpeakVideoUrl,
        favoriteTime: word.favoriteTime,
        difficultyLevel: word.difficultyLevel,
        isMemorized: word.isMemorized,
        reviewCount: word.reviewCount,
        wordFavoriteId: word.wordFavoriteId,
        // 添加创建时间和更新时间字段
        createdTime: word.createdTime,
        updatedTime: word.updatedTime
      }))
      
      // 根据创建时间和更新时间排序，最新的在前面
      processedWords.sort((a, b) => {
        // 优先使用更新时间，如果没有更新时间则使用创建时间
        const timeA = a.updatedTime || a.createdTime;
        const timeB = b.updatedTime || b.createdTime;
        
        // 如果都没有时间信息，则保持原顺序
        if (!timeA && !timeB) return 0;
        
        // 有时间的排在前面
        if (!timeA) return 1;
        if (!timeB) return -1;
        
        // 按时间倒序排列（最新的在前面）
        return new Date(timeB).getTime() - new Date(timeA).getTime();
      });
      
      favoriteWords.value = processedWords
      
      // 更新总数
      totalWords.value = response.data.data.total || 0
      
      if (favoriteWords.value.length === 0 && currentPage.value > 1) {
        // 如果当前页没有数据但不是第一页，回到第一页
        currentPage.value = 1
        fetchFavoriteWords()
      }
    } else {
      error.value = response.data.msg || '获取收藏单词失败'
      ElMessage.error(error.value)
    }
  } catch (err) {
    console.error('API请求失败', err)
    error.value = err instanceof Error ? err.message : '获取收藏单词失败，请稍后重试'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}

// 设置等级
const setLevel = (level: string) => {
  currentLevel.value = level
  currentPage.value = 1
  fetchFavoriteWords()
}

// 设置时间过滤
const setTimeFilter = (timeFilter: string) => {
  currentTimeFilter.value = timeFilter
  currentPage.value = 1
  fetchFavoriteWords()
}

// 设置掌握状态过滤
const setMasteryFilter = (masteryFilter: string) => {
  currentMasteryFilter.value = masteryFilter
  currentPage.value = 1
  fetchFavoriteWords()
}

// 更改单词数量
const changeWordCount = (count: string) => {
  // 在更改单词数量前，先重置循环播放状态
  if (favoriteListRef.value) {
    favoriteListRef.value.resetLoopPlayState();
  }
  wordCount.value = count
  currentPage.value = 1
  fetchFavoriteWords()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  // 在切换页面前，先重置循环播放状态
  if (favoriteListRef.value) {
    favoriteListRef.value.resetLoopPlayState();
  }
  currentPage.value = page
  fetchFavoriteWords()
}

// 处理切换掌握状态
const handleToggleMastery = async (event: { word: any; masteryStatus: number }) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await axios.post(API_ENDPOINTS.favorite.updateWordMasteryStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: event.word.id.toString(),
      isMemorized: event.masteryStatus
    })

    if (response.data.code === 200) {
      // 更新本地数据
      const wordIndex = favoriteWords.value.findIndex(w => w.id === event.word.id)
      if (wordIndex !== -1) {
        favoriteWords.value[wordIndex].isMemorized = event.masteryStatus
      }
      
      // 显示成功提示
      const statusText = event.masteryStatus === 1 ? '已掌握' : '未掌握'
      ElMessage.success(`单词状态更新为：${statusText}`)
      
      // 更新子组件的加载状态
      if (favoriteListRef.value) {
        favoriteListRef.value.updateMasteryLoading(event.word.id, false)
        // 根据用户需求，移除3秒冷却时间限制
        // 立即清除冷却状态，允许立即再次操作
        favoriteListRef.value.startMasteryCooldown(event.word.id)
      }
    } else {
      ElMessage.error(response.data.msg || '状态更新失败')
      // 更新子组件的加载状态
      if (favoriteListRef.value) {
        favoriteListRef.value.updateMasteryLoading(event.word.id, false)
      }
    }
  } catch (error) {
    console.error('更新掌握状态失败:', error)
    ElMessage.error('操作失败，请稍后重试')
    // 更新子组件的加载状态
    if (favoriteListRef.value) {
      favoriteListRef.value.updateMasteryLoading(event.word.id, false)
    }
  }
}

// 处理移除收藏
const handleRemoveFavorite = async (word: any) => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  try {
    const response = await axios.post(API_ENDPOINTS.favorite.removeWordFromFavorites, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: word.id.toString()
    })

    if (response.data.code === 200) {
      // 从本地列表中移除该单词
      favoriteWords.value = favoriteWords.value.filter(w => w.id !== word.id)
      // 更新总数
      totalWords.value = Math.max(0, totalWords.value - 1)
      ElMessage.success(response.data.msg || '取消收藏成功')
      
      // 更新子组件的加载状态
      if (favoriteListRef.value) {
        favoriteListRef.value.updateRemoveLoading(word.id, false)
        favoriteListRef.value.startRemoveCooldown(word.id)
      }
    } else {
      ElMessage.error(response.data.msg || '取消收藏失败')
      // 更新子组件的加载状态
      if (favoriteListRef.value) {
        favoriteListRef.value.updateRemoveLoading(word.id, false)
      }
    }
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('操作失败，请稍后重试')
    // 更新子组件的加载状态
    if (favoriteListRef.value) {
      favoriteListRef.value.updateRemoveLoading(word.id, false)
    }
  }
}

// 开始循环播放
const startLoopPlay = () => {
  if (!hasAudioPermission.value) {
    ElMessage.warning('您没有音频权限，请联系客服开通')
    return
  }
  
  if (favoriteWords.value.length === 0) {
    ElMessage.warning('没有可播放的单词')
    return
  }
  
  isLoopPlaying.value = true
  currentLoopIndex.value = 0
  loopType.value = 'word'
  wordPlayCount.value = 0
  exampleIndex.value = 0
  
  // 高亮显示第一个单词并保持在屏幕中央
  highlightCurrentWord()
  
  // 开始播放
  playNext()
}

// 停止循环播放
const stopLoopPlay = () => {
  isLoopPlaying.value = false
  currentLoopIndex.value = 0
  loopType.value = 'word'
  wordPlayCount.value = 0
  exampleIndex.value = 0
  
  // 停止所有音频
  stopAllAudio()
  
  // 清除高亮
  clearHighlight()
}

// 播放下一个音频
const playNext = () => {
  if (!isLoopPlaying.value || favoriteWords.value.length === 0) {
    return
  }
  
  const currentWord = favoriteWords.value[currentLoopIndex.value]
  if (!currentWord) {
    return
  }
  
  // 检查JLPT等级权限
  const hasJlptAccess = authStore.userInfo?.[`japanese${currentWord.level}`] === 1
  if (!hasJlptAccess) {
    // 跳到下一个单词
    moveToNextWord()
    return
  }
  
  if (loopType.value === 'word') {
    // 播放单词音频
    playWordAudio(
      currentWord.wordAudioUrl,
      () => {
        // 播放开始回调
      },
      () => {
        // 播放结束回调
        wordPlayCount.value++
        if (wordPlayCount.value >= 3) {
          // 已经播放3次，切换到例句模式
          loopType.value = 'example'
          exampleIndex.value = 0
          playNext()
        } else {
          // 继续播放单词
          playNext()
        }
      },
      () => {
        // 播放错误回调
        moveToNextWord()
      }
    )
  } else {
    // 播放例句音频
    let exampleAudioUrl = ''
    let exampleText = ''
    
    switch (exampleIndex.value) {
      case 0:
        exampleAudioUrl = currentWord.wordAudioUrl
        exampleText = currentWord.example
        break
      case 1:
        exampleAudioUrl = currentWord.wordAudioUrl
        exampleText = currentWord.example2
        break
      case 2:
        exampleAudioUrl = currentWord.wordAudioUrl
        exampleText = currentWord.example3
        break
      default:
        // 所有例句都播放完了，切换到下一个单词
        moveToNextWord()
        return
    }
    
    // 检查例句是否存在
    if (!exampleText) {
      // 当前例句不存在，尝试下一个
      exampleIndex.value++
      playNext()
      return
    }
    
    playExampleAudio(
      exampleAudioUrl,
      exampleIndex.value,
      () => {
        // 播放开始回调
      },
      () => {
        // 播放结束回调
        exampleIndex.value++
        if (exampleIndex.value >= 3) {
          // 所有例句都播放完了，切换到下一个单词
          moveToNextWord()
        } else {
          // 播放下一个例句
          playNext()
        }
      },
      () => {
        // 播放错误回调
        exampleIndex.value++
        if (exampleIndex.value >= 3) {
          moveToNextWord()
        } else {
          playNext()
        }
      }
    )
  }
}

// 切换到下一个单词
const moveToNextWord = () => {
  currentLoopIndex.value++
  if (currentLoopIndex.value >= favoriteWords.value.length) {
    // 已经播放到最后一个单词，请求新数据
    emit('load-more')
    // 重置到第一个单词
    currentLoopIndex.value = 0
  }
  
  // 重置播放状态
  loopType.value = 'word'
  wordPlayCount.value = 0
  exampleIndex.value = 0
  
  // 高亮显示当前单词并保持在屏幕中央
  highlightCurrentWord()
  
  // 继续播放
  playNext()
}

// 高亮显示当前单词并保持在屏幕中央
const highlightCurrentWord = () => {
  // 清除之前的高亮
  clearHighlight()
  
  // 添加高亮类
  const currentWordElement = document.querySelector(`[data-word-id="${favoriteWords.value[currentLoopIndex.value]?.id}"]`)
  if (currentWordElement) {
    currentWordElement.classList.add('highlighted')
    
    // 滚动到屏幕中央
    currentWordElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center'
    })
  }
}

// 清除高亮
const clearHighlight = () => {
  const highlightedElements = document.querySelectorAll('.highlighted')
  highlightedElements.forEach(element => {
    element.classList.remove('highlighted')
  })
}

// 添加页面可见性变化监听
const handleVisibilityChange = () => {
  isPageVisible.value = !document.hidden
  if (document.hidden && isLoopPlaying.value) {
    // 页面隐藏时暂停播放
    pauseCurrentAudio()
  } else if (!document.hidden && isLoopPlaying.value && !isAudioPlaying()) {
    // 页面重新显示且应该在播放状态但音频未播放时，恢复播放
    playNext()
  }
  // 强制更新组件以确保按钮状态正确
  nextTick(() => {})
}

// 处理播放速度变化
const handlePlaybackRateChange = () => {
  const rate = parseFloat(playbackRate.value.toString())
  setPlaybackRate(rate)
}

// 重置循环播放状态
const resetLoopPlayState = () => {
  // 停止循环播放
  stopLoopPlay()
  
  // 重置相关状态
  isLoopPlaying.value = false
  currentLoopIndex.value = 0
  loopType.value = 'word'
  wordPlayCount.value = 0
  exampleIndex.value = 0
  
  // 通知子组件重置状态
  if (favoriteListRef.value) {
    favoriteListRef.value.resetLoopPlayState();
  }
}

// 页面加载时获取收藏单词
onMounted(() => {
  fetchFavoriteWords()
  // 添加页面可见性监听
  document.addEventListener('visibilitychange', handleVisibilityChange)
  // 初始化播放速度
  playbackRate.value = getPlaybackRate()
})

// 监听组件卸载，停止播放
onUnmounted(() => {
  stopLoopPlay()
  // 移除页面可见性监听
  document.removeEventListener('visibilitychange', handleVisibilityChange)
})

// 暴露方法给父组件
defineExpose({
  resetLoopPlayState
})
</script>

<style lang="scss" scoped>
.vocabulary-favorites-list {
  .favorites-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-lg);
    flex-wrap: wrap;
    gap: var(--spacing-md);
    
    .left-controls, .right-controls {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
    }
  }

  .loop-play-controls {
    text-align: center;
    margin-bottom: var(--spacing-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
    flex-wrap: wrap;
    
    .loop-play-btn {
      padding: 10px 20px;
      border: none;
      border-radius: 25px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      display: inline-flex;
      align-items: center;
      gap: 8px;
      
      &.start {
        background-color: var(--primary-color);
        color: white;
        
        &:hover:not(:disabled) {
          background-color: var(--primary-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        &:disabled {
          background-color: var(--disabled-bg);
          color: var(--disabled-text);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
      }
      
      &.stop {
        background-color: var(--error-color);
        color: white;
        
        &:hover {
          background-color: var(--error-dark);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
      }
      
      i {
        font-size: 1.2rem;
      }
    }
    
    .loop-play-placeholder {
      padding: 10px 20px;
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

  .display-toggle {
    display: flex;
    border: 1px solid var(--border-color);
    border-radius: 20px;
    overflow: hidden;
    
    .toggle-btn {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 6px 12px;
      background: none;
      border: none;
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &.active {
        background-color: var(--primary-color);
        color: white;
      }
      
      &:not(.active):hover {
        background-color: var(--background-color);
      }
      
      i {
        font-size: 1.1rem;
      }
    }
  }

  .loading-state,
  .error-state,
  .empty-state {
    text-align: center;
    padding: var(--spacing-xl);
    background-color: white;
    border-radius: var(--border-radius);
    box-shadow: var(--shadow-sm);
    margin-bottom: var(--spacing-xl);
  }

  .error-state,
  .empty-state {
    i {
      font-size: 3rem;
      color: var(--text-light);
      margin-bottom: var(--spacing-md);
    }

    h4 {
      color: var(--text-color);
      margin-bottom: var(--spacing-sm);
    }

    p {
      color: var(--text-light);
      margin-bottom: var(--spacing-xs);
    }
  }

  .error-state i {
    color: var(--error-color);
  }

  .pagination-info {
    text-align: center;
    padding: var(--spacing-sm) 0;
    color: var(--text-light);
    font-size: 0.9rem;
  }

  .cards-grid {
    width: 100%;
  }

  .pagination-controls {
    display: flex;
    justify-content: center;
    margin-top: var(--spacing-lg);
    padding: var(--spacing-md);
  }
}

</style>