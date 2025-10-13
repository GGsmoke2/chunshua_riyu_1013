<template>
  <div class="grammar-list-item">
    <div class="grammar-list-header">
      <div :class="['level-badge', getLevelClass(grammar.jlptLevel)]">{{ grammar.jlptLevel }}</div>
      <h3 class="grammar-title">{{ grammar.grammarName }}</h3>
    </div>
    
    <div class="grammar-list-body">
      <p class="explanation">{{ grammar.grammarMeaning }}</p>
      
      <div class="example-preview" v-if="grammar.exampleSentence1">
        <p class="jp-text" v-html="getExampleText(grammar.exampleSentence1)"></p>
        <p class="cn-text">{{ grammar.exampleTranslation1 }}</p>
      </div>
    </div>
    
    <div class="grammar-list-actions">
      <button class="btn-detail" @click="$emit('navigate-to-detail', grammar)">
        查看详情
        <i class="ri-arrow-right-line"></i>
      </button>
      <button 
        v-if="grammar.grammarSpeakVideoUrl"
        class="btn-explanation" 
        @click="$emit('show-explanation', grammar)"
      >
        <i class="ri-video-line"></i>
        讲解视频
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'
import { addFurigana } from '../../utils/furigana'

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

defineProps<{
  grammar: GrammarPoint
}>()

defineEmits(['navigate-to-detail', 'show-explanation'])

const authStore = useAuthStore()

const getExampleText = (text: string) => {
  if (!text) return ''
  
  // 检查假名标注权限 (isPaid > 1)
  if (!authStore.userInfo?.isPaid || authStore.userInfo.isPaid <= 1) {
    return text
  }
  
  return addFurigana(text)
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
.grammar-list-item {
  background-color: white;
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border-left: 3px solid var(--primary-color);
  transition: all var(--transition-fast);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

.grammar-list-header {
  padding: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .grammar-title {
    font-size: 1.2rem;
    margin: 0;
  }
  
  .level-badge {
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
}

.grammar-list-body {
  padding: var(--spacing-md);
  
  .explanation {
    margin-bottom: var(--spacing-md);
    font-size: 1.1rem;
    color: var(--text-color);
    line-height: 1.6;
    font-weight: 500;
  }
  
  .example-preview {
    background: linear-gradient(135deg, #f8faff, #e8f2ff);
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid var(--primary-color);
    
    .jp-text {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 8px;
      color: var(--text-color);
      font-weight: 500;
    }
    
    .cn-text {
      font-size: 0.95rem;
      color: var(--text-light);
      line-height: 1.5;
    }
  }
}

.grammar-list-actions {
  padding: var(--spacing-md);
  border-top: 1px solid var(--border-color);
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.btn-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 0.95rem;
  box-shadow: 0 4px 15px rgba(74, 144, 226, 0.3);
  flex: 1;
  justify-content: center;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(74, 144, 226, 0.4);
  }
  
  i {
    font-size: 1.1rem;
    transition: transform 0.3s ease;
  }
}

.btn-explanation {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #fff3e0, #ffe0b2);
  color: #f57c00;
  border: 2px solid #fff3e0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  font-size: 0.9rem;
  
  &:hover {
    background: linear-gradient(135deg, #ffe0b2, #ffcc80);
    border-color: #ff9800;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  i {
    font-size: 1.1rem;
  }
}
</style>