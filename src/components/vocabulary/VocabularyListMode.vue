<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VocabularyList from './VocabularyList.vue'
import VideoDialog from './VideoDialog.vue'

const props = defineProps<{
  words: any[]
  currentLevel: string
  wordCount: string
}>()

const emit = defineEmits(['change-level', 'change-count', 'view-details', 'load-more'])

// 视频讲解状态
const showVideoDialog = ref(false)
const explanationVideoUrl = ref<string | null>(null)

// 显示单词详情
const showWordDetails = (word: any) => {
  emit('view-details', word)
}

// 播放讲解视频
const playExplanationVideo = (word: any) => {
  // 在实际应用中，这里应该从word中获取视频URL
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
</script>

<template>
  <div class="list-mode">
    <div class="vocabulary-list-container">
      <VocabularyList 
        :words="words" 
        @view-details="showWordDetails"
        @play-explanation-video="playExplanationVideo"
        @load-more="loadMoreWords"
      />
    </div>
    
    <!-- 按钮已移至VocabularyList.vue组件中 -->
    
    <!-- 视频讲解弹窗 -->
    <VideoDialog
      :visible="showVideoDialog"
      :video-url="explanationVideoUrl"
      @update:visible="showVideoDialog = $event"
    />
  </div>
</template>

<style lang="scss" scoped>
.list-mode {
  width: 100%;
}

.vocabulary-list-container {
  margin-bottom: var(--spacing-xl);
}

</style>