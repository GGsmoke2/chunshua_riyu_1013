<template>
  <div class="time-filter-selector">
    <div class="filter-label">时间筛选：</div>
    <div class="filter-options">
      <button 
        v-for="option in timeOptions" 
        :key="option.value"
        :class="['filter-btn', { active: currentTimeFilter === option.value }]"
        @click="selectTimeFilter(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TimeOption {
  value: string
  label: string
}

const props = defineProps<{
  currentTimeFilter: string
}>()

const emit = defineEmits(['change-time-filter'])

const timeOptions: TimeOption[] = [
  { value: 'all', label: '全部' },
  { value: 'recent_day', label: '最近一天' },
  { value: 'recent_week', label: '最近一周' },
  { value: 'recent_month', label: '最近一月' }
  // Removed 'recent_6months' and kept only the first four options as requested
]

const selectTimeFilter = (timeFilter: string) => {
  emit('change-time-filter', timeFilter)
}
</script>

<style lang="scss" scoped>
.time-filter-selector {
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
  }
}

// 响应式设计
@media (max-width: 768px) {
  .time-filter-selector {
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