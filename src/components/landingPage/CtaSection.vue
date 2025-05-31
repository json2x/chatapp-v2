<template>
  <section class="cta-section">
    <div class="cta-container">
      <h2 class="cta-title">Start chatting with <span class="app-title-dark">{{ appTitle }}</span> today</h2>
      <p class="cta-description">
        {{ appDescription }}
      </p>
      <div class="cta-buttons">
        <button class="btn-primary">Get Started</button>
        <button class="btn-secondary">Learn More</button>
      </div>
      <div class="floating-elements">
        <div class="floating-element element-1"></div>
        <div class="floating-element element-2"></div>
        <div class="floating-element element-3"></div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../../stores/app-store';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const appDescription = computed(() => appStore.description);
</script>

<style scoped>
.cta-section {
  padding: 6rem 2rem;
  background: linear-gradient(to right, #f9fafb, #f3f4f6);
  position: relative;
  overflow: hidden;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.cta-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.app-title-dark {
  background: linear-gradient(90deg, #0D47A1, #1976D2); /* Gradient from darker blue to primary blue */
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.cta-description {
  font-size: 1.25rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 2.5rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  position: relative;
  z-index: 10; /* Higher z-index to ensure buttons are always on top */
}

.btn-primary {
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 14px rgba(25, 118, 210, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(25, 118, 210, 0.6);
}

.btn-secondary {
  background: transparent;
  color: #1976D2;
  border: 2px solid #1976D2;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(25, 118, 210, 0.1);
}

.floating-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.floating-element {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}

.element-1 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, #1976D2, transparent);
  top: 20%;
  left: 10%;
  animation: float 8s ease-in-out infinite;
}

.element-2 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, #42A5F5, transparent);
  bottom: 15%;
  right: 10%;
  animation: float 10s ease-in-out infinite;
  animation-delay: 1s;
}

.element-3 {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #64B5F6, transparent);
  top: 60%;
  left: 30%;
  animation: float 7s ease-in-out infinite;
  animation-delay: 2s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@media (max-width: 768px) {
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-description {
    font-size: 1rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
}
</style>
