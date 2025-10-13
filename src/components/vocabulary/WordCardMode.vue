<template>
  <div class="word-card-mode">
    <!-- 模式选择器 -->
    <div class="mode-selector">
      <div class="mode-buttons">
        <button 
          :class="['mode-btn', { active: currentMode === 'vocabulary' }]"
          @click="switchMode('vocabulary')"
        >
          <i class="ri-book-line"></i>
          词库卡片
        </button>
        <button 
          :class="['mode-btn', { active: currentMode === 'favorite' }]"
          @click="switchMode('favorite')"
        >
          <i class="ri-heart-line"></i>
          收藏卡片
        </button>
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="card-content">
      <div v-if="loading" class="loading-state">
        <el-skeleton :rows="5" animated />
      </div>
      
      <div v-else-if="error" class="error-state">
        <i class="ri-error-warning-line"></i>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="refetchData">重试</button>
      </div>
      
      <div v-else-if="displayWords.length === 0" class="empty-state">
        <i :class="currentMode === 'favorite' ? 'ri-heart-line' : 'ri-book-line'"></i>
        <h4>{{ currentMode === 'favorite' ? '暂无收藏单词' : '暂无单词' }}</h4>
        <p>
          {{ currentMode === 'favorite' 
              ? '您还没有收藏任何单词，在词库模式中点击心形按钮即可收藏单词' 
              : '当前条件下没有找到单词' 
          }}
        </p>
      </div>
      
      <!-- 卡片展示 -->
      <div v-else class="card-display">
        <EnhancedWordCard 
          :word="displayWords[currentCardIndex]"
          :words="displayWords"
          :current-index="currentCardIndex"
          :mode="currentMode"
          @update:current-index="currentCardIndex = $event"
          @play-explanation-video="$emit('play-explanation-video', $event)"
          @word-removed="handleWordRemoved"
        />
        
        <!-- 加载更多按钮 - 仅在词库模式下显示 -->
        <div v-if="currentMode !== 'favorite'" class="load-more">
          <button class="btn-load-more" @click="loadMoreWords">
            <i class="ri-refresh-line"></i>
            {{ currentMode === 'favorite' ? '再来一组收藏' : '再来一组单词' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'
import EnhancedWordCard from './EnhancedWordCard.vue'

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
  isMemorized?: number
  wordFavoriteId?: string
}

const props = defineProps<{
  words: Word[]
}>()

const emit = defineEmits(['view-details', 'play-explanation-video'])

const authStore = useAuthStore()

// 模式相关状态
const currentMode = ref<'vocabulary' | 'favorite'>('vocabulary')
const favoriteWords = ref<Word[]>([])
const favoriteLoading = ref(false)
const currentCardIndex = ref(0)

// 页面状态
const loading = ref(false)
const error = ref('')

// 显示的单词列表
const displayWords = computed(() => {
  return currentMode.value === 'favorite' ? favoriteWords.value : props.words
})

// 切换模式
const switchMode = async (mode: 'vocabulary' | 'favorite') => {
  if (mode === 'favorite' && !authStore.isLoggedIn) {
    ElMessage.warning('请先登录后查看收藏单词')
    return
  }
  
  currentMode.value = mode
  currentCardIndex.value = 0 // 重置卡片索引
  
  if (mode === 'favorite') {
    await fetchFavoriteWords()
  }
}

// 获取收藏单词
const fetchFavoriteWords = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    return
  }

  favoriteLoading.value = true
  loading.value = true
  error.value = ''

  try {
    const response = await axios.post(API_ENDPOINTS.favorite.getFavoriteWordsWithFilter, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordCount: "100", // 获取100个收藏单词
      masteryFilter: "all", // 获取所有掌握状态的单词
      timeFilter: "all", // 获取所有时间的收藏
      levelFilter: "all" // 获取所有等级的收藏
    })
    
    if (response.data.code === 200 && response.data.data) {
      // 将收藏的单词数据转换为Word格式
      let processedWords = response.data.data.words.map((item: any) => ({
        id: item.wordId?.toString() || item.id?.toString(),
        kanji: item.wordKanji || item.kanji,
        kana: item.wordKana || item.kana,
        meaning: item.wordMeaning || item.meaning,
        level: item.jlptLevel || item.level,
        tags: item.tags ? item.tags.split(',') : [],
        example: item.wordExampleSentence1 || item.example,
        exampleMeaning: item.wordExampleTranslation1 || item.exampleMeaning,
        example2: item.wordExampleSentence2 || item.example2,
        example2Meaning: item.wordExampleTranslation2 || item.example2Meaning,
        example3: item.wordExampleSentence3 || item.example3,
        example3Meaning: item.wordExampleTranslation3 || item.example3Meaning,
        wordAudioUrl: item.wordAudioUrl,
        wordSpeakVideoUrl: item.wordSpeakVideoUrl,
        isMemorized: item.isMemorized,
        wordFavoriteId: item.wordFavoriteId,
        // 添加创建时间和更新时间字段
        createdTime: item.createdTime,
        updatedTime: item.updatedTime
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
    } else {
      favoriteWords.value = []
      if (response.data.msg) {
        ElMessage.info(response.data.msg)
      }
    }
  } catch (err) {
    console.error('获取收藏单词失败:', err)
    error.value = err instanceof Error ? err.message : '获取收藏单词失败，请稍后重试'
    ElMessage.error('获取收藏单词失败，请稍后重试')
    favoriteWords.value = []
  } finally {
    favoriteLoading.value = false
    loading.value = false
  }
}

// 处理单词被移除（从收藏中删除）
const handleWordRemoved = (wordId: string) => {
  if (currentMode.value === 'favorite') {
    favoriteWords.value = favoriteWords.value.filter(w => w.id !== wordId)
    
    // 调整当前卡片索引
    if (currentCardIndex.value >= favoriteWords.value.length && favoriteWords.value.length > 0) {
      currentCardIndex.value = favoriteWords.value.length - 1
    } else if (favoriteWords.value.length === 0) {
      currentCardIndex.value = 0
    }
  }
}

// 加载更多单词
const loadMoreWords = () => {
  currentCardIndex.value = 0
  if (currentMode.value === 'favorite') {
    fetchFavoriteWords()
  }
  // 词库模式的加载更多由父组件处理
}

// 重新获取数据
const refetchData = () => {
  if (currentMode.value === 'favorite') {
    fetchFavoriteWords()
  }
}

// 页面加载时初始化
onMounted(() => {
  if (authStore.isLoggedIn) {
    // 根据当前模式初始化数据
    if (currentMode.value === 'favorite') {
      fetchFavoriteWords()
    }
  }
})
</script>

<style lang="scss" scoped>
.word-card-mode {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

// 模式选择器样式
.mode-selector {
  padding: 16px 20px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-bottom: 1px solid rgba(74, 144, 226, 0.1);
  
  .mode-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .mode-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: 2px solid #e3f2fd;
    border-radius: 25px;
    background: white;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    font-size: 0.9rem;
    
    &:hover {
      background: #f5f9ff;
      border-color: var(--primary-color);
      color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(74, 144, 226, 0.2);
    }
    
    &.active {
      background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
      color: white;
      border-color: var(--primary-color);
      box-shadow: 0 6px 16px rgba(74, 144, 226, 0.3);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}

.card-content {
  padding: 20px;
}

// 状态样式
.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state {
  color: #666;
}

.error-state,
.empty-state {
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
    margin-bottom: 8px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.error-state i {
  color: var(--error-color);
}

.card-display {
  width: 100%;
}

.load-more {
  text-align: center;
  margin-top: 20px;
}

.btn-load-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  i {
    font-size: 1.2rem;
  }
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mode-selector {
    padding: 12px 16px;
    
    .mode-btn {
      padding: 8px 16px;
      font-size: 0.85rem;
      
      .mode-text {
        display: none;
      }
    }
  }
  
  .card-content {
    padding: 16px;
  }
}
</style>