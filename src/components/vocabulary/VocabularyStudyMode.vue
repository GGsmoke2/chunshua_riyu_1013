<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VocabularyReview from './VocabularyReview.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  words: any[]
}>()

const emit = defineEmits(['view-details'])

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 播放讲解视频
const playExplanationVideo = (word: any) => {
  // 先关闭当前视频对话框
  if (showVideoDialog.value) {
    showVideoDialog.value = false
    setTimeout(() => {
      if (word && word.explanationUrl) {
        explanationVideoUrl.value = word.explanationUrl
      } else {
        explanationVideoUrl.value = null
      }
      showVideoDialog.value = true
    }, 100)
  } else {
    if (word && word.explanationUrl) {
      explanationVideoUrl.value = word.explanationUrl
    } else {
      explanationVideoUrl.value = null
    }
    showVideoDialog.value = true
  }
}

// 停止所有音频
const stopAllAudio = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
})

// 加载更多单词的方法
const loadMoreWords = () => {
  // 这里可以触发重新获取单词的逻辑
  // 由于VocabularyReview组件内部管理单词列表，我们需要通过事件通知父组件
  emit('view-details', { action: 'loadMoreWords' });
}
</script>

<template>
  <div class="study-mode">
    <div class="cards-container">
      <VocabularyReview 
        :words="props.words"
        @play-explanation-video="playExplanationVideo"
      />
    </div>
    
    <!-- 添加"再来一组单词"按钮 -->
    <div class="load-more">
      <button class="btn-load-more" @click="loadMoreWords">
        <i class="ri-refresh-line"></i>
        再来一组单词
      </button>
    </div>
    
    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
  </div>
</template>

<style lang="scss" scoped>
.study-mode {
  width: 100%;
  
  .cards-container {
    display: block;
    width: 100%;
  }
  
  .load-more {
    text-align: center;
    margin-top: var(--spacing-xl);
    margin-bottom: var(--spacing-xl);
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
}
</style>