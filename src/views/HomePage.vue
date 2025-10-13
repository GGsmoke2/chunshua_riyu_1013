<script setup lang="ts">
import HeroBanner from '../components/home/HeroBanner.vue'
import QualificationSection from '../components/home/QualificationSection.vue'
import TeacherQualification from '../components/home/TeacherQualification.vue'
</script>

<template>
  <div class="home-page">
    <HeroBanner />
    <QualificationSection />
    <TeacherQualification />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}
</style>