<template>
  <div class="card-footer">
    <div class="review-actions">
      <button class="action-btn btn-good" @click="$emit('review-good')">
        <i class="ri-check-line"></i>
        <span>再来一个</span>
      </button>
      <button 
        class="action-btn favorite-btn" 
        :class="{ favorited: isFavorited, cooldown: favoriteCooldown > 0 }"
        @click="toggleFavorite"
        :disabled="favoriteLoading || favoriteCooldown > 0"
        :title="favoriteCooldown > 0 ? '操作过于频繁，请稍后再试' : (isFavorited ? '取消收藏' : '收藏单词')"
      >
        <i v-if="favoriteLoading" class="ri-loader-4-line loading"></i>
        <i v-else :class="isFavorited ? 'ri-heart-fill' : 'ri-heart-line'"></i>
        <span>点我收藏</span>
      </button>
      <button class="action-btn btn-easy" @click="$emit('show-contact')">
        <i class="ri-close-line"></i>
        <span>错误纠正</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
}

interface Props {
  currentWord: Word
  isFavorited?: boolean
  favoriteLoading?: boolean
  favoriteCooldown?: number
  toggleFavorite?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isFavorited: false,
  favoriteLoading: false,
  favoriteCooldown: 0,
  toggleFavorite: () => {}
})

defineEmits(['review-good', 'show-contact'])
</script>

<style lang="scss" scoped>
.card-footer {
  padding: var(--spacing-md);
  background-color: white;
  border-top: 1px solid #f0f0f0;
  border-radius: 0 0 var(--border-radius) var(--border-radius);
}

.review-actions {
  display: flex;
  gap: var(--spacing-sm);
  
  .action-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 12px;
    border: none;
    border-radius: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 1rem;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
    }
    
    &:active {
      transform: translateY(-1px);
    }
  }
  
  .btn-good {
    background: linear-gradient(135deg, #4CAF50, #2E7D32);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #43A047, #1B5E20);
      box-shadow: 0 6px 12px rgba(76, 175, 80, 0.3);
    }
  }
  
  .btn-easy {
    background: linear-gradient(135deg, #FF9800, #F57C00);
    color: white;
    
    &:hover {
      background: linear-gradient(135deg, #FB8C00, #EF6C00);
      box-shadow: 0 6px 12px rgba(255, 152, 0, 0.3);
    }
  }
  
  // 收藏按钮也使用统一的action-btn样式
  .favorite-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 16px 12px;
    border: none;
    border-radius: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 1rem;
    background: linear-gradient(135deg, #9575CD, #7E57C2);
    color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #7E57C2, #5E35B1);
      transform: translateY(-3px);
      box-shadow: 0 6px 12px rgba(126, 87, 194, 0.3);
    }
    
    &:active:not(:disabled) {
      transform: translateY(-1px);
    }
    
    &.favorited {
      background: linear-gradient(135deg, #E91E63, #C2185B);
      
      &:hover:not(:disabled) {
        background: linear-gradient(135deg, #D81B60, #AD1457);
        box-shadow: 0 6px 12px rgba(233, 30, 99, 0.3);
      }
    }
    
    &.cooldown {
      opacity: 0.7;
      cursor: not-allowed;
    }
    
    .loading {
      animation: spin 1s linear infinite;
    }
    
    i {
      font-size: 1.2rem;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>