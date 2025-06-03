<template>
  <div class="landing-page" itemscope itemtype="http://schema.org/SoftwareApplication">
    <header class="header" role="banner">
      <div class="logo">
        <h1 itemprop="name">{{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span></h1>
        <meta itemprop="applicationCategory" content="Chat Application" />
      </div>
      <nav class="nav-menu">
        <a href="#hero" class="nav-link" @click.prevent="scrollToSection('hero')">Home</a>
        <a href="#pricing" class="nav-link" @click.prevent="scrollToSection('pricing')">Pricing</a>
        <a href="#features" class="nav-link" @click.prevent="scrollToSection('features')">Features</a>
        <a href="#about" class="nav-link" @click.prevent="scrollToSection('about')">About</a>
      </nav>
      <div class="auth-buttons">
        <button class="login-btn" @click="login">Log In</button>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <div class="menu-icon" :class="{ open: mobileMenuOpen }">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div class="mobile-menu" :class="{ open: mobileMenuOpen }">
        <div class="mobile-logo">
          {{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span>
        </div>
        <a href="#hero" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('hero')">Home</a>
        <a href="#pricing" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('pricing')">Pricing</a>
        <a href="#features" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('features')">Features</a>
        <a href="#about" class="mobile-nav-link" @click.prevent="scrollToSectionMobile('about')">About</a>
        <button class="mobile-login-btn" @click="login">Log In</button>
      </div>
    </header>
    <main role="main">
      <HeroSection />
      <CtaSection />
      <PricingSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FaqSection />
      <AboutSection />
    </main>

    <FooterSection />
    
    <!-- Structured Data is now injected via script setup -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAppStore } from '../stores/app-store';
import HeroSection from '../components/landingPage/HeroSection.vue';
import CtaSection from '../components/landingPage/CtaSection.vue';
import PricingSection from '../components/landingPage/PricingSection.vue';
import FeaturesSection from '../components/landingPage/FeaturesSection.vue';
import TestimonialsSection from '../components/landingPage/TestimonialsSection.vue';
import FaqSection from '../components/landingPage/FaqSection.vue';
import AboutSection from '../components/landingPage/AboutSection.vue';
import FooterSection from '../components/landingPage/FooterSection.vue';
// Breadcrumb removed as requested
import { login } from '../services/auth';

// We're not using router in this component, so no need to initialize it
const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const titleSplitIndex = computed(() => appStore.titleSplitIndex);
const mobileMenuOpen = ref(false);

// Set page-specific meta tags for SEO
onMounted(() => {
  document.title = `${appTitle.value} - Modern Chat Application`;
  
  // Update meta description dynamically
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'Experience real-time messaging with our modern chat application. Secure, fast, and feature-rich platform for all your communication needs.');
  }
  
  // Inject JSON-LD structured data
  injectStructuredData();
});

// Function to inject structured data
const injectStructuredData = () => {
  // Remove any existing JSON-LD script
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }
  
  // Create and inject new JSON-LD script
  const script = document.createElement('script');
  script.setAttribute('type', 'application/ld+json');
  script.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': appTitle.value,
    'description': 'A modern chat application with real-time messaging capabilities',
    'applicationCategory': 'Chat Application',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'operatingSystem': 'Web'
  });
  
  document.head.appendChild(script);
};

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
  font-family:
    'Inter',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Open Sans',
    'Helvetica Neue',
    sans-serif;
  color: #1f2937;
  line-height: 1.5;

}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  height: 70px;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.logo h1 {
  margin: 0;
  font-size: inherit;
  font-weight: inherit;
  display: inline-block;
}

.highlight {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
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
  background: linear-gradient(90deg, #1976d2, #42a5f5);
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
  border-radius: 50px;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.3);
}

.login-btn:hover {
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
  font-size: 1.25rem;
  font-weight: 700;
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
  border: none;
  border-radius: 8px;
  background: linear-gradient(90deg, #1976d2, #42a5f5);
  color: white;
  font-weight: 500;
  font-size: 1rem;
  margin-top: 0.5rem;
}

main {
  padding-top: 70px;
}



@media (max-width: 768px) {
  .nav-menu,
  .auth-buttons {
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
