<template>
  <div class="loading-state">
    <el-skeleton :rows="4" animated />
  </div>
</template>

<script setup lang="ts">
// 加载状态组件
</script>

<style lang="scss" scoped>
.loading-state {
  text-align: center;
  padding: var(--spacing-xl);
  background-color: white;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--spacing-xl);
}
</style>