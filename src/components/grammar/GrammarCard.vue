<template>
  <div class="grammar-card detailed-card">
    <div class="grammar-card-header">
      <div :class="['level-badge', getLevelClass(grammar.jlptLevel)]">{{ grammar.jlptLevel }}</div>
      <h3 class="grammar-title">{{ grammar.grammarName }}</h3>
    </div>
    
    <div class="grammar-card-body">
      <!-- 语法含义 -->
      <div class="grammar-meaning-section">
        <h4 class="section-title">
          <i class="ri-book-open-line"></i>
          説明
        </h4>
        <p class="explanation">{{ grammar.grammarMeaning }}</p>
      </div>
      
      <!-- 例句部分 -->
      <div class="examples-section">
        <h4 class="section-title">
          <i class="ri-file-list-line"></i>
          例文
        </h4>
        
        <!-- 例句1 -->
        <div class="example-item" v-if="grammar.exampleSentence1">
          <div class="example-number">例文 1</div>
          <p class="jp-text" v-html="getExampleText(grammar.exampleSentence1)"></p>
          <p class="cn-text">{{ grammar.exampleTranslation1 }}</p>
        </div>
        
        <!-- 例句2 -->
        <div class="example-item" v-if="grammar.exampleSentence2">
          <div class="example-number">例文 2</div>
          <p class="jp-text" v-html="getExampleText(grammar.exampleSentence2)"></p>
          <p class="cn-text">{{ grammar.exampleTranslation2 }}</p>
        </div>
        
        <!-- 例句3 -->
        <div class="example-item" v-if="grammar.exampleSentence3">
          <div class="example-number">例文 3</div>
          <p class="jp-text" v-html="getExampleText(grammar.exampleSentence3)"></p>
          <p class="cn-text">{{ grammar.exampleTranslation3 }}</p>
        </div>
      </div>
    </div>
    
    <div class="grammar-card-footer">
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

defineEmits(['show-explanation'])

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
.grammar-card.detailed-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  cursor: default;
  display: flex;
  flex-direction: column;
  min-height: 500px;
  border: none;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);

    .btn-explanation {
      background: linear-gradient(135deg, #ffe0b2, #ffcc80);
      border-color: #ff9800;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
}

.grammar-card-header {
  padding: 24px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.level-badge {
  padding: 8px 16px;
  border-radius: 25px;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  
  &.level-n5 { 
    background: linear-gradient(135deg, #4CAF50, #45a049);
    color: #1b5e20;
  }
  &.level-n4 { 
    background: linear-gradient(135deg, #2196F3, #1976d2);
    color: #0d47a1;
  }
  &.level-n3 { 
    background: linear-gradient(135deg, #FF9800, #f57c00);
    color: #e65100;
  }
  &.level-n2 { 
    background: linear-gradient(135deg, #F44336, #d32f2f);
    color: #b71c1c;
  }
  &.level-n1 { 
    background: linear-gradient(135deg, #9C27B0, #7b1fa2);
    color: #4a148c;
  }
}

.grammar-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
  flex: 1;
  margin-right: 16px;
}

.grammar-card-body {
  flex: 1;
  padding: 24px;
  background: white;
  display: flex;
  flex-direction: column;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 4px;

  i {
    font-size: 1.1rem;
  }
}

.grammar-meaning-section {
  .explanation {
    font-size: 1.1rem;
    color: var(--text-color);
    line-height: 1.6;
    margin: 0;
    font-weight: 500;
    background: linear-gradient(135deg, #f8faff, #e8f2ff);
    padding: 16px;
    border-radius: 8px;
    border-left: 4px solid var(--accent-color);
  }
}

.examples-section {
  .example-item {
    background: linear-gradient(135deg, #fff8f0, #ffeee6);
    padding: 16px;
    border-radius: 12px;
    border-left: 4px solid #ff9800;
    margin-bottom: var(--spacing-md);
    position: relative;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .example-number {
      position: absolute;
      top: 8px;
      right: 12px;
      font-size: 0.8rem;
      color: var(--text-light);
      background-color: rgba(255, 255, 255, 0.8);
      padding: 2px 8px;
      border-radius: 10px;
      font-weight: 500;
    }
    
    .jp-text {
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 8px;
      color: var(--text-color);
      font-weight: 500;
      padding-right: 60px;
    }
    
    .cn-text {
      font-size: 0.95rem;
      color: var(--text-light);
      line-height: 1.5;
      margin: 0;
      padding-top: 8px;
      border-top: 1px dashed rgba(255, 152, 0, 0.3);
    }
  }
}

.grammar-card-footer {
  padding: 20px 24px;
  background: linear-gradient(135deg, #f8faff, #e8f2ff);
  border-top: 1px solid rgba(74, 144, 226, 0.1);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  align-items: center;
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

/* 响应式设计 */
@media (max-width: 768px) {
  .grammar-card.detailed-card {
    min-height: auto;
    margin-bottom: var(--spacing-md);
  }
  
  .grammar-card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
    text-align: left;
    padding: 20px;
  }
  
  .grammar-title {
    font-size: 1.4rem;
    margin-right: 0;
    margin-bottom: 8px;
    line-height: 1.3;
    text-align: left;
    width: 100%;
    word-break: break-word;
  }
  
  .level-badge {
    align-self: flex-end;
    margin-bottom: 0;
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .grammar-card-body {
    padding: 16px 20px;
    gap: var(--spacing-md);
  }
  
  .section-title {
    font-size: 0.9rem;
    margin-bottom: 8px;
  }
  
  .grammar-meaning-section {
    .explanation {
      font-size: 1rem;
      padding: 12px;
      line-height: 1.5;
    }
  }
  
  .examples-section {
    .example-item {
      padding: 12px;
      margin-bottom: 10px;
      
      .jp-text {
        font-size: 1rem;
        padding-right: 0;
        margin-bottom: 8px;
        line-height: 1.5;
      }
      
      .cn-text {
        font-size: 0.9rem;
        line-height: 1.4;
      }
      
      .example-number {
        position: relative;
        top: auto;
        right: auto;
        display: inline-block;
        margin-bottom: 6px;
        font-size: 0.75rem;
        padding: 1px 6px;
      }
    }
  }
  
  .grammar-card-footer {
    flex-direction: column;
    gap: 10px;
    padding: 16px 20px;
  }
  
  .btn-explanation {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .grammar-card-header {
    padding: 16px;
  }
  
  .grammar-title {
    font-size: 1.2rem;
  }
  
  .grammar-card-body {
    padding: 12px 16px;
  }
  
  .grammar-card-footer {
    padding: 12px 16px;
  }
  
  .level-badge {
    font-size: 0.75rem;
    padding: 4px 8px;
  }
}
</style>