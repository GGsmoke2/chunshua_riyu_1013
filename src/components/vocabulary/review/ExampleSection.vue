<template>
  <div class="example-section" :class="{ 'revealed': exampleRevealed }">
    <button v-if="!exampleRevealed" class="btn-reveal" @click="handleRevealExample">
      <i class="ri-eye-line"></i>
      显示例句
    </button>
    <div v-else class="example">
      <p class="jp-text" v-html="getExampleText()"></p>
      <p class="example-meaning">{{ currentExample.meaning }}</p>
      <button class="example-sound-btn" @click="handlePlayExamplePronunciation">
        <i :class="isExamplePlaying ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
        朗读例句
      </button>
    </div>
  </div>
  
  <!-- 音频权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showAudioPermissionDialog"
    title="扫码添加客服开通音频权限"
    dialog-class="audio-permission-dialog"
  />
  
  <!-- 假名标注权限弹窗 -->
  <CustomerServiceDialog
    v-model:visible="showFuriganaPermissionDialog"
    title="开通假名标注权限"
    dialog-class="furigana-permission-dialog"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../../../stores/auth'
import { APP_CONFIG } from '../../../config/app-config'
import { addFurigana } from '../../../utils/furigana'

const props = defineProps<{
  exampleRevealed: boolean
  currentExample: {
    text?: string
    meaning?: string
  }
  isExamplePlaying: boolean
}>()

const emit = defineEmits(['reveal-example', 'play-example-pronunciation'])
const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)
const showFuriganaPermissionDialog = ref(false)

const getExampleText = () => {
  if (!props.currentExample.text) return ''
  
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    return props.currentExample.text
  }
  
  return addFurigana(props.currentExample.text)
}

const handleRevealExample = () => {
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    showFuriganaPermissionDialog.value = true
    return
  }
  
  emit('reveal-example')
}

const handlePlayExamplePronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  emit('play-example-pronunciation')
}
</script>

<style lang="scss" scoped>
.example-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: var(--border-radius);
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  
  &.revealed {
    border-left: 5px solid var(--primary-color);
    background: linear-gradient(135deg, #ffffff, #f0f7ff);
  }
  
  .btn-reveal {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    font-size: 1.1rem;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
      background: linear-gradient(135deg, var(--primary-dark), #1a6bc2);
    }
    
    &:active {
      transform: translateY(-1px);
    }
    
    i {
      font-size: 1.3rem;
    }
  }
  
  .example {
    width: 100%;
    
    .jp-text {
      font-size: 1.3rem;
      margin-bottom: var(--spacing-md);
      line-height: 1.8;
      color: #333;
      font-weight: 500;
    }
    
    .example-meaning {
      color: #555;
      font-size: 1.1rem;
      margin-bottom: var(--spacing-md);
      line-height: 1.6;
      font-weight: 500;
    }
    
    .example-sound-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #e3f2fd, #bbdefb);
      border: none;
      color: #1976d2;
      font-size: 1rem;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 500;
      transition: all 0.2s ease;
      box-shadow: 0 2px 6px rgba(25, 118, 210, 0.2);
      
      &:hover {
        background: linear-gradient(135deg, #bbdefb, #90caf9);
        transform: translateY(-2px);
        box-shadow: 0 4px 10px rgba(25, 118, 210, 0.3);
      }
      
      &:active {
        transform: translateY(0);
      }
      
      i {
        font-size: 1.1rem;
      }
    }
  }
}

.furigana-permission-dialog {
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

.audio-permission-dialog {
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