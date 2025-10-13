<template>
  <div class="word-details-modern">
    <!-- 顶部装饰条 -->
    <div class="top-decoration"></div>
    
    <!-- 主要内容区域 -->
    <div class="details-container">
      <!-- 单词主体信息 -->
      <div class="word-main-section">
        <div class="level-badge-container">
          <span :class="['level-badge-modern', getLevelClass(word.level)]">
            {{ word.level }}
          </span>
        </div>
        
        <div class="word-display">
          <h2 class="kanji-display">{{ word.kanji }}</h2>
          <p class="kana-display">{{ word.kana }}</p>
          <div class="meaning-card">
            <p class="meaning-text">{{ word.meaning }}</p>
          </div>
        </div>
        
        <!-- 操作按钮组 -->
        <div class="action-buttons-group">
          <!-- 收藏按钮 -->
          <button 
            class="modern-action-btn favorite-btn" 
            :class="{ favorited: isFavorited, cooldown: favoriteCooldown > 0 }"
            @click="toggleFavorite"
            :disabled="favoriteLoading || favoriteCooldown > 0"
            :title="favoriteCooldown > 0 ? '操作过于频繁，请稍后再试' : (isFavorited ? '取消收藏' : '收藏单词')"
          >
            <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
            <template v-else>
              <i :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'"></i>
            </template>
          </button>

          <button 
            v-if="shouldShowWordAudioButton"
            class="modern-action-btn audio-btn" 
            @click="playPronunciation" 
            :class="{ playing: isPlayingWord }"
            title="播放发音"
          >
            <i :class="isPlayingWord ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            <span>发音</span>
          </button>
          <button 
            v-if="showVideoButton" 
            class="modern-action-btn video-btn" 
            @click="playExplanationVideo" 
            title="播放讲解视频"
          >
            <i class="ri-video-line"></i>
            <span>视频</span>
          </button>
        </div>
      </div>
      
      <!-- 例句部分 -->
      <div v-if="hasExamples" class="examples-modern-section">
        <div class="section-header">
          <i class="ri-chat-quote-line"></i>
          <h3>例句</h3>
        </div>
        
        <div class="examples-grid">
          <div v-if="word.example" class="example-card">
            <div class="example-content">
              <p class="japanese-text" v-html="getExampleText(word.example)"></p>
              <p class="translation-text">{{ word.exampleMeaning }}</p>
            </div>
            <button 
              v-if="hasAudioPermission"
              class="example-audio-btn" 
              @click="playExamplePronunciation(word.example, 0)"
              :class="{ playing: playingExample === 0 }"
            >
              <i :class="playingExample === 0 ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            </button>
          </div>
          
          <div v-if="word.example2" class="example-card">
            <div class="example-content">
              <p class="japanese-text" v-html="getExampleText(word.example2)"></p>
              <p class="translation-text">{{ word.exampleMeaning2 }}</p>
            </div>
            <button 
              v-if="hasAudioPermission"
              class="example-audio-btn" 
              @click="playExamplePronunciation(word.example2, 1)"
              :class="{ playing: playingExample === 1 }"
            >
              <i :class="playingExample === 1 ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            </button>
          </div>
          
          <div v-if="word.example3" class="example-card">
            <div class="example-content">
              <p class="japanese-text" v-html="getExampleText(word.example3)"></p>
              <p class="translation-text">{{ word.exampleMeaning3 }}</p>
            </div>
            <button 
              v-if="hasAudioPermission"
              class="example-audio-btn" 
              @click="playExamplePronunciation(word.example3, 2)"
              :class="{ playing: playingExample === 2 }"
            >
              <i :class="playingExample === 2 ? 'ri-volume-vibrate-line' : 'ri-volume-up-line'"></i>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 标签部分 -->
      <div v-if="word.tags && word.tags.length > 0" class="tags-modern-section">
        <div class="section-header">
          <i class="ri-price-tag-3-line"></i>
          <h3>标签</h3>
        </div>
        <div class="tags-container">
          <span v-for="tag in word.tags" :key="tag" class="modern-tag">
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 音频权限弹窗 -->
  <teleport to="body">
    <CustomerServiceDialog
      v-model:visible="showAudioPermissionDialog"
      title="扫码添加客服开通音频权限"
      dialog-class="audio-permission-dialog"
    />
  </teleport>
  
  <!-- 视频权限弹窗 -->
  <teleport to="body">
    <CustomerServiceDialog
      v-model:visible="showVideoPermissionDialog"
      title="扫码添加客服开通视频权限"
      dialog-class="video-permission-dialog"
    />
  </teleport>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { playWordAudio, playExampleAudio, stopAllAudio } from '../../utils/audio'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'
import { addFurigana } from '../../utils/furigana'
import { ElMessage } from 'element-plus'
import axios from 'axios'
import { API_ENDPOINTS } from '../../config/api'

interface WordDetail {
  id: string
  kanji: string
  kana: string
  meaning: string
  example?: string
  exampleMeaning?: string
  example2?: string
  exampleMeaning2?: string
  example3?: string
  exampleMeaning3?: string
  level: string
  tags?: string[]
  explanationUrl?: string
  wordAudioUrl?: string
  wordSpeakVideoUrl?: string
}

const props = defineProps<{
  word: WordDetail
}>()

const emit = defineEmits(['play-explanation-video', 'dialog-closed'])

const authStore = useAuthStore()
const showAudioPermissionDialog = ref(false)
const showVideoPermissionDialog = ref(false)

// 音频播放状态
const isPlayingWord = ref(false)
const playingExample = ref<number | null>(null)

// 收藏相关状态
const isFavorited = ref(false)
const favoriteLoading = ref(false)
const favoriteCooldown = ref(0)
const cooldownInterval = ref<number | null>(null)

const hasExamples = computed(() => {
  return props.word.example || props.word.example2 || props.word.example3
})

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

// 检查是否显示视频按钮
const showVideoButton = computed(() => {
  return props.word.wordSpeakVideoUrl && props.word.wordSpeakVideoUrl.trim() !== '' && props.word.wordSpeakVideoUrl !== 'null'
})

// 播放讲解视频
const playExplanationVideo = () => {
  // 检查视频权限
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid < 3) {
    showVideoPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordSpeakVideoUrl) {
    console.warn('没有视频URL')
    return
  }
  
  emit('play-explanation-video', props.word)
}

const playPronunciation = () => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 添加JLPT等级权限检查
  const hasJlptAccess = authStore.userInfo?.[`japanese${props.word.level}`] === 1
  if (!hasJlptAccess) {
    showAudioPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  // 重置播放状态
  playingExample.value = null
  isPlayingWord.value = true
  
  playWordAudio(
    props.word.wordAudioUrl,
    () => {
      isPlayingWord.value = true
    },
    () => {
      isPlayingWord.value = false
    },
    () => {
      isPlayingWord.value = false
    }
  )
}

const playExamplePronunciation = (example: string | undefined, index: number) => {
  // 检查音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    showAudioPermissionDialog.value = true
    return
  }
  
  // 添加JLPT等级权限检查
  const hasJlptAccess = authStore.userInfo?.[`japanese${props.word.level}`] === 1
  if (!hasJlptAccess) {
    showAudioPermissionDialog.value = true
    return
  }
  
  if (!props.word.wordAudioUrl) {
    console.warn('没有音频URL')
    return
  }
  
  // 停止所有其他音频
  stopAllAudio()
  
  // 重置播放状态
  isPlayingWord.value = false
  playingExample.value = index
  
  // 确定例句索引
  let exampleIndex = 0
  if (example === props.word.example2) {
    exampleIndex = 1
  } else if (example === props.word.example3) {
    exampleIndex = 2
  }
  
  playExampleAudio(
    props.word.wordAudioUrl,
    exampleIndex,
    () => {
      playingExample.value = index
    },
    () => {
      playingExample.value = null
    },
    () => {
      playingExample.value = null
    }
  )
}

// 组件挂载时的处理
onMounted(() => {
  checkFavoriteStatus()
})

// 组件卸载时停止所有音频
onUnmounted(() => {
  stopAllAudio()
  if (cooldownInterval.value) {
    clearInterval(cooldownInterval.value)
  }
  // 通知父组件弹窗已关闭
  emit('dialog-closed')
})

// 检查收藏状态
const checkFavoriteStatus = async () => {
  if (!authStore.isLoggedIn || !props.word?.id) {
    return
  }
  
  try {
    const response = await axios.post(API_ENDPOINTS.favorite.checkWordFavoriteStatus, {
      userId: authStore.userInfo?.userId?.toString() || '',
      token: authStore.token || '',
      wordId: props.word.id.toString()
    })
    
    if (response.data.code === 200) {
      isFavorited.value = response.data.data.isFavorited || false
    }
  } catch (error) {
    console.error('检查单词收藏状态失败:', error)
  }
}

// 切换收藏状态
const toggleFavorite = async () => {
  if (!authStore.isLoggedIn) {
    ElMessage.warning('请先登录后再进行收藏操作')
    return
  }
  
  if (favoriteLoading.value) {
    return
  }
  
  favoriteLoading.value = true
  
  try {
    if (isFavorited.value) {
      // 取消收藏
      const response = await axios.post(API_ENDPOINTS.favorite.removeWordFromFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: props.word.id.toString()
      })
      
      if (response.data.code === 200) {
        isFavorited.value = false
        ElMessage.success(response.data.msg || '已取消收藏')
        startCooldown()
      } else {
        ElMessage.error(response.data.msg || '取消收藏失败')
      }
    } else {
      // 添加收藏
      const favoriteNotes = `${props.word.level || 'N5'}等级单词\n${props.word.kanji}（${props.word.kana}）- ${props.word.meaning}`
      
      const response = await axios.post(API_ENDPOINTS.favorite.addWordToFavorites, {
        userId: authStore.userInfo?.userId?.toString() || '',
        token: authStore.token || '',
        wordId: props.word.id.toString(),
        tags: props.word.tags?.join(',') || '',
        customNote: favoriteNotes,
        memorizedTime: null, // 暂未掌握
        reviewCount: 0, // 初始复习次数
        lastReviewTime: null, // 暂无复习记录
        nextReviewTime: null, // 系统将根据算法计算
        difficultyLevel: getDifficultyFromJlptLevel(props.word.level) // 根据JLPT等级映射难度
      })
      
      if (response.data.code === 200) {
        isFavorited.value = true
        ElMessage.success(response.data.msg || '收藏成功')
        startCooldown()
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
    favoriteLoading.value = false
  }
}

// 冷却时间管理
const startCooldown = () => {
  // 移除3秒倒计时限制
  favoriteCooldown.value = 0
}

// 添加权限检查函数
const getExampleText = (text: string) => {
  if (!text) return ''
  
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    return text
  }
  
  return addFurigana(text)
}

// 添加音频权限检查的计算属性
const hasAudioPermission = computed(() => {
  // 检查用户是否有音频权限
  if ((authStore.userInfo?.isPaid || 0) < 2) {
    return false
  }
  
  // 检查JLPT等级权限
  const hasJlptAccess = authStore.userInfo?.[`japanese${props.word.level}`] === 1
  if (!hasJlptAccess) {
    return false
  }
  
  return true
})

// 检查是否显示单词音频按钮
const shouldShowWordAudioButton = computed(() => {
  return props.word.wordAudioUrl && 
         props.word.wordAudioUrl.trim() !== '' && 
         hasAudioPermission.value
})

// 根据JLPT等级获取难度值的辅助函数
const getDifficultyFromJlptLevel = (jlptLevel: string): number => {
  switch (jlptLevel) {
    case 'N5': return 1 // 最简单
    case 'N4': return 2
    case 'N3': return 3
    case 'N2': return 4
    case 'N1': return 5 // 最难
    default: return 3 // 默认中等难度
  }
}
</script>

<style lang="scss" scoped>
.word-details-modern {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.top-decoration {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
}

.details-container {
  padding: 24px;
}

.word-main-section {
  text-align: center;
  margin-bottom: 32px;
  
  .level-badge-container {
    margin-bottom: 16px;
    
    .level-badge-modern {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 700;
      color: white;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      
      &.level-n5 { 
        background: linear-gradient(135deg, #10b981, #059669);
      }
      &.level-n4 { 
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      }
      &.level-n3 { 
        background: linear-gradient(135deg, #f59e0b, #d97706);
      }
      &.level-n2 { 
        background: linear-gradient(135deg, #ef4444, #dc2626);
      }
      &.level-n1 { 
        background: linear-gradient(135deg, #8b5cf6, #7c3aed);
      }
    }
  }
  
  .word-display {
    margin-bottom: 24px;
    
    .kanji-display {
      font-size: 3.5rem;
      font-weight: 800;
      background: linear-gradient(135deg, #4f46e5, #7c3aed);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      line-height: 1.2;
    }
    
    .kana-display {
      font-size: 1.5rem;
      color: #64748b;
      margin-bottom: 16px;
      font-weight: 500;
    }
    
    .meaning-card {
      background: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
      border: 1px solid #e2e8f0;
      
      .meaning-text {
        font-size: 1.1rem;
        color: #334155;
        font-weight: 500;
        margin: 0;
      }
    }
  }
  
  .action-buttons-group {
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
    
    .modern-action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 20px;
      border: none;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      
      &.favorite-btn {
        background: linear-gradient(135deg, #f8f9fa, #e9ecef);
        color: #6c757d;
        border: 2px solid #dee2e6;
        
        &:hover:not(:disabled) {
          background: linear-gradient(135deg, #e9ecef, #dee2e6);
          color: #495057;
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }
        
        &.favorited {
          background: linear-gradient(135deg, #e74c3c, #c0392b);
          color: white;
          border-color: #e74c3c;
          
          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #c0392b, #a93226);
            border-color: #c0392b;
            color: white;
          }
        }
        
        &.cooldown {
          background: linear-gradient(135deg, #f8f9fa, #e9ecef);
          color: #6c757d;
          border-color: #dee2e6;
          cursor: not-allowed;
          
          &:hover {
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            color: #6c757d;
            transform: none;
          }
          
          .cooldown-text {
            font-size: 0.85rem;
            font-weight: 600;
          }
        }
        
        .loading {
          animation: pulse 1.5s infinite;
        }
      }
      
      &.audio-btn {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
        }
        
        &.playing {
          background: linear-gradient(135deg, #10b981, #059669);
          animation: pulse 1.5s infinite;
        }
      }
      
      &.video-btn {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
        
        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(245, 158, 11, 0.3);
        }
      }
      
      i {
        font-size: 1.2rem;
      }
      
      span {
        font-size: 0.95rem;
      }
    }
  }
}

.examples-modern-section,
.tags-modern-section {
  margin-bottom: 24px;
  
  .section-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
    
    i {
      font-size: 1.2rem;
      color: #4f46e5;
    }
    
    h3 {
      font-size: 1.1rem;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
  }
}

.examples-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  .example-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: white;
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    border: 1px solid #e2e8f0;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      transform: translateY(-1px);
    }
    
    .example-content {
      flex: 1;
      
      .japanese-text {
        font-size: 1.05rem;
        color: #1e293b;
        margin-bottom: 6px;
        font-weight: 500;
        line-height: 1.5;
      }
      
      .translation-text {
        font-size: 0.95rem;
        color: #64748b;
        margin: 0;
        line-height: 1.4;
      }
    }
    
    .example-audio-btn {
      flex-shrink: 0;
      width: 40px;
      height: 40px;
      border: none;
      border-radius: 10px;
      background: linear-gradient(135deg, #e2e8f0, #cbd5e1);
      color: #475569;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      
      &:hover {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        transform: scale(1.05);
      }
      
      &.playing {
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        animation: pulse 1.5s infinite;
      }
      
      i {
        font-size: 1.1rem;
      }
    }
  }
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  
  .modern-tag {
    background: linear-gradient(135deg, #e0e7ff, #c7d2fe);
    color: #4338ca;
    font-size: 0.85rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 20px;
    border: 1px solid #c7d2fe;
    transition: all 0.3s ease;
    
    &:hover {
      background: linear-gradient(135deg, #4f46e5, #4338ca);
      color: white;
      transform: translateY(-1px);
    }
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

// 权限弹窗样式
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
.japanese-text {
  // 假名标注样式
  ruby {
    ruby-align: center;
    
    rt {
      font-size: 0.7em;
      color: #666;
      font-weight: normal;
      line-height: 1;
      margin-top: 2px;
    }
  }
}
// 响应式设计
@media (max-width: 768px) {
  .details-container {
    padding: 16px;
  }
  
  .word-display {
    .kanji-display {
      font-size: 2.5rem;
    }
    
    .kana-display {
      font-size: 1.2rem;
    }
  }
  
  .action-buttons-group {
    flex-direction: column;
    align-items: center;
    
    .modern-action-btn {
      width: 100%;
      max-width: 200px;
      justify-content: center;
    }
  }
  
  .examples-grid {
    .example-card {
      flex-direction: column;
      gap: 12px;
      
      .example-audio-btn {
        align-self: flex-end;
      }
    }
  }
}
</style>