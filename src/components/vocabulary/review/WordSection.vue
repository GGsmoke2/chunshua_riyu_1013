<template>
  <div class="word-section">
    <h3 class="kanji">{{ currentWord.kanji }}</h3>
    <p class="kana">{{ currentWord.kana }}</p>
    <div class="word-actions">
      <button class="btn-sound" @click="handlePlayPronunciation">
        <i class="ri-volume-up-line"></i>
        发音
      </button>
      <button v-if="showVideoButton" class="btn-explanation" @click="handlePlayExplanationVideo">
        <i class="ri-video-line"></i>
        讲解视频
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
import { ref, computed } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import { APP_CONFIG } from '../../../config/app-config'
import CustomerServiceDialog from '../../common/CustomerServiceDialog.vue'

const props = defineProps<{
  currentWord: {
    kanji: string
    kana: string
    wordSpeakVideoUrl?: string
  }
}>()

const emit = defineEmits(['play-pronunciation', 'play-explanation-video'])
const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.currentWord.wordSpeakVideoUrl && 
         props.currentWord.wordSpeakVideoUrl.trim() !== '' && 
         props.currentWord.wordSpeakVideoUrl !== 'null'
})

const handlePlayPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  emit('play-pronunciation')
}

const handlePlayExplanationVideo = () => {
  // 检查视频权限
  if ((authStore.userInfo?.isPaid || 0) < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  emit('play-explanation-video')
}
</script>

<style lang="scss" scoped>
.word-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: var(--border-radius);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  
  .kanji {
    font-size: 3.5rem;
    font-weight: 800;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
    text-shadow: 0 2px 4px rgba(74, 144, 226, 0.1);
  }
  
  .kana {
    font-size: 1.8rem;
    color: #555;
    margin-bottom: var(--spacing-md);
    font-weight: 500;
  }
  
  .word-actions {
    display: flex;
    justify-content: center;
    gap: var(--spacing-lg);
    margin-top: var(--spacing-md);
  }
  
  .btn-sound,
  .btn-explanation {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 25px;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin: 0 var(--spacing-xs);
    border: none;
    font-weight: 500;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    
    i {
      font-size: 1.2rem;
    }
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
    }
    
    &:active {
      transform: translateY(-1px);
    }
  }
  
  .btn-sound {
    background: linear-gradient(135deg, #e3f2fd, #bbdefb);
    color: #1976d2;
    
    &:hover {
      background: linear-gradient(135deg, #bbdefb, #90caf9);
      box-shadow: 0 6px 12px rgba(25, 118, 210, 0.3);
    }
  }
  
  .btn-explanation {
    background: linear-gradient(135deg, #fff3e0, #ffe0b2);
    color: #ff9800;
    
    &:hover {
      background: linear-gradient(135deg, #ffe0b2, #ffcc80);
      box-shadow: 0 6px 12px rgba(255, 152, 0, 0.3);
    }
  }
}

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

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>