<template>
  <div class="card-header">
    <div :class="['level-badge', getLevelClass(currentWord.level)]">
      <i class="ri-book-mark-line"></i>
      {{ currentWord.level }}
    </div>
    <div class="progress">
      <i class="ri-task-line"></i>
      {{ currentIndex + 1 }} / {{ filteredWords.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
interface Word {
  id: string
  kanji: string
  kana: string
  meaning: string
  level: string
  example?: string
  exampleMeaning?: string
}

interface Props {
  currentWord: Word
  currentIndex: number
  filteredWords: any[]
  isFavorited?: boolean
  favoriteLoading?: boolean
  favoriteCooldown?: number
  toggleFavorite?: () => void
}

withDefaults(defineProps<Props>(), {
  isFavorited: false,
  favoriteLoading: false,
  favoriteCooldown: 0,
  toggleFavorite: () => {}
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
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-md);
  background: linear-gradient(135deg, #f8f9ff, #ffffff);
  border-bottom: 1px solid #eef2f7;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  
  .level-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    color: white;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    
    &.level-n5 { 
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
    }
    &.level-n4 { 
      background: linear-gradient(135deg, #2196F3, #1565C0);
    }
    &.level-n3 { 
      background: linear-gradient(135deg, #FF9800, #EF6C00);
    }
    &.level-n2 { 
      background: linear-gradient(135deg, #F44336, #C62828);
    }
    &.level-n1 { 
      background: linear-gradient(135deg, #9C27B0, #6A1B9A);
    }
  }
  
  .progress {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.9rem;
    color: #555;
    background: rgba(240, 240, 240, 0.7);
    padding: 6px 14px;
    border-radius: 20px;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }
}
</style>