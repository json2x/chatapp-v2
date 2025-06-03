<template>
  <section class="hero-section" id="hero" aria-labelledby="hero-title">
    <div class="hero-content">
      <h2 id="hero-title" class="title">{{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span></h2>
      <p class="subtitle">{{ appDescription }}</p>
      <div class="cta-buttons" aria-label="Get started">
        <a href="#features" class="cta-button primary" @click.prevent="scrollToSection('features')" aria-label="Learn about features">Explore Features</a>
        <a href="#pricing" class="cta-button secondary" @click.prevent="scrollToSection('pricing')" aria-label="View pricing plans">View Pricing</a>
      </div>
      <div class="hero-animation" aria-hidden="true">
        <div class="chat-bubble bubble-1">Hey {{ appTitle }}!</div>
        <div class="chat-bubble bubble-2">How can I help today?</div>
        <div class="chat-bubble bubble-3">Tell me about...</div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app-store';
import { computed } from 'vue';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const appDescription = computed(() => appStore.description);
const titleSplitIndex = computed(() => appStore.titleSplitIndex);

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
.hero-section {
  min-height: 90vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #e63946, #1976D2, #ffffff);
  background-size: 400% 400%;
  animation: gradientBackground 15s ease infinite;
}

@keyframes gradientBackground {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.hero-content {
  text-align: center;
  max-width: 800px;
  z-index: 5;
  position: relative;
}

.title {
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1rem;
  letter-spacing: -0.05em;
  animation: fadeIn 1s ease-out;
}

.highlight {
  color: white;
  padding-right: 2px; /* Prevent last letter from being cut off */
  display: inline-block; /* Ensure the padding is applied correctly */
}

.subtitle {
  font-size: 1.5rem;
  color: rgba(0, 0, 0, 0.8); /* Improved contrast for accessibility */
  margin-bottom: 2rem;
  animation: fadeIn 1.5s ease-out;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-animation {
  position: relative;
  height: 200px;
  margin-top: 3rem;
}

.chat-bubble {
  position: absolute;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  animation: bubbleFloat 6s infinite;
}

.bubble-1 {
  left: 10%;
  animation-delay: 0s;
}

.bubble-2 {
  right: 10%;
  top: 20px;
  animation-delay: 2s;
}

.bubble-3 {
  left: 25%;
  top: 80px;
  animation-delay: 4s;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bubbleFloat {
  0%, 100% {
    opacity: 0;
    transform: translateY(20px);
  }
  20%, 80% {
    opacity: 1;
    transform: translateY(0);
  }
}



.cta-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
  animation: fadeIn 2s ease-out;
}

.cta-button {
  padding: 0.75rem 1.5rem;
  border-radius: 50px;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
}

.cta-button:focus {
  outline: 2px solid #1976D2;
  outline-offset: 2px;
}

.cta-button.primary {
  background: linear-gradient(135deg, #1976D2, #42a5f5);
  color: white;
}

.cta-button.secondary {
  background: white;
  color: #1976D2;
  border: 2px solid #1976D2;
}

@media (max-width: 768px) {
  .title {
    font-size: 3rem;
  }
  
  .subtitle {
    font-size: 1.2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .cta-button {
    width: 80%;
    text-align: center;
  }
}
</style>
