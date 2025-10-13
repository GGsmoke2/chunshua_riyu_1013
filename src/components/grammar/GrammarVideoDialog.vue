<template>
  <el-dialog
    :model-value="visible"
    title="语法讲解视频"
    width="640px"
    center
    :show-close="false"
    class="video-dialog"
    @update:model-value="$emit('update:visible', $event)"
    @closed="$emit('closed')"
  >
    <div v-if="videoUrl" class="video-container">
      <video ref="videoRef" controls class="explanation-video" controlsList="nodownload nofullscreen" 
        disablePictureInPicture 
        disableRemotePlayback>
        <source :src="videoUrl" type="video/mp4">
        您的设备暂不支持视频播放
      </video>
    </div>
    <div v-else class="no-video-message">
      <i class="ri-film-line"></i>
      <p>纯纯老师的讲解视频正在精心制作中，期待与你相见～</p>
      <p>请关注我们的企微和抖音,您的支持是我们最大的动力</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="$emit('update:visible', false)">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  visible: boolean
  videoUrl: string | null
}>()

const emit = defineEmits(['update:visible', 'closed'])

const videoRef = ref<HTMLVideoElement | null>(null)

const stopVideo = () => {
  if (videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
  }
}

watch(() => props.visible, (newVal) => {
  if (!newVal) {
    stopVideo()
    emit('closed')
  }
})

watch(() => props.videoUrl, (newUrl, oldUrl) => {
  // 当视频URL改变时，重新加载视频
  if (newUrl !== oldUrl && videoRef.value) {
    videoRef.value.pause()
    videoRef.value.currentTime = 0
    if (newUrl) {
      // 强制重新加载新的视频源
      setTimeout(() => {
        if (videoRef.value) {
          videoRef.value.load()
        }
      }, 50)
    }
  }
})

onMounted(() => {
  // 添加键盘事件监听器，按ESC关闭对话框
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.visible) {
      emit('update:visible', false)
    }
  }
  
  window.addEventListener('keydown', handleKeyDown)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown)
    stopVideo()
  })
})
</script>

<style lang="scss" scoped>
.video-dialog {
  :deep(.el-dialog__header) {
    margin-right: 0;
    text-align: center;
  }

  .video-container {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
  }

  .explanation-video {
    width: 100%;
    border-radius: var(--border-radius);
  }

  .no-video-message {
    text-align: center;
    padding: var(--spacing-xl) 0;
    color: var(--text-light);

    i {
      font-size: 3rem;
      margin-bottom: var(--spacing-md);
      opacity: 0.5;
    }

    p {
      font-size: 1.1rem;
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}
</style>