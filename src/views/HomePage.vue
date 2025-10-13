<script setup lang="ts">
import HeroBanner from '../components/home/HeroBanner.vue'
import PublicCoursePromo from '../components/home/PublicCoursePromo.vue'
import QualificationSection from '../components/home/QualificationSection.vue'
import TeacherQualification from '../components/home/TeacherQualification.vue'
</script>

<template>
  <div class="home-page">
    <HeroBanner />
    <PublicCoursePromo />
    <QualificationSection />
    <TeacherQualification />
  </div>
</template>

<style lang="scss" scoped>
.home-page {
  min-height: 100vh;
}
</style>