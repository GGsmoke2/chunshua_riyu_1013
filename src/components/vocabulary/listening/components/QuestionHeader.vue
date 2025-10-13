<template>
  <div class="question-header">
    <div :class="['level-badge', levelClass]">{{ level }}</div>
    <!-- 收藏按钮 -->
    <button 
      v-if="showFavorite"
      class="favorite-btn" 
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
  </div>
</template>

<script setup lang="ts">
interface Props {
  level: string
  levelClass: string
  showFavorite?: boolean
  isFavorited?: boolean
  favoriteLoading?: boolean
  favoriteCooldown?: number
  toggleFavorite?: () => void
}

withDefaults(defineProps<Props>(), {
  showFavorite: false,
  isFavorited: false,
  favoriteLoading: false,
  favoriteCooldown: 0,
  toggleFavorite: () => {}
})
</script>

<style lang="scss" scoped>
.question-header {
  padding: var(--spacing-md);
  background-color: var(--background-color);
  display: flex;
  justify-content: flex-end;
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

.favorite-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border: 2px solid var(--border-color);
  border-radius: 20px;
  background-color: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 80px;
  height: 28px;
  margin-left: var(--spacing-sm);
  
  &:hover:not(:disabled) {
    border-color: var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-1px);
  }
  
  &.favorited {
    background-color: #e74c3c;
    border-color: #e74c3c;
    color: white;
    
    &:hover:not(:disabled) {
      background-color: #c0392b;
      border-color: #c0392b;
      color: white;
    }
  }
  
  &.cooldown {
    background-color: #f8f9fa;
    color: #6c757d;
    border-color: #dee2e6;
    
    &:hover {
      background-color: #f8f9fa;
      color: #6c757d;
      transform: none;
    }
    
    .cooldown-text {
      font-size: 0.85rem;
      font-weight: 600;
    }
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
  
  .loading {
    animation: spin 1s linear infinite;
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>