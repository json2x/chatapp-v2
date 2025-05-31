<template>
  <div class="landing-page">
    <header class="header">
      <div class="logo">{{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span></div>
      <nav class="nav-menu">
        <a href="#hero" class="nav-link" @click.prevent="scrollToSection('hero')">Home</a>
        <a href="#pricing" class="nav-link" @click.prevent="scrollToSection('pricing')">Pricing</a>
        <a href="#features" class="nav-link" @click.prevent="scrollToSection('features')">Features</a>
        <a href="#about" class="nav-link" @click.prevent="scrollToSection('about')">About</a>
      </nav>
      <div class="auth-buttons">
        <button class="login-btn">Log In</button>
        <button class="signup-btn">Sign Up</button>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <div class="menu-icon" :class="{ 'open': mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div class="mobile-menu" :class="{ 'open': mobileMenuOpen }">
        <div class="mobile-logo">{{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span></div>
        <a href="#hero" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('hero')">Home</a>
        <a href="#pricing" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('pricing')">Pricing</a>
        <a href="#features" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('features')">Features</a>
        <a href="#about" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('about')">About</a>
        <button class="mobile-login-btn">Log In</button>
        <button class="mobile-signup-btn">Sign Up</button>
      </div>
    </header>

    <main>
      <HeroSection />
      <CtaSection />
      <PricingSection />
      <FeaturesSection />
      <AboutSection />
    </main>

    <FooterSection />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAppStore } from '../stores/app-store';
import HeroSection from '../components/landingPage/HeroSection.vue';
import CtaSection from '../components/landingPage/CtaSection.vue';
import PricingSection from '../components/landingPage/PricingSection.vue';
import FeaturesSection from '../components/landingPage/FeaturesSection.vue';
import AboutSection from '../components/landingPage/AboutSection.vue';
import FooterSection from '../components/landingPage/FooterSection.vue';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const titleSplitIndex = computed(() => appStore.titleSplitIndex);
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value;
  if (mobileMenuOpen.value) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
};

const closeMobileMenu = () => {
  mobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

const scrollToSectionMobile = (sectionId: string) => {
  closeMobileMenu();
  setTimeout(() => {
    scrollToSection(sectionId);
  }, 300); // Small delay to allow the mobile menu to close first
};
</script>

<style scoped>
.landing-page {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #1f2937;
  line-height: 1.5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.05em;
}

.highlight {
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 0;
  height: 2px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  transition: width 0.3s ease;
}

.nav-link:hover {
  color: #1f2937;
}

.nav-link:hover::after {
  width: 100%;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.login-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  background-color: transparent;
  color: #4b5563;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s ease;
}

.login-btn:hover {
  color: #1f2937;
}

.signup-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 50px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.3);
}

.signup-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.menu-icon {
  width: 24px;
  height: 18px;
  position: relative;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
}

.menu-icon span {
  display: block;
  position: absolute;
  height: 2px;
  width: 100%;
  background: #4b5563;
  border-radius: 2px;
  opacity: 1;
  left: 0;
  transform: rotate(0deg);
  transition: 0.25s ease-in-out;
}

.menu-icon span:nth-child(1) {
  top: 0px;
}

.menu-icon span:nth-child(2) {
  top: 8px;
}

.menu-icon span:nth-child(3) {
  top: 16px;
}

.menu-icon.open span:nth-child(1) {
  top: 8px;
  transform: rotate(135deg);
}

.menu-icon.open span:nth-child(2) {
  opacity: 0;
  left: -60px;
}

.menu-icon.open span:nth-child(3) {
  top: 8px;
  transform: rotate(-135deg);
}

.mobile-menu {
  display: none;
  position: fixed;
  top: 70px;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  padding: 2rem;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  transform: translateY(-100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 999;
}

.mobile-menu.open {
  transform: translateY(0);
  opacity: 1;
}

.mobile-logo {
  font-size: 1.8rem;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin-bottom: 1.5rem;
}

.mobile-nav-link {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.25rem;
}

.mobile-login-btn {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background-color: transparent;
  color: #4b5563;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 1rem;
}

.mobile-signup-btn {
  width: 100%;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  color: white;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
}

main {
  padding-top: 70px;
}

@media (max-width: 768px) {
  .nav-menu, .auth-buttons {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    display: flex;
  }
}
</style>
