<template>
  <div class="grammar-tabs">
    <button 
      v-for="tab in tabs" 
      :key="tab.id"
      :class="['tab-btn', { active: currentTab === tab.id }]"
      @click="$emit('tab-change', tab.id)"
    >
      <i :class="tab.icon"></i>
      {{ tab.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: string
  name: string
  icon: string
}

defineProps<{
  currentTab: string
  tabs: Tab[]
}>()

defineEmits(['tab-change'])
</script>

<style lang="scss" scoped>
.grammar-tabs {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: var(--border-radius);
  background: white;
  color: var(--text-color);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);

  i {
    font-size: 1.2rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  &.active {
    background-color: var(--primary-color);
    color: white;
  }
}
</style>