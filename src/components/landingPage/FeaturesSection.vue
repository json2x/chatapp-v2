<template>
  <section class="features-section" id="features">
    <h2 class="section-title">Why Choose {{ appTitle }}</h2>
    <p class="section-subtitle">Discover what makes our AI chat experience unique</p>
    
    <div class="features-grid">
      <div class="feature-card" v-for="(feature, index) in features" :key="index">
        <div class="feature-icon" :class="`icon-${index + 1}`">
          <span class="icon-inner">{{ feature.icon }}</span>
        </div>
        <h3 class="feature-title">{{ feature.title }}</h3>
        <p class="feature-description">{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app-store';
import { computed } from 'vue';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const features = computed(() => appStore.features);
</script>

<style scoped>
.features-section {
  padding: 6rem 2rem;
  background-color: #f9fafb;
  text-align: center;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
}

.section-subtitle {
  font-size: 1.25rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.icon-inner {
  font-size: 2rem;
  position: relative;
  z-index: 2;
}

.icon-1 {
  background: linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1));
}

.icon-2 {
  background: linear-gradient(135deg, rgba(66, 165, 245, 0.2), rgba(66, 165, 245, 0.1));
}

.icon-3 {
  background: linear-gradient(135deg, rgba(100, 181, 246, 0.2), rgba(100, 181, 246, 0.1));
}

.icon-4 {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1));
}

.icon-5 {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(245, 158, 11, 0.1));
}

.icon-6 {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
}

.feature-icon::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.feature-card:hover .feature-icon::after {
  opacity: 1;
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: #1f2937;
}

.feature-description {
  color: rgba(0, 0, 0, 0.6);
  line-height: 1.6;
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
    max-width: 500px;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
}
</style>
