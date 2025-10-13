<template>
  <div class="grammar-practice-mode">
    <div v-if="!practiceStarted" class="practice-intro">
      <div class="practice-header">
        <div class="header-content">
          <div class="header-title">
            <h2>学习时刻</h2>
            <p>每天坚持学习语法的你，真的超级酷！</p>
          </div>
          
          <div class="level-filters">
            <button 
              v-for="level in ['全部', 'N1', 'N2', 'N3', 'N4', 'N5']" 
              :key="level"
              :class="['level-btn', { active: practiceLevelValue === level }]"
              @click="$emit('practice-level-change', level)"
            >
              {{ level }}
            </button>
          </div>
          
          <button class="btn-start-practice" @click="$emit('start-practice')">
            开始学习
            <i class="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="practice-content">
      <div class="grammar-review-card" v-if="currentGrammar">
        <div class="card-header">
          <div :class="['level-badge', getLevelClass(currentGrammar.jlptLevel)]">{{ currentGrammar.jlptLevel }}</div>
        </div>

        <div class="card-body">
          <div class="grammar-section">
            <h3 class="grammar-title">{{ currentGrammar.grammarName }}</h3>
          </div>
          
          <div class="meaning-section" :class="{ 'revealed': meaningRevealed }">
            <button v-if="!meaningRevealed" class="btn-reveal" @click="$emit('reveal-meaning')">
              <i class="ri-eye-line"></i>
              显示含义
            </button>
            <div v-else class="meaning">
              <p>{{ currentGrammar.grammarMeaning }}</p>
            </div>
          </div>
          
          <div v-if="!exampleRevealed && hasExamplePermission" 
              class="example-section" :class="{ 'revealed': exampleRevealed }">
            <button 
              class="btn-reveal" 
              @click="handleRevealExample"
            >
              <i class="ri-eye-line"></i>
              显示例句
            </button>

          </div>
        </div>

        <div class="card-footer">
          <div class="review-actions">
            <button class="btn-good" @click="$emit('next-grammar')">
              <i class="ri-check-line"></i>
              再来一个
            </button>
            <button class="btn-easy" @click="$emit('show-contact')">
              <i class="ri-check-line"></i>
              错误纠正
            </button>
          </div>
        </div>

        <!-- 在最后一个语法的卡片上显示加载中 -->
        <div v-if="isLoading && currentGrammarIndex === practiceGrammarPoints.length - 1" class="loading-overlay">
          <div class="loading-indicator">
            <i class="ri-loader-4-line spinning"></i>
            <span>加载中...</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 假名标注权限弹窗 -->
    <CustomerServiceDialog
      v-model:visible="showFuriganaPermissionDialog"
      title="扫码添加客服开通假名标注权限"
      dialog-class="furigana-permission-dialog"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { addFurigana } from '../../utils/furigana'
import CustomerServiceDialog from '../common/CustomerServiceDialog.vue'

interface GrammarPoint {
  grammarId: number
  grammarName: string
  grammarForm: string
  grammarMeaning: string
  exampleSentence1: string
  exampleTranslation1: string
  exampleSentence2: string
  exampleTranslation2: string
  exampleSentence3: string
  exampleTranslation3: string
  jlptLevel: string
  grammarSpeakVideoUrl?: string
}

const props = defineProps<{
  practiceStarted: boolean
  practiceLevelValue: string
  currentGrammar: GrammarPoint | null
  currentGrammarIndex: number
  practiceGrammarPoints: GrammarPoint[]
  meaningRevealed: boolean
  exampleRevealed: boolean
  isLoading: boolean
}>()

const emit = defineEmits([
  'practice-level-change',
  'start-practice',
  'reveal-meaning',
  'reveal-example',
  'next-grammar',
  'show-contact'
])

const authStore = useAuthStore()
const showFuriganaPermissionDialog = ref(false)

// 添加权限检查的计算属性
const hasExamplePermission = computed(() => {
  return authStore.userInfo?.isPaid && authStore.userInfo.isPaid >= 3
})

const handleRevealExample = () => {
  // 由于按钮只在有权限时显示，这里可以直接触发事件
  emit('reveal-example')
}

const getExampleText = () => {
  if (!props.currentGrammar?.exampleSentence1) return ''
  
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    return props.currentGrammar.exampleSentence1
  }
  
  return addFurigana(props.currentGrammar.exampleSentence1)
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
</script>

<style lang="scss" scoped>
.practice-intro {
  background-color: white;
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
}

.practice-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  padding: var(--spacing-lg);
  position: relative;
  overflow: hidden;
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-lg);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
    border-radius: 50%;
    transform: translate(50%, -50%);
  }
  
  .header-content {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .header-title {
    text-align: center;
    margin-bottom: var(--spacing-md);
    
    h2 {
      font-size: 1.8rem;
      margin-bottom: var(--spacing-xs);
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    p {
      opacity: 0.9;
      font-size: 1.1rem;
      font-weight: 300;
    }
  }
}

.level-filters {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  
  .level-btn {
    padding: 8px 16px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
    font-weight: 500;

    &:hover {
      background-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &.active {
      background-color: white;
      border-color: white;
      color: var(--primary-color);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
}

.btn-start-practice {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: white;
  color: var(--primary-color);
  border: none;
  padding: 12px 30px;
  border-radius: var(--border-radius);
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-top: var(--spacing-md);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
  }

  i {
    transition: transform var(--transition-fast);
  }

  &:hover i {
    transform: translateX(4px);
  }
}

.practice-content {
  padding: var(--spacing-lg);
}

.grammar-review-card {
  background-color: #f5f9ff;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  position: relative;
  max-width: 600px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background-color: white;
  border-bottom: 1px solid #f0f0f0;
}

.level-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
  
  &.level-n5 { 
    background-color: #4CAF50;
  }
  &.level-n4 { 
    background-color: #2196F3;
  }
  &.level-n3 { 
    background-color: #FF9800;
  }
  &.level-n2 { 
    background-color: #F44336;
  }
  &.level-n1 { 
    background-color: #9C27B0;
  }
}

.card-body {
  padding: var(--spacing-lg);
}

.grammar-section {
  text-align: center;
  margin-bottom: var(--spacing-lg);
  
  .grammar-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: var(--spacing-xs);
  }
}

.meaning-section, .example-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: white;
  border-radius: var(--border-radius);
  text-align: center;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &.revealed {
    border-left: 4px solid var(--primary-color);
  }
  
  .btn-reveal {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: var(--primary-color);
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
  
  .meaning, .example {
    width: 100%;
    
    p {
      margin-bottom: 0;
      font-size: 1.2rem;
      color: var(--primary-color);
      font-weight: 500;
    }
    
    .jp-text {
      font-size: 1.2rem;
      margin-bottom: var(--spacing-sm);
    }
    
    .example-meaning {
      color: #666;
      font-size: 1rem;
      margin-bottom: var(--spacing-sm);
    }
  }
}

.card-footer {
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid #f0f0f0;
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  button {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 12px 0;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }
  }
  
  .btn-good {
    background-color: #e8f5e9;
    color: #43a047;
    
    &:hover {
      background-color: #c8e6c9;
    }
  }
  
  .btn-easy {
    background-color: #fff8e1;
    color: #ffa000;
    
    &:hover {
      background-color: #ffecb3;
    }
  }
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.loading-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-color);
  font-weight: 500;
  
  .spinning {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
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
</style>

<style lang="scss" scoped>
@media (max-width: 768px) {
  .grammar-title {
    font-size: 1.8rem !important;
  }
  
  .meaning-section, .example-section {
    p {
      font-size: 1rem !important;
    }
    
    .jp-text {
      font-size: 1rem !important;
    }
  }
}
</style>