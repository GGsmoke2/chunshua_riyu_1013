<template>
  <div class="grammar-filters">
    <div class="filter-group">
      <label>等级</label>
      <div class="filter-buttons">
        <button 
          v-for="level in levels"
          :key="level"
          :class="['filter-btn', { active: currentLevel === level }]"
          @click="$emit('level-change', level)"
        >
          {{ level }}
        </button>
      </div>
    </div>
    
    <div class="filter-group">
      <label>显示模式</label>
      <div class="display-toggle">
        <button 
          :class="['toggle-btn', { active: displayMode === 'card' }]" 
          @click="$emit('display-mode-change', 'card')"
        >
          <i class="ri-layout-grid-fill"></i>
          卡片
        </button>
        <button 
          :class="['toggle-btn', { active: displayMode === 'list' }]" 
          @click="$emit('display-mode-change', 'list')"
        >
          <i class="ri-list-check"></i>
          列表
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentLevel: string
  displayMode: string
  levels: string[]
}>()

defineEmits(['level-change', 'display-mode-change'])
</script>

<style lang="scss" scoped>
.grammar-filters {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  margin-bottom: var(--spacing-xl);
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  justify-content: space-between;
}

.filter-group {
  flex: 1;
  min-width: 200px;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: var(--spacing-sm);
    color: var(--text-light);
  }
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.filter-btn {
  background: none;
  border: 1px solid var(--border-color);
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: 0.9rem;

  &:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
  }

  &.active {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
    color: white;
  }
}

.display-toggle {
  display: flex;
  border: 1px solid var(--border-color);
  border-radius: 20px;
  overflow: hidden;
  
  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    background: none;
    border: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    
    &.active {
      background-color: var(--primary-color);
      color: white;
    }
    
    &:not(.active):hover {
      background-color: var(--background-color);
    }
    
    i {
      font-size: 1.1rem;
    }
  }
}
</style>