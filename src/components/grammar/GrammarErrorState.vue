<template>
  <div class="error-state">
    <i class="ri-error-warning-line"></i>
    <p>{{ error }}</p>
    <button class="btn btn-primary" @click="$emit('retry')">重试</button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  error: string
}>()

defineEmits(['retry'])
</script>

<style lang="scss" scoped>
.error-state {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);

  i {
    font-size: 3rem;
    color: var(--error-color);
    margin-bottom: var(--spacing-md);
  }

  p {
    color: var(--text-light);
    margin-bottom: var(--spacing-md);
  }
}
</style>