<template>
  <div class="display-mode">
    <!-- 卡片模式 -->
    <div v-if="props.displayMode === 'card'" class="cards-container">
      <WordCard 
        v-if="paginatedWords.length > 0"
        :key="paginatedWords[currentCardIndex]?.id" 
        :word="paginatedWords[currentCardIndex]"
        :words="paginatedWords"
        :current-index="currentCardIndex"
        @update:current-index="currentCardIndex = $event"
        @play-explanation-video="playExplanationVideo"
      />
    </div>
    
    <!-- 列表模式 -->
    <div v-else class="vocabulary-list-container">
      <VocabularyList 
        :words="paginatedWords" 
        @view-details="showWordDetails"
        @play-explanation-video="playExplanationVideo"
        @load-more="loadMoreWords"
      />
    </div>
    
    <!-- 分页器 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="filteredWords.length"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @current-change="handlePageChange"
        @size-change="(size: number) => { pageSize = size; currentPage = 1; currentCardIndex = 0 }"
        class="modern-pagination"
      />
    </div>
    
    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { teachers } from '../../config/show_words'
import { encryptUrl } from '../../utils/crypto'
import VocabularyList from './VocabularyList.vue'
import WordCard from './WordCard.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  currentLevel: string
  displayMode?: string // 新增 displayMode 属性
}>()

const emit = defineEmits(['view-details', 'load-more'])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)

// 卡片模式的当前索引
const currentCardIndex = ref(0)

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 根据级别过滤单词数据
const filteredWords = computed(() => {
  let words = [...teachers]
  
  // 按级别过滤
  if (props.currentLevel !== '全部') {
    words = words.filter(word => word.jlpt_level === props.currentLevel)
  }
  
  // 按word_id正序排列
  words.sort((a, b) => parseInt(a.word_id) - parseInt(b.word_id))
  
  return words
})

// 当前页显示的单词
const paginatedWords = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredWords.value.slice(start, end).map(word => ({
    id: word.word_id,
    // 如果word_name为空，使用word_kana代替
    kanji: word.word_kanji || word.word_kana,
    kana: word.word_kana,
    meaning: word.word_meaning,
    level: word.jlpt_level,
    tags: word.part_of_speech ? [word.part_of_speech] : [],
    example: word.word_example_sentence_1,
    exampleMeaning: word.word_example_translation_1,
    example2: word.word_example_sentence_2,
    exampleMeaning2: word.word_example_translation_2,
    example3: word.word_example_sentence_3,
    exampleMeaning3: word.word_example_translation_3,
    // 对音频URL进行加密
    wordAudioUrl: word.word_audio_url ? encryptUrl(word.word_audio_url) : ''
  }))
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredWords.value.length / pageSize.value)
})

// 监听级别变化，重置分页
watch(() => props.currentLevel, () => {
  currentPage.value = 1
})

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  currentCardIndex.value = 0 // 重置卡片索引为第一个
}

// 显示单词详情
const showWordDetails = (word: any) => {
  emit('view-details', word)
}

// 播放讲解视频
const playExplanationVideo = (word: any) => {
  if (word && word.explanationUrl) {
    explanationVideoUrl.value = word.explanationUrl
  } else {
    explanationVideoUrl.value = null
  }
  
  showVideoDialog.value = true
}

// 加载更多单词
const loadMoreWords = () => {
  emit('load-more')
}
</script>


<style lang="scss" scoped>
.display-mode {
  width: 100%;
}

.vocabulary-list-container {
  margin-bottom: var(--spacing-xl);
}

.cards-container {
  margin-bottom: var(--spacing-xl);
  min-height: 600px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

// 分页器美化
:deep(.modern-pagination) {
  .el-pagination__total {
    color: #606266;
    font-weight: 500;
  }
  
  .el-pager li {
    border-radius: 8px;
    margin: 0 2px;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      transform: translateY(-1px);
    }
    
    &.is-active {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
  }
  
  .btn-prev,
  .btn-next {
    border-radius: 8px;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
  }
  
  .el-pagination__sizes .el-select {
    .el-select__wrapper {
      border-radius: 8px;
    }
  }
  
  .el-pagination__jump {
    .el-input {
      .el-input__wrapper {
        border-radius: 8px;
      }
    }
  }
}
</style>