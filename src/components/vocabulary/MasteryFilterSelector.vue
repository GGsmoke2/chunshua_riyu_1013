<template>
  <div class="mastery-filter-selector">
    <div class="filter-label">掌握状态：</div>
    <div class="filter-options">
      <button 
        v-for="option in masteryOptions" 
        :key="option.value"
        :class="['filter-btn', { active: currentMasteryFilter === option.value }]"
        @click="selectMasteryFilter(option.value)"
      >
        <i :class="option.icon"></i>
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface MasteryOption {
  value: string
  label: string
  icon: string
}

const props = defineProps<{
  currentMasteryFilter: string
}>()

const emit = defineEmits(['change-mastery-filter'])

const masteryOptions: MasteryOption[] = [
  { value: 'all', label: '全部', icon: 'ri-list-check' },
  { value: 'mastered', label: '已掌握', icon: 'ri-check-line' },
  { value: 'unmastered', label: '未掌握', icon: 'ri-time-line' }
]

const selectMasteryFilter = (masteryFilter: string) => {
  emit('change-mastery-filter', masteryFilter)
}
</script>

<style lang="scss" scoped>
.mastery-filter-selector {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .filter-label {
    font-size: 0.9rem;
    font-weight: 500;
    color: #606266;
    white-space: nowrap;
  }
  
  .filter-options {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
  
  .filter-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    font-size: 0.85rem;
    border: 1px solid #e3e8f7;
    border-radius: 20px;
    background: white;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    
    &:hover {
      background: #f5f7fa;
      border-color: var(--primary-color);
      color: var(--primary-color);
    }
    
    &.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    i {
      font-size: 0.9rem;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .mastery-filter-selector {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    
    .filter-label {
      font-size: 0.8rem;
    }
    
    .filter-btn {
      font-size: 0.8rem;
      padding: 5px 10px;
    }
  }
}
</style>