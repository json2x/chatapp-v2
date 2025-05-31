<template>
  <section class="about-section" id="about">
    <div class="about-container">
      <h2 class="section-title">About {{ appTitle }}</h2>
      <p class="section-subtitle">The story behind our AI chat platform</p>
      
      <div class="about-content">
        <div class="about-image">
          <div class="image-container">
            <div class="image-placeholder"></div>
            <div class="floating-shape shape-1"></div>
            <div class="floating-shape shape-2"></div>
          </div>
        </div>
        
        <div class="about-text">
          <p>
            {{ appTitle }} was created with a simple mission: to make AI conversations accessible, 
            affordable, and useful for everyone. We believe in the power of AI to transform how 
            we work, learn, and create.
          </p>
          <p>
            Our team of AI enthusiasts and developers built {{ appTitle }} to bridge the gap between 
            cutting-edge AI technology and everyday users. We're committed to an experience that 
            enhances human creativity and productivity, not replaces it.
          </p>
          <p>
            With our prepaid model, we've eliminated subscription fatigue and created a transparent 
            system where you only pay for what you use. No hidden fees, no unexpected charges.
          </p>
          <p>
            Join us on this journey as we continue to improve and expand {{ appTitle }} to meet your needs.
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppStore } from '../../stores/app-store';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
</script>

<style scoped>
.about-section {
  padding: 6rem 2rem;
  background-color: #ffffff;
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-align: center;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  display: inline-block;
  margin-left: auto;
  margin-right: auto;
  width: 100%;
}

.section-subtitle {
  font-size: 1.25rem;
  color: rgba(0, 0, 0, 0.7);
  margin-bottom: 4rem;
  text-align: center;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.about-content {
  display: flex;
  align-items: center;
  gap: 4rem;
}

.about-image {
  flex: 1;
  position: relative;
}

.image-container {
  position: relative;
  padding-bottom: 100%; /* Square aspect ratio */
  overflow: hidden;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transform: perspective(1000px) rotateY(-15deg);
  transition: transform 0.5s ease;
}

.image-container:hover .image-placeholder {
  transform: perspective(1000px) rotateY(-5deg);
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.7;
  z-index: -1;
}

.shape-1 {
  width: 150px;
  height: 150px;
  background: linear-gradient(45deg, rgba(25, 118, 210, 0.2), rgba(66, 165, 245, 0.2));
  top: -30px;
  right: -30px;
  animation: float 8s ease-in-out infinite;
}

.shape-2 {
  width: 100px;
  height: 100px;
  background: linear-gradient(45deg, rgba(66, 165, 245, 0.2), rgba(100, 181, 246, 0.2));
  bottom: -20px;
  left: -20px;
  animation: float 6s ease-in-out infinite;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.about-text {
  flex: 1;
}

.about-text p {
  margin-bottom: 1.5rem;
  line-height: 1.8;
  color: #4b5563;
}

.about-text p:first-child {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1f2937;
}

@media (max-width: 992px) {
  .about-content {
    flex-direction: column;
  }
  
  .about-image, .about-text {
    width: 100%;
  }
  
  .image-container {
    padding-bottom: 75%; /* Adjust aspect ratio for mobile */
    max-width: 500px;
    margin: 0 auto 3rem;
  }
}

@media (max-width: 768px) {
  .section-title {
    font-size: 2rem;
  }
  
  .section-subtitle {
    font-size: 1rem;
  }
}
</style>
