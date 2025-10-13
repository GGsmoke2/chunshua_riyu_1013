<template>
  <div class="meaning-section" :class="{ 'revealed': meaningRevealed }">
    <button v-if="!meaningRevealed" class="btn-reveal" @click="$emit('reveal-meaning')">
      <i class="ri-eye-line"></i>
      显示含义
    </button>
    <div v-else class="meaning">
      <p>{{ currentWord.meaning }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  meaningRevealed: boolean
  currentWord: {
    meaning: string
  }
}>()

defineEmits(['reveal-meaning'])
</script>

<style lang="scss" scoped>
.meaning-section {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, #ffffff, #f8f9ff);
  border-radius: var(--border-radius);
  text-align: center;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.03);
  transition: all 0.3s ease;
  
  &.revealed {
    border-left: 5px solid var(--primary-color);
    background: linear-gradient(135deg, #ffffff, #f0f7ff);
  }
  
  .btn-reveal {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 24px;
    border: none;
    border-radius: 25px;
    background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
    color: white;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
    font-size: 1.1rem;
    
    &:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 15px rgba(74, 144, 226, 0.4);
      background: linear-gradient(135deg, var(--primary-dark), #1a6bc2);
    }
    
    &:active {
      transform: translateY(-1px);
    }
    
    i {
      font-size: 1.3rem;
    }
  }
  
  .meaning {
    width: 100%;
    
    p {
      margin-bottom: 0;
      font-size: 1.4rem;
      color: var(--primary-color);
      font-weight: 600;
      line-height: 1.6;
    }
  }
}
</style>