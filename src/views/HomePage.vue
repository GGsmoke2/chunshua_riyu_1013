<script setup lang="ts">
import HeroBanner from '../components/home/HeroBanner.vue'
import FeatureCards from '../components/home/FeatureCards.vue'
import QualificationSection from '../components/home/QualificationSection.vue'
import TeacherQualification from '../components/home/TeacherQualification.vue'
</script>

<template>
  <div class="home-page">
    <HeroBanner />
    <FeatureCards />
    <QualificationSection />
    <TeacherQualification />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}
</style>