<template>
  <footer class="footer-section">
    <div class="footer-container">
      <div class="footer-columns">
        <div class="footer-column">
          <div class="footer-logo">{{ appTitle.slice(0, -titleSplitIndex) }}<span class="highlight">{{ appTitle.slice(-titleSplitIndex) }}</span></div>
          <p class="footer-tagline">{{ appDescription }}</p>
          <div class="social-links">
            <a href="#" class="social-link"><i class="fab fa-twitter"></i></a>
            <a href="#" class="social-link"><i class="fab fa-facebook"></i></a>
            <a href="#" class="social-link"><i class="fab fa-instagram"></i></a>
            <a href="#" class="social-link"><i class="fab fa-linkedin"></i></a>
          </div>
        </div>
        <div class="footer-links-container">
          <div class="footer-links-column" v-for="(column, index) in footerLinks" :key="index">
            <h3 class="column-title">{{ column.title }}</h3>
            <ul class="footer-links">
              <li v-for="(link, linkIndex) in column.links" :key="linkIndex">
                <a href="#" class="footer-link">{{ link }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; {{ copyrightYear }} {{ appTitle }}. All rights reserved.</p>
        <div class="social-links">
          <a href="#" class="social-link" v-for="(icon, index) in socialIcons" :key="index">
            {{ icon }}
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app-store';
import { computed, ref } from 'vue';

const appStore = useAppStore();
const appTitle = computed(() => appStore.title);
const appDescription = computed(() => appStore.description);
const copyrightYear = computed(() => appStore.copyrightYear);
const titleSplitIndex = computed(() => appStore.titleSplitIndex);

const footerLinks = ref([
  {
    title: 'Product',
    links: ['Features', 'Pricing', 'FAQ', 'Testimonials']
  },
  {
    title: 'Company',
    links: ['About Us', 'Careers', 'Blog', 'Contact']
  },
  {
    title: 'Resources',
    links: ['Documentation', 'Support', 'API', 'Privacy Policy']
  }
]);

const socialIcons = ref(['🌐', '📱', '🐦', '📸']);
</script>

<style scoped>
.footer-section {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 4rem 2rem 2rem;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 3rem;
  gap: 2rem;
}

.footer-brand {
  flex: 1;
  min-width: 250px;
}

.footer-logo {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 1rem;
}

.highlight {
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.footer-tagline {
  color: #9ca3af;
  max-width: 250px;
}

.footer-links-container {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
}

.footer-links-column {
  min-width: 150px;
}

.column-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  position: relative;
}

.column-title::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 0;
  width: 30px;
  height: 2px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.3s ease;
  position: relative;
}

.footer-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #1976D2, #42A5F5);
  transition: width 0.3s ease;
}

.footer-link:hover {
  color: #f9fafb;
}

.footer-link:hover::after {
  width: 100%;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(156, 163, 175, 0.2);
}

.copyright {
  color: #9ca3af;
  font-size: 0.9rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);
  color: #f9fafb;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.social-link:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-3px);
}

@media (max-width: 768px) {
  .footer-top {
    flex-direction: column;
  }
  
  .footer-brand {
    margin-bottom: 2rem;
  }
  
  .footer-bottom {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
  }
}
</style>
